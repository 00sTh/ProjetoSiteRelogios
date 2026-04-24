// node --env-file=.env.local scripts/verify-fix-videos.mjs
// Verifica quais vídeos NÃO permitem embedding e substitui por alternativas funcionais
import { neon } from "@neondatabase/serverless";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SERPER_KEY = "cd997fc33c9a6729c8adef285e619d284e0e5be6";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const sql = neon(process.env.DATABASE_URL);

function extractId(url) {
  const m = url?.match(/embed\/([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

async function isEmbeddable(videoId) {
  if (!videoId) return false;
  try {
    const res = await fetch(`https://www.youtube-nocookie.com/embed/${videoId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    // Erros claros de não-embeddable
    if (
      html.includes('"status":"ERROR"') ||
      html.includes('"status":"UNPLAYABLE"') ||
      html.includes('"status":"LOGIN_REQUIRED"') ||
      html.includes("errorcode") ||
      html.includes('"embeddingDisabled"') ||
      html.includes('"reason":"This video contains content')
    ) return false;
    // OK se tem o videoId no player data
    return html.includes(videoId);
  } catch {
    return false;
  }
}

async function serperVideos(query, num = 10) {
  const res = await fetch("https://google.serper.dev/videos", {
    method: "POST",
    headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num }),
  });
  const data = await res.json();
  return (data.videos || []).filter(v => v.link?.includes("youtube.com"));
}

async function pickBestEmbeddable(videos, context) {
  // Testa até encontrar um embeddable, priorizando pela ordem do Gemini
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const list = videos.slice(0, 8).map((v, i) => `${i}: "${v.title}" – ${v.channel || "?"}`).join("\n");
  let order = [0, 1, 2, 3, 4, 5, 6, 7].slice(0, videos.length);
  try {
    const r = await model.generateContent(
      `Context: ${context}\n\nVideos:\n${list}\n\nOrder from best to worst (review/unboxing channels preferred, NOT official brand channels). Reply with just indices like: 2,0,5,3,1`
    );
    const idxs = r.response.text().match(/\d+/g)?.map(Number).filter(n => n < videos.length);
    if (idxs?.length) order = idxs;
  } catch { /* use default order */ }

  for (const idx of order) {
    const v = videos[idx];
    const id = v.link?.match(/[?&]v=([a-zA-Z0-9_-]{11})/)?.[1];
    if (!id) continue;
    const ok = await isEmbeddable(id);
    if (ok) return `https://www.youtube-nocookie.com/embed/${id}`;
    await new Promise(r => setTimeout(r, 300));
  }
  return null;
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  let fixed = 0, skipped = 0, failed = 0;

  // ─── PRODUTOS ───────────────────────────────────────────────────────────────
  console.log("\n═══ VERIFICANDO PRODUTOS ═══\n");
  const products = await sql`
    SELECT p.id, p.name, p.video, b.name AS brand, c.slug AS cat
    FROM products p JOIN brands b ON p."brandId" = b.id JOIN categories c ON p."categoryId" = c.id
    WHERE p.video IS NOT NULL ORDER BY c.slug, b.name, p.name
  `;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const id = extractId(p.video);
    process.stdout.write(`[${i+1}/${products.length}] ${p.brand} — ${p.name.substring(0,35)}: `);

    const ok = await isEmbeddable(id);
    if (ok) { console.log("✅ OK"); skipped++; await sleep(400); continue; }

    console.log("❌ BLOCKED → buscando alternativa...");
    try {
      const q1 = `${p.brand} ${p.name} review unboxing`;
      const q2 = `${p.brand} ${p.name} hands-on`;
      const videos = [...await serperVideos(q1, 8), ...await serperVideos(q2, 5)];
      const newUrl = await pickBestEmbeddable(videos, `${p.brand} ${p.name} (${p.cat})`);
      if (newUrl) {
        await sql`UPDATE products SET video = ${newUrl}, "updatedAt" = NOW() WHERE id = ${p.id}`;
        console.log(`  → ${newUrl}`);
        fixed++;
      } else {
        // Sem alternativa funcionando: limpa o campo
        await sql`UPDATE products SET video = NULL, "updatedAt" = NOW() WHERE id = ${p.id}`;
        console.log(`  → campo removido (sem vídeo embeddable encontrado)`);
        failed++;
      }
    } catch (e) {
      console.log(`  ❌ ${e.message}`);
      failed++;
    }
    await sleep(600);
  }

  // ─── MARCAS ─────────────────────────────────────────────────────────────────
  console.log("\n═══ VERIFICANDO MARCAS ═══\n");
  const brands = await sql`SELECT b.id, b.name, b.video, c.slug AS cat FROM brands b JOIN categories c ON b."categoryId" = c.id WHERE b.video IS NOT NULL ORDER BY b.name`;

  for (const b of brands) {
    const id = extractId(b.video);
    process.stdout.write(`${b.name}: `);
    const ok = await isEmbeddable(id);
    if (ok) { console.log("✅"); await sleep(300); continue; }
    console.log("❌ → buscando...");
    try {
      const videos = await serperVideos(`${b.name} brand campaign film official`, 8);
      const newUrl = await pickBestEmbeddable(videos, `${b.name} brand film (${b.cat})`);
      if (newUrl) {
        const bg = newUrl.replace("/embed/", "/embed/") + "?autoplay=1&mute=1&loop=1&playlist=" + extractId(newUrl) + "&rel=0";
        await sql`UPDATE brands SET video = ${bg} WHERE id = ${b.id}`;
        console.log(`  → ${bg}`);
      } else {
        await sql`UPDATE brands SET video = NULL WHERE id = ${b.id}`;
        console.log(`  → removido`);
      }
    } catch (e) { console.log(`  ❌ ${e.message}`); }
    await sleep(600);
  }

  // ─── CATEGORIAS ─────────────────────────────────────────────────────────────
  console.log("\n═══ VERIFICANDO CATEGORIAS ═══\n");
  const cats = await sql`SELECT id, name, slug, video FROM categories WHERE video IS NOT NULL`;
  for (const c of cats) {
    const id = extractId(c.video);
    process.stdout.write(`${c.name}: `);
    const ok = await isEmbeddable(id);
    if (ok) { console.log("✅"); await sleep(300); continue; }
    console.log("❌ → buscando...");
    const queries = {
      relogios: "luxury watch collection showcase cinematic video",
      perfumes: "luxury perfume fragrance collection video",
      bolsas: "luxury handbag collection fashion video",
      sapatos: "luxury shoes heels fashion collection video",
    };
    const videos = await serperVideos(queries[c.slug] || `${c.name} luxury fashion video`, 8);
    const newUrl = await pickBestEmbeddable(videos, `${c.name} category background`);
    if (newUrl) {
      const bg = newUrl + "?autoplay=1&mute=1&loop=1&playlist=" + extractId(newUrl) + "&rel=0";
      await sql`UPDATE categories SET video = ${bg} WHERE id = ${c.id}`;
      console.log(`  → ${bg}`);
    } else {
      await sql`UPDATE categories SET video = NULL WHERE id = ${c.id}`;
      console.log(`  → removido`);
    }
    await sleep(600);
  }

  // ─── HERO ────────────────────────────────────────────────────────────────────
  console.log("\n═══ VERIFICANDO HERO ═══\n");
  const hero = await sql`SELECT key, value FROM site_config WHERE key IN ('hero_video_left','hero_video_right')`;
  const heroQueries = {
    hero_video_left: "luxury watch collection cinematic 4K",
    hero_video_right: "luxury perfume fragrance film 4K",
  };
  for (const h of hero) {
    const id = extractId(h.value);
    process.stdout.write(`${h.key}: `);
    const ok = await isEmbeddable(id);
    if (ok) { console.log("✅"); await sleep(300); continue; }
    console.log("❌ → buscando...");
    const videos = await serperVideos(heroQueries[h.key] || "luxury lifestyle cinematic", 8);
    const newUrl = await pickBestEmbeddable(videos, `hero background ${h.key}`);
    if (newUrl) {
      const bg = newUrl + "?autoplay=1&mute=1&loop=1&playlist=" + extractId(newUrl) + "&rel=0";
      await sql`UPDATE site_config SET value = ${bg}, "updatedAt" = NOW() WHERE key = ${h.key}`;
      console.log(`  → ${bg}`);
    }
    await sleep(600);
  }

  console.log(`\n🎉 Concluído: ${fixed} trocados, ${skipped} OK, ${failed} removidos\n`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
