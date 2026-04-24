// node --env-file=.env.local scripts/fix-videos-vimeo.mjs
// Substitui YouTube por Vimeo nos backgrounds (hero/categorias/marcas)
// Vimeo não tem o problema de "Playback ID" do YouTube e não tem geo-restriction nas mesmas situações
import { neon } from "@neondatabase/serverless";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SERPER_KEY = "cd997fc33c9a6729c8adef285e619d284e0e5be6";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const sql = neon(process.env.DATABASE_URL);

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Busca vídeos no Vimeo via Serper
async function serperVimeo(query, num = 8) {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ q: `site:vimeo.com ${query}`, num }),
  });
  const data = await res.json();
  return (data.organic || [])
    .map(r => ({ link: r.link, title: r.title || "" }))
    .filter(r => r.link?.match(/vimeo\.com\/\d+/));
}

// Verifica se vídeo do Vimeo permite embedding via oEmbed
async function isVimeoEmbeddable(id) {
  if (!id) return false;
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`,
      { signal: AbortSignal.timeout(6000) }
    );
    return res.status === 200;
  } catch {
    return false;
  }
}

// Gemini ordena vídeos por relevância (priorizando cinematic/não comercial)
async function pickBestVimeo(videos, context) {
  if (!videos.length) return null;
  if (videos.length === 1) {
    const id = videos[0].link?.match(/vimeo\.com\/(\d+)/)?.[1];
    return id && await isVimeoEmbeddable(id) ? id : null;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const list = videos.slice(0, 8).map((v, i) => `${i}: "${v.title}"`).join("\n");
  let order = videos.slice(0, 8).map((_, i) => i);

  try {
    const r = await model.generateContent(
      `Context: ${context}\n\nVimeo videos:\n${list}\n\nOrder from best to worst for a luxury e-commerce background (cinematic, elegant, no text overlays, landscape). Reply only with indices: 0,2,1,3`
    );
    const idxs = r.response.text().match(/\d+/g)?.map(Number).filter(n => n < videos.length);
    if (idxs?.length) order = idxs;
  } catch { /* default order */ }

  for (const idx of order) {
    const id = videos[idx]?.link?.match(/vimeo\.com\/(\d+)/)?.[1];
    if (!id) continue;
    const ok = await isVimeoEmbeddable(id);
    if (ok) return id;
    await sleep(300);
  }
  return null;
}

function makeVimeoBg(id) {
  return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&background=1`;
}

async function main() {
  let fixed = 0, failed = 0;

  // ─── HERO ────────────────────────────────────────────────────────────────────
  console.log("\n═══ HERO VIDEOS ═══\n");

  const heroSearches = [
    {
      key: "hero_video_left",
      queries: [
        "luxury watch timepiece cinematic 4K dark",
        "luxury wristwatch close up elegant background",
        "horology timepiece mechanical watch cinematic",
      ],
      ctx: "Hero left: luxury watches, dark cinematic background, no text",
    },
    {
      key: "hero_video_right",
      queries: [
        "luxury fashion women elegance couture cinematic",
        "luxury perfume fragrance film editorial",
        "high fashion women walking cinematic dark",
      ],
      ctx: "Hero right: luxury fashion/perfume, elegant cinematic background",
    },
  ];

  for (const h of heroSearches) {
    process.stdout.write(`${h.key}: `);
    let bestId = null;
    for (const q of h.queries) {
      const videos = await serperVimeo(q, 6);
      bestId = await pickBestVimeo(videos, h.ctx);
      if (bestId) break;
      await sleep(500);
    }
    if (bestId) {
      const url = makeVimeoBg(bestId);
      await sql`UPDATE site_config SET value = ${url}, "updatedAt" = NOW() WHERE key = ${h.key}`;
      console.log(`✅ vimeo.com/${bestId}`);
      fixed++;
    } else {
      // Fallback: null out → hero usa imagem Cloudinary
      await sql`UPDATE site_config SET value = NULL, "updatedAt" = NOW() WHERE key = ${h.key}`;
      console.log("→ null (fallback imagem)");
      failed++;
    }
    await sleep(700);
  }

  // ─── CATEGORIAS ─────────────────────────────────────────────────────────────
  console.log("\n═══ CATEGORIAS ═══\n");

  const catSearches = {
    relogios: [
      "luxury watch collection cinematic dark 4K",
      "timepiece mechanical watch close up elegant",
      "wristwatch luxury brand campaign film",
    ],
    perfumes: [
      "luxury perfume fragrance campaign film",
      "eau de parfum luxury cinematic editorial",
      "fragrance fashion film luxury",
    ],
    bolsas: [
      "luxury handbag leather goods cinematic editorial",
      "designer bag fashion film luxury",
      "leather bag fashion editorial luxury",
    ],
    sapatos: [
      "luxury shoes heels fashion film cinematic",
      "designer heels fashion editorial",
      "high heels luxury fashion cinematic dark",
    ],
  };

  const categories = await sql`SELECT id, name, slug FROM categories ORDER BY slug`;
  for (const cat of categories) {
    process.stdout.write(`${cat.name}: `);
    const queries = catSearches[cat.slug] || [`${cat.name} luxury cinematic`];
    let bestId = null;
    for (const q of queries) {
      const videos = await serperVimeo(q, 6);
      bestId = await pickBestVimeo(videos, `Category background: ${cat.name}`);
      if (bestId) break;
      await sleep(400);
    }
    if (bestId) {
      const url = makeVimeoBg(bestId);
      await sql`UPDATE categories SET video = ${url} WHERE id = ${cat.id}`;
      console.log(`✅ vimeo.com/${bestId}`);
      fixed++;
    } else {
      await sql`UPDATE categories SET video = NULL WHERE id = ${cat.id}`;
      console.log("→ null (fallback imagem)");
      failed++;
    }
    await sleep(600);
  }

  // ─── MARCAS ─────────────────────────────────────────────────────────────────
  console.log("\n═══ MARCAS ═══\n");

  // Map brand categories to video queries
  const brandCatQueries = {
    relogios: [
      "luxury watch brand cinematic campaign film",
      "timepiece watch campaign film elegant",
    ],
    perfumes: [
      "luxury perfume fragrance brand film campaign",
      "parfum luxury brand editorial film",
    ],
    bolsas: [
      "luxury handbag fashion brand campaign cinematic",
      "leather goods luxury brand film",
    ],
    sapatos: [
      "luxury shoes designer brand film campaign",
      "heels fashion luxury brand film",
    ],
  };

  const brands = await sql`
    SELECT b.id, b.name, c.slug AS cat FROM brands b
    JOIN categories c ON b."categoryId" = c.id
    ORDER BY c.slug, b.name
  `;

  for (let i = 0; i < brands.length; i++) {
    const b = brands[i];
    process.stdout.write(`[${i + 1}/${brands.length}] ${b.name}: `);

    const queries = [
      ...( brandCatQueries[b.cat] || []),
      `${b.name} brand campaign film cinematic`,
    ];

    let bestId = null;
    for (const q of queries) {
      const videos = await serperVimeo(q, 6);
      // filter to videos that might match the brand
      bestId = await pickBestVimeo(videos, `Brand background: ${b.name} (${b.cat})`);
      if (bestId) break;
      await sleep(300);
    }
    if (bestId) {
      const url = makeVimeoBg(bestId);
      await sql`UPDATE brands SET video = ${url} WHERE id = ${b.id}`;
      console.log(`✅ vimeo.com/${bestId}`);
      fixed++;
    } else {
      await sql`UPDATE brands SET video = NULL WHERE id = ${b.id}`;
      console.log("→ null");
      failed++;
    }
    await sleep(600);
  }

  // ─── PRODUTOS — YouTube (independent reviewers) ─────────────────────────────
  console.log("\n═══ PRODUTOS — verificando YouTube ═══\n");
  console.log("Mantendo vídeos YouTube que oEmbed confirma embeddable...\n");

  const products = await sql`
    SELECT p.id, p.name, p.video, b.name AS brand, c.slug AS cat
    FROM products p JOIN brands b ON p."brandId" = b.id JOIN categories c ON p."categoryId" = c.id
    WHERE p.video IS NOT NULL ORDER BY c.slug, b.name, p.name
  `;

  let prodOk = 0, prodFixed = 0, prodNull = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const ytId = p.video?.match(/embed\/([a-zA-Z0-9_-]{11})/)?.[1];
    process.stdout.write(`[${i + 1}/${products.length}] ${p.name.substring(0, 30)}: `);

    if (!ytId) {
      console.log("→ skip (sem ID)");
      continue;
    }

    // Verifica oEmbed — única verificação confiável server-side
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`);
    if (res.status === 200) {
      const d = await res.json();
      // Se for de canal OFICIAL de marca, substitui por busca de reviewer
      const isOfficialChannel = /rolex|patek|omega|cartier|chanel|dior|lv|louis vuitton|hermes|hermès|gucci|prada|givenchy|jimmy choo|louboutin|valentino|ferragamo|balenciaga|bottega|bvlgari|bulgari|versace|tod'?s|saint laurent|YSL/i.test(d.author_name || "");
      if (!isOfficialChannel) {
        console.log(`✅ OK (${d.author_name?.substring(0, 25)})`);
        prodOk++;
        await sleep(200);
        continue;
      }
      console.log(`⚠️ oficial (${d.author_name?.substring(0, 20)}) → buscando reviewer...`);
    } else {
      console.log("❌ oEmbed 401 → buscando alternativa...");
    }

    // Busca alternativa: reviewer independente
    try {
      const query = `${p.brand} ${p.name} review unboxing -official`;
      const vidRes = await fetch("https://google.serper.dev/videos", {
        method: "POST",
        headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ q: query, num: 8 }),
      });
      const vidData = await vidRes.json();
      const candidates = (vidData.videos || []).filter(v => v.link?.includes("youtube.com"));

      let newId = null;
      for (const v of candidates) {
        const id = v.link?.match(/[?&]v=([a-zA-Z0-9_-]{11})/)?.[1];
        if (!id) continue;
        const check = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
        if (check.status === 200) {
          const info = await check.json();
          const isOfficial = /rolex|patek|omega|cartier|chanel|dior|lv|louis vuitton|hermes|hermès|gucci|prada|givenchy|jimmy choo|louboutin|valentino|ferragamo|balenciaga|bottega|bvlgari|bulgari|versace|versace|saint laurent/i.test(info.author_name || "");
          if (!isOfficial) { newId = id; break; }
        }
        await sleep(200);
      }

      if (newId) {
        const url = `https://www.youtube-nocookie.com/embed/${newId}`;
        await sql`UPDATE products SET video = ${url}, "updatedAt" = NOW() WHERE id = ${p.id}`;
        console.log(`  → youtube.com/watch?v=${newId}`);
        prodFixed++;
      } else {
        await sql`UPDATE products SET video = NULL, "updatedAt" = NOW() WHERE id = ${p.id}`;
        console.log("  → null (sem alternativa)");
        prodNull++;
      }
    } catch (e) {
      console.log(`  ❌ ${e.message}`);
    }
    await sleep(500);
  }

  console.log(`
═══════════════════════════════════════════
✅ Vimeo backgrounds: ${fixed} setados, ${failed} null (fallback imagem)
✅ Produtos YouTube: ${prodOk} OK, ${prodFixed} corrigidos, ${prodNull} removidos
═══════════════════════════════════════════
`);

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
