// node --env-file=.env.local scripts/fix-categories.mjs
// Corrige as 2 categorias que falharam (perfumes e bolsas — URLs do Instagram bloqueadas)
import { neon } from "@neondatabase/serverless";
import { v2 as cloudinary } from "cloudinary";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SERPER_KEY = "cd997fc33c9a6729c8adef285e619d284e0e5be6";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const sql = neon(process.env.DATABASE_URL);

async function serperImages(query, num = 10) {
  const res = await fetch("https://google.serper.dev/images", {
    method: "POST",
    headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num }),
  });
  const data = await res.json();
  // Filtrar URLs do Instagram que bloqueiam
  return (data.images || [])
    .map(i => i.imageUrl)
    .filter(u => u && !u.includes("instagram.com") && !u.includes("lookaside") && !u.startsWith("data:"));
}

async function pickBestImage(urls, instruction) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const parts = [];
  const validUrls = [];
  for (const url of urls.slice(0, 6)) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
      if (!res.ok) continue;
      const ct = res.headers.get("content-type") || "";
      if (!ct.startsWith("image/")) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      parts.push({ inlineData: { data: buf.toString("base64"), mimeType: ct.split(";")[0] } });
      validUrls.push(url);
    } catch { /* skip */ }
  }
  if (!validUrls.length) return null;
  if (validUrls.length === 1) return validUrls[0];
  try {
    const result = await model.generateContent([
      { text: `${instruction} Reply ONLY with the index number (0-${validUrls.length - 1}).` },
      ...parts,
    ]);
    const idx = parseInt(result.response.text().trim());
    return validUrls[isNaN(idx) ? 0 : Math.min(idx, validUrls.length - 1)];
  } catch {
    return validUrls[0];
  }
}

async function uploadFromUrl(url, folder) {
  try {
    const res = await cloudinary.uploader.upload(url, { folder, resource_type: "image" });
    return res.secure_url;
  } catch (e) {
    console.log(`  ⚠️ ${e.message}`);
    return null;
  }
}

const CATS = [
  {
    slug: "perfumes",
    queries: [
      "luxury fragrance perfume bottles Tom Ford Chanel editorial photo dark background high fashion",
      "luxury perfume collection Dior Guerlain campaign photo elegant dark",
      "expensive perfume bottle luxury editorial photo dark moody",
    ],
    instruction: "Pick the most editorial, luxury lifestyle perfume bottle photo. Dark, moody, elegant background. No text overlays.",
  },
  {
    slug: "bolsas",
    queries: [
      "Hermès Birkin Kelly handbag luxury editorial campaign photo dark background",
      "luxury handbag Chanel Louis Vuitton Gucci editorial fashion photo dark",
      "designer handbag luxury editorial photo dark elegant background",
    ],
    instruction: "Pick the most editorial luxury handbag/purse photo. Fashion campaign style, elegant, aspirational. No text overlays.",
  },
];

async function main() {
  for (const cat of CATS) {
    console.log(`\n📂 ${cat.slug}`);
    let uploaded = null;
    for (const q of cat.queries) {
      console.log(`  🔍 Query: ${q.slice(0, 60)}...`);
      const urls = await serperImages(q, 10);
      console.log(`  📸 ${urls.length} imagens válidas`);
      if (!urls.length) continue;
      const best = await pickBestImage(urls, cat.instruction);
      if (!best) continue;
      console.log(`  🎯 Escolhida: ${best.slice(0, 80)}`);
      uploaded = await uploadFromUrl(best, "slc/categories");
      if (uploaded) break;
    }
    if (uploaded) {
      await sql`UPDATE categories SET image = ${uploaded} WHERE slug = ${cat.slug}`;
      console.log(`  ✅ ${uploaded}`);
    } else {
      console.log(`  ❌ Não foi possível fazer upload para ${cat.slug}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log("\n🎉 Categorias corrigidas!\n");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
