// node --env-file=.env.local scripts/seed-rich-descriptions.mjs
import { neon } from "@neondatabase/serverless";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SERPER_KEY = "cd997fc33c9a6729c8adef285e619d284e0e5be6";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const sql = neon(process.env.DATABASE_URL);
const SUFFIX = " superclone replica alta qualidade superclone";
const sleep = ms => new Promise(r => setTimeout(r, ms));

const BRAND_DOMAINS = {
  "Rolex":"rolex.com","Patek Philippe":"patek.com","Audemars Piguet":"audemarspiguet.com",
  "Omega":"omegawatches.com","Cartier":"cartier.com","TAG Heuer":"tagheuer.com",
  "IWC":"iwc.com","Jaeger Lecoultre":"jaeger-lecoultre.com","Tudor":"tudorwatch.com",
  "Chanel":"chanel.com","Hermès":"hermes.com","Gucci":"gucci.com",
  "Louis Vuitton":"louisvuitton.com","Prada":"prada.com","Bottega Veneta":"bottegaveneta.com",
  "Bvlgari":"bulgari.com","Celine":"celine.com","Creed":"creedperfume.com",
  "Dior":"dior.com","Guerlain":"guerlain.com","Maison Francis Kurkdjian":"maisonfranciskurkdjian.com",
  "Parfums de Marly":"parfumsdemarly.com","Penhaligon's":"penhaligons.com",
  "Tom Ford":"tomford.com","Yves Saint Laurent":"yslbeauty.com",
  "Christian Louboutin":"christianlouboutin.com","Jimmy Choo":"jimmychoo.com",
  "Manolo Blahnik":"manoloblahnik.com","Salvatore Ferragamo":"ferragamo.com",
};

const EDITORIAL = {
  relogios: ["hodinkee.com","chrono24.com","watchpro.com","ablogtowatch.com"],
  perfumes: ["fragrantica.com","basenotes.net","parfumo.com"],
  bolsas:   ["purseblog.com","whowhatwear.com","vogue.com"],
  sapatos:  ["vogue.com","whowhatwear.com","harpersbazaar.com"],
};

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";

async function serperSearch(q, num = 5) {
  try {
    const r = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q, num }),
    });
    return (await r.json()).organic || [];
  } catch { return []; }
}

async function scrapeMeta(url) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(10000) });
    if (!r.ok) return "";
    const html = await r.text();
    const desc =
      html.match(/<meta\s+name=["']description["'][^>]+content=["']([^"']{20,})/i)?.[1] ||
      html.match(/<meta\s+property=["']og:description["'][^>]+content=["']([^"']{20,})/i)?.[1] || "";
    const paras = [...html.matchAll(/<p[^>]*>([^<]{60,500})<\/p>/g)]
      .map(m => m[1].replace(/<[^>]+>/g,"").trim()).slice(0,3).join(" ");
    return [desc, paras].filter(Boolean).join(" ").substring(0,600);
  } catch { return ""; }
}

async function scrapeFragrantica(url) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(10000) });
    if (!r.ok) return null;
    const html = await r.text();
    const gender = html.match(/for\s+(women\s+and\s+men|women|men)\b/i)?.[1];
    const genderPT = !gender ? "" : gender.toLowerCase()==="women" ? "Feminino" : gender.toLowerCase()==="men" ? "Masculino" : "Unissex";
    const accords = [...html.matchAll(/class=["'][^"']*accord[^"']*["'][^>]*>[\s\S]*?<div[^>]*>([^<]{3,30})<\/div>/gi)]
      .map(m=>m[1].trim()).filter(Boolean).slice(0,6);
    const extractNotes = seg => seg ? [...seg.matchAll(/title=["']([^"']{3,30})["']/g)].map(m=>m[1]).slice(0,5) : [];
    const topNotes = extractNotes(html.match(/top\s+notes?[\s\S]{0,200}?(<[^>]+>[\s\S]*?<\/[^>]+>){1,8}/i)?.[0]);
    const heartNotes = extractNotes(html.match(/(?:middle|heart)\s+notes?[\s\S]{0,200}?(<[^>]+>[\s\S]*?<\/[^>]+>){1,8}/i)?.[0]);
    const baseNotes = extractNotes(html.match(/base\s+notes?[\s\S]{0,200}?(<[^>]+>[\s\S]*?<\/[^>]+>){1,8}/i)?.[0]);
    const desc = html.match(/<div[^>]*itemprop=["']description["'][^>]*>([\s\S]{50,1000}?)<\/div>/i)?.[1]
      ?.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim() || "";
    return { gender: genderPT, accords, topNotes, heartNotes, baseNotes, desc: desc.substring(0,500) };
  } catch { return null; }
}

async function gatherContext(p) {
  const domain = BRAND_DOMAINS[p.brand];
  const name = p.name.replace(/\b(EDP|EDT|ml|mm|\d+ml|\d+mm)\b/gi,"").trim().substring(0,55);
  const parts = [];

  // 1. Site oficial — URL + scrape
  if (domain) {
    const res = await serperSearch(`site:${domain} "${name}"`, 3);
    await sleep(300);
    if (res[0]) {
      parts.push(`Site oficial: ${res[0].snippet || ""}`);
      const scraped = await scrapeMeta(res[0].link);
      if (scraped) parts.push(`Conteúdo oficial: ${scraped}`);
      await sleep(300);
    }
  }

  // 2. Fontes editoriais da categoria
  const sites = EDITORIAL[p.cat] || [];
  if (p.cat === "perfumes" && sites[0]) {
    const fRes = await serperSearch(`site:${sites[0]} "${p.brand}" "${name}"`, 2);
    await sleep(300);
    if (fRes[0]) {
      const fData = await scrapeFragrantica(fRes[0].link);
      await sleep(300);
      if (fData) {
        if (fData.gender) parts.push(`Gênero: ${fData.gender}`);
        if (fData.accords.length) parts.push(`Acordes: ${fData.accords.join(", ")}`);
        if (fData.topNotes.length) parts.push(`Notas de topo: ${fData.topNotes.join(", ")}`);
        if (fData.heartNotes.length) parts.push(`Notas de coração: ${fData.heartNotes.join(", ")}`);
        if (fData.baseNotes.length) parts.push(`Notas de base: ${fData.baseNotes.join(", ")}`);
        if (fData.desc) parts.push(`Fragrantica: ${fData.desc}`);
      }
    }
    // Basenotes
    const bnRes = await serperSearch(`site:basenotes.net "${p.brand}" "${name}"`, 2);
    await sleep(300);
    if (bnRes[0]) parts.push(`Basenotes: ${bnRes[0].snippet || ""}`);
  } else if (sites.length) {
    const siteFilter = sites.slice(0,3).map(s=>`site:${s}`).join(" OR ");
    const editRes = await serperSearch(`"${p.brand}" "${name}" (${siteFilter})`, 5);
    await sleep(300);
    editRes.forEach(r => { if (r.snippet) parts.push(`${r.displayLink || ""}: ${r.snippet}`); });
  }

  // 3. Busca geral — história, artesanato, materiais
  const genRes = await serperSearch(`"${p.brand}" "${name}" history craftsmanship materials design`, 5);
  await sleep(300);
  genRes.slice(0,4).forEach(r => { if (r.snippet) parts.push(r.snippet); });

  return parts.filter(Boolean).join("\n\n").substring(0, 2500);
}

async function generateDescription(p, context, attempt = 0) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const catPT = { relogios:"relógio de luxo", perfumes:"perfume de luxo", bolsas:"bolsa de luxo", sapatos:"sapato de luxo" }[p.cat] || "produto de luxo";

  const perfumesExtra = p.cat === "perfumes" ? `
- Parágrafo dedicado à pirâmide olfativa: notas de topo, coração e base
- Descreva os acordes e como o perfume evolui na pele ao longo do tempo
- Mencione sillage, fixação e ocasiões de uso ideais` : "";

  const prompt = `Você é um redator sênior de luxo para uma boutique premium brasileira.

Produto: ${p.name}
Marca: ${p.brand}
Categoria: ${catPT}

Informações coletadas de múltiplas fontes editoriais:
${context || "(use seu conhecimento especializado sobre este produto icônico)"}

Escreva uma descrição em PORTUGUÊS BRASILEIRO com:
- 4 a 6 parágrafos bem desenvolvidos (400 a 600 palavras no total)
- Parágrafo 1: herança e posicionamento da marca, contexto histórico deste modelo
- Parágrafo 2: materiais, artesanato e detalhes técnicos/estéticos ESPECÍFICOS e reais
- Parágrafo 3: história do design, inspiração, evolução do modelo
- Parágrafo 4: experiência de uso, sensações, o que torna este produto único${perfumesExtra}
- Tom sofisticado e aspiracional — como editorial da Vogue ou texto de uma maison europeia de prestígio
- Use nomes técnicos reais (movimentos, couros, metais, ingredientes) quando disponíveis
- NÃO mencione "replica", "cópia", "superclone", preço ou disponibilidade
- NÃO use asteriscos, markdown, bullets ou listas — apenas parágrafos corridos fluentes
- Comece diretamente com a descrição, sem título ou cabeçalho

Responda SOMENTE com a descrição em português.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    if (e.status === 429 && attempt < 5) {
      const retryMatch = e.message?.match(/retryDelay":"(\d+)s"/);
      const delay = retryMatch ? (parseInt(retryMatch[1]) + 2) * 1000 : (15 + attempt * 10) * 1000;
      console.log(`    ⏳ Rate limit, aguardando ${delay/1000}s...`);
      await sleep(delay);
      return generateDescription(p, context, attempt + 1);
    }
    console.log(`    ⚠️ Gemini: ${e.message?.substring(0,80)}`);
    return null;
  }
}

async function main() {
  const products = await sql`
    SELECT p.id, p.name, b.name AS brand, c.slug AS cat
    FROM products p
    JOIN brands b ON p."brandId" = b.id
    JOIN categories c ON p."categoryId" = c.id
    WHERE p.active = true
    ORDER BY c.slug, b.name, p.name
  `;

  console.log(`\n📦 ${products.length} produtos — gerando descrições ricas...\n`);
  let updated = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`\n[${i+1}/${products.length}] ${p.brand} — ${p.name.substring(0,45)}`);

    const context = await gatherContext(p);
    console.log(`  📚 ${context.length} chars de contexto coletados`);

    const desc = await generateDescription(p, context);
    await sleep(600);

    if (desc && desc.length > 200) {
      const final = desc + SUFFIX;
      await sql`UPDATE products SET description = ${final}, "updatedAt" = NOW() WHERE id = ${p.id}`;
      console.log(`  ✅ ${desc.length} chars (${desc.split(" ").length} palavras)`);
      updated++;
    } else {
      console.log(`  ⚠️ falhou`);
    }

    await sleep(400);
  }

  console.log(`\n✅ ${updated}/${products.length} descrições atualizadas\n`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
