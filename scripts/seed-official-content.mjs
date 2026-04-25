// node --env-file=.env.local scripts/seed-official-content.mjs
// Para cada produto: scrapa site oficial + Fragrantica (perfumes), gera descrição rica PT-BR com Gemini
import { neon } from "@neondatabase/serverless";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SERPER_KEY = "cd997fc33c9a6729c8adef285e619d284e0e5be6";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const sql = neon(process.env.DATABASE_URL);

const SUPERCLONE_SUFFIX = " superclone replica alta qualidade superclone";

const BRAND_DOMAINS = {
  "Rolex": "rolex.com", "Patek Philippe": "patek.com",
  "Audemars Piguet": "audemarspiguet.com", "Omega": "omegawatches.com",
  "Cartier": "cartier.com", "TAG Heuer": "tagheuer.com",
  "IWC": "iwc.com", "Jaeger Lecoultre": "jaeger-lecoultre.com",
  "Tudor": "tudorwatch.com", "Chanel": "chanel.com",
  "Hermès": "hermes.com", "Gucci": "gucci.com",
  "Louis Vuitton": "louisvuitton.com", "Prada": "prada.com",
  "Bottega Veneta": "bottegaveneta.com", "Bvlgari": "bulgari.com",
  "Celine": "celine.com", "Creed": "creedperfume.com",
  "Dior": "dior.com", "Guerlain": "guerlain.com",
  "Maison Francis Kurkdjian": "maisonfranciskurkdjian.com",
  "Parfums de Marly": "parfumsdemarly.com",
  "Penhaligon's": "penhaligons.com", "Tom Ford": "tomford.com",
  "Yves Saint Laurent": "yslbeauty.com",
  "Christian Louboutin": "christianlouboutin.com",
  "Jimmy Choo": "jimmychoo.com", "Manolo Blahnik": "manoloblahnik.com",
  "Salvatore Ferragamo": "ferragamo.com",
};

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Busca URL oficial via Serper
async function findOfficialUrl(brand, productName) {
  const domain = BRAND_DOMAINS[brand];
  if (!domain) return null;
  const clean = productName
    .replace(/\b(EDP|EDT|ml|mm|\d+ml|\d+mm)\b/gi, "")
    .trim().substring(0, 60);
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: `site:${domain} "${clean}"`, num: 3 }),
    });
    const data = await res.json();
    const r = (data.organic || [])[0];
    return r ? { url: r.link, snippet: r.snippet || "" } : null;
  } catch { return null; }
}

// Busca página no Fragrantica via Serper
async function findFragranticaUrl(brand, productName) {
  const clean = productName.replace(/\b(EDP|EDT|ml|\d+ml)\b/gi, "").trim().substring(0, 60);
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: `site:fragrantica.com "${brand}" "${clean}"`, num: 3 }),
    });
    const data = await res.json();
    return (data.organic || [])[0]?.link || null;
  } catch { return null; }
}

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";

// Scrape página genérica — extrai meta description, og:description, vídeos
async function scrapePage(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    const metaDesc =
      html.match(/<meta\s+name=["']description["'][^>]+content=["']([^"']{10,})/i)?.[1] ||
      html.match(/<meta\s+content=["']([^"']{10,})["'][^>]+name=["']description["']/i)?.[1] || "";
    const ogDesc =
      html.match(/<meta\s+property=["']og:description["'][^>]+content=["']([^"']{10,})/i)?.[1] ||
      html.match(/<meta\s+content=["']([^"']{10,})["'][^>]+property=["']og:description["']/i)?.[1] || "";
    const description = (metaDesc || ogDesc).trim();

    // Vídeos
    const videoUrls = [];
    for (const m of html.matchAll(/<(?:video|source)[^>]+src=["']([^"']+\.(?:mp4|webm)[^"']*)/gi))
      if (m[1].startsWith("http")) videoUrls.push(m[1]);
    for (const m of html.matchAll(/player\.vimeo\.com\/video\/(\d+)/g))
      videoUrls.push(`https://player.vimeo.com/video/${m[1]}`);
    for (const m of html.matchAll(/(?:youtube(?:-nocookie)?\.com\/embed\/)([a-zA-Z0-9_-]{11})/g))
      videoUrls.push(`https://www.youtube-nocookie.com/embed/${m[1]}`);

    const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim() || "";
    const paras = [...html.matchAll(/<p[^>]*>([^<]{50,400})<\/p>/g)]
      .map(m => m[1].replace(/<[^>]+>/g, "").trim())
      .slice(0, 4).join(" ");

    return {
      description,
      videoUrls: [...new Set(videoUrls)].slice(0, 3),
      pageText: [h1, paras].filter(Boolean).join(". ").substring(0, 800),
    };
  } catch { return null; }
}

// Scrape Fragrantica — extrai acordes, notas, gênero, descrição
async function scrapeFragrantica(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Gênero — aparece como "for women", "for men", "for women and men"
    const genderMatch = html.match(/for\s+(women\s+and\s+men|women|men)\b/i);
    const gender = genderMatch
      ? genderMatch[1].toLowerCase() === "women" ? "Feminino"
        : genderMatch[1].toLowerCase() === "men" ? "Masculino"
        : "Unissex"
      : "";

    // Acordes principais — estão em divs com classe "accord-bar" ou similar
    const accords = [];
    for (const m of html.matchAll(/class=["'][^"']*accord[^"']*["'][^>]*>[\s\S]*?<div[^>]*>([^<]{3,30})<\/div>/gi))
      if (m[1].trim()) accords.push(m[1].trim());
    // Fallback: busca spans dentro de section de acordes
    if (!accords.length) {
      for (const m of html.matchAll(/<span[^>]*>([a-zA-Z\s]{4,20})<\/span>/g)) {
        const t = m[1].trim();
        if (t.length > 3 && t.length < 25) accords.push(t);
      }
    }

    // Notas — top/heart/base notes
    const topMatch = html.match(/top\s+notes?[\s\S]{0,200}?(<[^>]+>[\s\S]*?<\/[^>]+>){1,10}/i);
    const heartMatch = html.match(/(?:middle|heart)\s+notes?[\s\S]{0,200}?(<[^>]+>[\s\S]*?<\/[^>]+>){1,10}/i);
    const baseMatch = html.match(/base\s+notes?[\s\S]{0,200}?(<[^>]+>[\s\S]*?<\/[^>]+>){1,10}/i);

    function extractNotes(segment) {
      if (!segment) return [];
      return [...segment.matchAll(/title=["']([^"']{3,30})["']/g)].map(m => m[1]).slice(0, 6);
    }

    const topNotes = extractNotes(topMatch?.[0]);
    const heartNotes = extractNotes(heartMatch?.[0]);
    const baseNotes = extractNotes(baseMatch?.[0]);

    // Descrição editorial do Fragrantica
    const descMatch = html.match(/<div[^>]*itemprop=["']description["'][^>]*>([\s\S]{50,1500}?)<\/div>/i);
    const fragrDesc = descMatch?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "";

    return {
      gender,
      accords: [...new Set(accords)].slice(0, 8),
      topNotes,
      heartNotes,
      baseNotes,
      description: fragrDesc.substring(0, 600),
    };
  } catch { return null; }
}

// Gemini — gera descrição rica PT-BR
async function writeRichDescription(product, brand, cat, data) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const catPT = {
    relogios: "relógio de luxo", perfumes: "perfume de luxo",
    bolsas: "bolsa de luxo", sapatos: "sapato de luxo",
  }[cat] || "produto de luxo";

  let contextBlock = "";

  if (cat === "perfumes" && data.fragrantica) {
    const f = data.fragrantica;
    contextBlock = [
      f.gender && `Gênero: ${f.gender}`,
      f.accords?.length && `Acordes principais: ${f.accords.join(", ")}`,
      f.topNotes?.length && `Notas de topo: ${f.topNotes.join(", ")}`,
      f.heartNotes?.length && `Notas de coração: ${f.heartNotes.join(", ")}`,
      f.baseNotes?.length && `Notas de fundo: ${f.baseNotes.join(", ")}`,
      f.description && `Descrição Fragrantica: ${f.description}`,
      data.official?.description && `Descrição oficial: ${data.official.description}`,
      data.official?.snippet && `Trecho do site oficial: ${data.official.snippet}`,
    ].filter(Boolean).join("\n");
  } else {
    contextBlock = [
      data.official?.description && `Descrição oficial: ${data.official.description}`,
      data.official?.snippet && `Trecho do site: ${data.official.snippet}`,
      data.official?.pageText && `Texto da página: ${data.official.pageText.substring(0, 500)}`,
    ].filter(Boolean).join("\n\n");
  }

  const perfumesExtra = cat === "perfumes" ? `
- Mencione o gênero (masculino/feminino/unissex) de forma elegante
- Descreva a pirâmide olfativa com as notas de topo, coração e base
- Descreva os acordes principais e como evoluem na pele
- Mencione ocasião ideal de uso, sillage, fixação` : "";

  const prompt = `Você é um redator de luxo para uma boutique premium brasileira.

Produto: ${product}
Marca: ${brand}
Categoria: ${catPT}

Dados coletados:
${contextBlock || "(sem dados — use seu conhecimento especializado sobre este produto)"}

Escreva uma descrição de produto em PORTUGUÊS BRASILEIRO com:
- 3 a 5 parágrafos bem desenvolvidos (280-420 palavras)
- Tom sofisticado, aspiracional e sensorial — como uma maison europeia de prestígio
- Mencione materiais, artesanato, herança da marca, detalhes técnicos/estéticos específicos${perfumesExtra}
- NÃO mencione "replica", "cópia", "superclone", preço ou disponibilidade
- NÃO use asteriscos, markdown, bullet points — apenas parágrafos corridos
- Comece diretamente com a descrição, sem título

Responda SOMENTE com a descrição.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch { return null; }
}

async function isVimeoOk(id) {
  try {
    const r = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`, { signal: AbortSignal.timeout(5000) });
    return r.status === 200;
  } catch { return false; }
}

async function isYtOk(id) {
  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`, { signal: AbortSignal.timeout(5000) });
    return r.status === 200;
  } catch { return false; }
}

async function bestVideo(urls) {
  for (const url of urls) {
    const vmId = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
    if (vmId && await isVimeoOk(vmId)) return `https://player.vimeo.com/video/${vmId}`;
    const ytId = url.match(/embed\/([a-zA-Z0-9_-]{11})/)?.[1];
    if (ytId && await isYtOk(ytId)) return `https://www.youtube-nocookie.com/embed/${ytId}`;
    if (/\.mp4(\?|$)/i.test(url)) return url;
    await sleep(200);
  }
  return null;
}

async function main() {
  const products = await sql`
    SELECT p.id, p.name, p.video, b.name AS brand, c.slug AS cat
    FROM products p
    JOIN brands b ON p."brandId" = b.id
    JOIN categories c ON p."categoryId" = c.id
    ORDER BY c.slug, b.name, p.name
  `;

  console.log(`\n📦 ${products.length} produtos — coletando conteúdo oficial...\n`);
  let descUpdated = 0, vidUpdated = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`\n[${i + 1}/${products.length}] ${p.brand} — ${p.name}`);

    const data = {};

    // ─── OFICIAL ──────────────────────────────────────────────────────────────
    const found = await findOfficialUrl(p.brand, p.name);
    if (found) {
      console.log(`  🔗 oficial: ${found.url.substring(0, 75)}`);
      const scraped = await scrapePage(found.url);
      data.official = { ...scraped, snippet: found.snippet };
    } else {
      console.log(`  ⚠️ URL oficial não encontrada`);
    }
    await sleep(400);

    // ─── FRAGRANTICA (só perfumes) ────────────────────────────────────────────
    if (p.cat === "perfumes") {
      const fUrl = await findFragranticaUrl(p.brand, p.name);
      if (fUrl) {
        console.log(`  🌸 fragrantica: ${fUrl.substring(0, 75)}`);
        data.fragrantica = await scrapeFragrantica(fUrl);
        if (data.fragrantica) {
          const { gender, accords, topNotes, heartNotes, baseNotes } = data.fragrantica;
          if (gender) console.log(`     Gênero: ${gender}`);
          if (accords?.length) console.log(`     Acordes: ${accords.slice(0,5).join(", ")}`);
          if (topNotes?.length) console.log(`     Topo: ${topNotes.join(", ")}`);
          if (heartNotes?.length) console.log(`     Coração: ${heartNotes.join(", ")}`);
          if (baseNotes?.length) console.log(`     Base: ${baseNotes.join(", ")}`);
        }
      } else {
        console.log(`  ⚠️ Fragrantica não encontrado`);
      }
      await sleep(400);
    }

    // ─── GEMINI → descrição rica PT-BR ────────────────────────────────────────
    const richDesc = await writeRichDescription(p.name, p.brand, p.cat, data);
    await sleep(500);

    if (richDesc && richDesc.length > 100) {
      const finalDesc = richDesc + SUPERCLONE_SUFFIX;
      await sql`UPDATE products SET description = ${finalDesc}, "updatedAt" = NOW() WHERE id = ${p.id}`;
      console.log(`  ✅ ${richDesc.length} chars`);
      descUpdated++;
    } else {
      console.log(`  ⚠️ Gemini falhou — mantendo descrição`);
    }

    // ─── VÍDEO do site oficial ────────────────────────────────────────────────
    const officialVideos = data.official?.videoUrls || [];
    if (officialVideos.length > 0) {
      const newVid = await bestVideo(officialVideos);
      if (newVid && newVid !== p.video) {
        await sql`UPDATE products SET video = ${newVid}, "updatedAt" = NOW() WHERE id = ${p.id}`;
        console.log(`  🎬 vídeo oficial: ${newVid.substring(0, 65)}`);
        vidUpdated++;
      }
    }

    await sleep(500);
  }

  console.log(`
═══════════════════════════════════════════
✅ Descrições atualizadas: ${descUpdated}/${products.length}
🎬 Vídeos oficiais encontrados: ${vidUpdated}
═══════════════════════════════════════════
`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
