// node --env-file=.env.local scripts/seed-videos.mjs
// Popula campos de vídeo para produtos, marcas, categorias e hero via Serper + Gemini
import { neon } from "@neondatabase/serverless";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SERPER_KEY = "cd997fc33c9a6729c8adef285e619d284e0e5be6";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const sql = neon(process.env.DATABASE_URL);

async function serperVideos(query, num = 8) {
  const res = await fetch("https://google.serper.dev/videos", {
    method: "POST",
    headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num }),
  });
  const data = await res.json();
  return (data.videos || []).filter(v => v.link && v.link.includes("youtube.com"));
}

function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function makeProductEmbedUrl(videoId) {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

function makeBackgroundEmbedUrl(videoId) {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&rel=0`;
}

async function pickBestVideo(videos, context) {
  if (!videos.length) return null;
  if (videos.length === 1) return videos[0].link;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const list = videos
    .slice(0, 8)
    .map((v, i) => `${i}: "${v.title}" – canal: ${v.channel || "?"} – duração: ${v.duration || "?"}`)
    .join("\n");

  try {
    const result = await model.generateContent(
      `Context: ${context}\n\nYouTube videos found:\n${list}\n\nWhich video index (0-${Math.min(videos.length - 1, 7)}) is most relevant, credible and official for this context? Prefer: official brand channels, cinematic quality, product showcases. Avoid: hauls, fakes reviews, click-bait thumbnails, unrelated content. Reply ONLY with the number.`
    );
    const idx = parseInt(result.response.text().trim());
    return videos[isNaN(idx) ? 0 : Math.min(idx, videos.length - 1)].link;
  } catch {
    return videos[0].link;
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  // ─── 1. HERO VIDEOS ─────────────────────────────────────────────────────────
  console.log("\n═══ HERO VIDEOS ═══\n");

  const heroQueries = [
    { key: "hero_video_left", query: "luxury watch collection cinematic 4K film 2024", label: "Relógios hero" },
    { key: "hero_video_right", query: "luxury perfume fragrance cinematic commercial 4K 2024", label: "Perfumes hero" },
  ];

  for (const h of heroQueries) {
    console.log(`${h.label}...`);
    try {
      const videos = await serperVideos(h.query, 8);
      const best = await pickBestVideo(videos, h.label);
      const id = extractYouTubeId(best);
      if (id) {
        const url = makeBackgroundEmbedUrl(id);
        await sql`
          INSERT INTO site_config (key, value, "updatedAt") VALUES (${h.key}, ${url}, NOW())
          ON CONFLICT (key) DO UPDATE SET value = ${url}, "updatedAt" = NOW()
        `;
        console.log(`  ✅ ${url}`);
      } else {
        console.log(`  ⚠️ ID não extraído de: ${best}`);
      }
    } catch (e) {
      console.log(`  ❌ ${e.message}`);
    }
    await sleep(700);
  }

  // ─── 2. CATEGORIAS ──────────────────────────────────────────────────────────
  console.log("\n═══ CATEGORIAS ═══\n");

  const categories = await sql`SELECT id, name, slug FROM categories ORDER BY slug`;
  const catQueries = {
    relogios: "luxury watches collection cinematic showcase 4K official",
    perfumes: "luxury perfume fragrance editorial film 4K official",
    bolsas: "luxury handbags leather goods cinematic 4K official",
    sapatos: "luxury designer shoes heels cinematic 4K official",
  };

  for (const cat of categories) {
    console.log(`${cat.name}...`);
    try {
      const q = catQueries[cat.slug] || `${cat.name} luxury cinematic film 4K`;
      const videos = await serperVideos(q, 8);
      const best = await pickBestVideo(videos, `Category hero background: ${cat.name}`);
      const id = extractYouTubeId(best);
      if (id) {
        const url = makeBackgroundEmbedUrl(id);
        await sql`UPDATE categories SET video = ${url} WHERE id = ${cat.id}`;
        console.log(`  ✅ ${url}`);
      } else {
        console.log(`  ⚠️ Sem vídeo encontrado`);
      }
    } catch (e) {
      console.log(`  ❌ ${e.message}`);
    }
    await sleep(700);
  }

  // ─── 3. MARCAS ──────────────────────────────────────────────────────────────
  console.log("\n═══ MARCAS ═══\n");

  const brands = await sql`
    SELECT b.id, b.name, b.slug, c.slug AS cat_slug, c.name AS cat_name
    FROM brands b JOIN categories c ON b."categoryId" = c.id
    ORDER BY c.slug, b.name
  `;

  for (let i = 0; i < brands.length; i++) {
    const b = brands[i];
    console.log(`[${i + 1}/${brands.length}] ${b.name} (${b.cat_slug})`);
    try {
      const q = `${b.name} official brand film campaign cinematic 2024`;
      const videos = await serperVideos(q, 8);
      const best = await pickBestVideo(videos, `Brand hero background: ${b.name} (${b.cat_name})`);
      const id = extractYouTubeId(best);
      if (id) {
        const url = makeBackgroundEmbedUrl(id);
        await sql`UPDATE brands SET video = ${url} WHERE id = ${b.id}`;
        console.log(`  ✅ ${url}`);
      } else {
        console.log(`  ⚠️ Sem vídeo`);
      }
    } catch (e) {
      console.log(`  ❌ ${e.message}`);
    }
    await sleep(700);
  }

  // ─── 4. PRODUTOS ────────────────────────────────────────────────────────────
  console.log("\n═══ PRODUTOS ═══\n");

  const products = await sql`
    SELECT p.id, p.name, p.slug, p.video, b.name AS brand, c.slug AS cat_slug
    FROM products p
    JOIN brands b ON p."brandId" = b.id
    JOIN categories c ON p."categoryId" = c.id
    ORDER BY c.slug, b.name, p.name
  `;

  console.log(`Total: ${products.length} produtos\n`);

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`[${i + 1}/${products.length}] ${p.brand} — ${p.name}`);
    try {
      // Usar query em inglês para melhores resultados no YouTube
      const q = `${p.brand} ${p.name} official review unboxing`;
      const videos = await serperVideos(q, 8);

      if (!videos.length) {
        // Fallback: query mais simples
        const fallbackVideos = await serperVideos(`${p.brand} ${p.name} video`, 6);
        if (!fallbackVideos.length) {
          console.log(`  ⚠️ Sem vídeos encontrados`);
          await sleep(500);
          continue;
        }
        videos.push(...fallbackVideos);
      }

      const best = await pickBestVideo(videos, `Product: ${p.brand} ${p.name} (${p.cat_slug})`);
      const id = extractYouTubeId(best);
      if (id) {
        const url = makeProductEmbedUrl(id);
        await sql`UPDATE products SET video = ${url}, "updatedAt" = NOW() WHERE id = ${p.id}`;
        console.log(`  ✅ ${url}`);
      } else {
        console.log(`  ⚠️ ID não extraído`);
      }
    } catch (e) {
      console.log(`  ❌ ${e.message}`);
    }
    await sleep(700);
  }

  console.log("\n🎉 Vídeos concluídos!\n");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
