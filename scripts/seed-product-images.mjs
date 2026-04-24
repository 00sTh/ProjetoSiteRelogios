// node --env-file=.env.local scripts/seed-product-images.mjs
// Busca fotos oficiais das marcas via Serper Images e sobe para Cloudinary
import { neon } from "@neondatabase/serverless";
import { v2 as cloudinary } from "cloudinary";

const SERPER_KEY = "cd997fc33c9a6729c8adef285e619d284e0e5be6";
const sql = neon(process.env.DATABASE_URL);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const BRAND_DOMAINS = {
  "Rolex": "rolex.com", "Patek Philippe": "patek.com",
  "Audemars Piguet": "audemarspiguet.com", "Omega": "omegawatches.com",
  "Cartier": "cartier.com", "TAG Heuer": "tagheuer.com",
  "IWC": "iwc.com", "Jaeger-LeCoultre": "jaeger-lecoultre.com",
  "Tudor": "tudorwatch.com", "Chanel": "chanel.com",
  "Hermès": "hermes.com", "Gucci": "gucci.com",
  "Louis Vuitton": "louisvuitton.com", "Prada": "prada.com",
  "Bottega Veneta": "bottegaveneta.com", "Bvlgari": "bulgari.com",
  "Celine": "celine.com", "Creed": "creedperfume.com",
  "Dior": "dior.com", "Guerlain": "guerlain.com",
  "Maison Francis Kurkdjian": "maisonfranciskurkdjian.com",
  "Parfums de Marly": "parfumsdemarly.com",
  "Tom Ford": "tomford.com",
  "Christian Louboutin": "christianlouboutin.com",
  "Jimmy Choo": "jimmychoo.com", "Manolo Blahnik": "manoloblahnik.com",
  "Salvatore Ferragamo": "ferragamo.com",
};

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TARGET_IMAGES = 4; // fotos desejadas por produto

async function searchImages(brand, productName) {
  const domain = BRAND_DOMAINS[brand];
  const clean = productName.replace(/\b(EDP|EDT|ml|mm|\d+ml|\d+mm)\b/gi, "").trim().substring(0, 55);
  const q = domain ? `"${clean}" site:${domain}` : `"${brand}" "${clean}"`;
  try {
    const res = await fetch("https://google.serper.dev/images", {
      method: "POST",
      headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q, num: 10 }),
    });
    const data = await res.json();
    return (data.images || []).map(i => i.imageUrl).filter(Boolean);
  } catch { return []; }
}

async function getOfficialPageImages(brand, productName) {
  const domain = BRAND_DOMAINS[brand];
  if (!domain) return [];
  const clean = productName.replace(/\b(EDP|EDT|ml|mm|\d+ml|\d+mm)\b/gi, "").trim().substring(0, 55);
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: `site:${domain} "${clean}"`, num: 2 }),
    });
    const data = await res.json();
    const url = (data.organic || [])[0]?.link;
    if (!url) return [];

    const pageRes = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(10000) });
    if (!pageRes.ok) return [];
    const html = await pageRes.text();

    const results = [];
    // og:image
    const ogImg = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1]
                || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];
    if (ogImg?.startsWith("http")) results.push(ogImg);

    // JSON-LD product images
    for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
      try {
        const obj = JSON.parse(m[1]);
        const imgs = obj.image || obj.images;
        if (Array.isArray(imgs)) results.push(...imgs.filter(u => typeof u === "string" && u.startsWith("http")));
        else if (typeof imgs === "string" && imgs.startsWith("http")) results.push(imgs);
      } catch {}
    }
    return results;
  } catch { return []; }
}

async function uploadFromUrl(url, folder) {
  // Skip non-product images
  if (/\.(svg|gif)(\?|$)/i.test(url)) return null;
  if (/logo|icon|favicon|sprite|banner|cart|nav|header|footer/i.test(url)) return null;
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder,
      resource_type: "image",
      timeout: 20000,
      transformation: [{ quality: "auto:best", fetch_format: "auto" }],
    });
    return result.secure_url;
  } catch { return null; }
}

async function main() {
  const products = await sql`
    SELECT p.id, p.name, p.images, b.name AS brand, c.slug AS cat
    FROM products p
    JOIN brands b ON p."brandId" = b.id
    JOIN categories c ON p."categoryId" = c.id
    WHERE array_length(p.images, 1) < ${TARGET_IMAGES}
    ORDER BY c.slug, b.name, p.name
  `;

  console.log(`\n📦 ${products.length} produtos com menos de ${TARGET_IMAGES} fotos\n`);
  let updated = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const existing = p.images || [];
    console.log(`\n[${i + 1}/${products.length}] ${p.brand} — ${p.name} (${existing.length} foto atual)`);

    const folder = `slc/${p.cat}`;
    const allClouds = new Set(existing);
    const newImages = [];

    // 1. Página oficial → og:image + JSON-LD
    const official = await getOfficialPageImages(p.brand, p.name);
    await sleep(400);

    // 2. Serper image search
    const searched = await searchImages(p.brand, p.name);
    await sleep(400);

    // Prioriza oficiais, depois search
    const candidates = [...new Set([...official, ...searched])];
    console.log(`  🔍 ${candidates.length} candidatas`);

    for (const url of candidates) {
      if (newImages.length + existing.length >= TARGET_IMAGES) break;
      if (!url?.startsWith("http")) continue;

      const uploaded = await uploadFromUrl(url, folder);
      if (uploaded && !allClouds.has(uploaded)) {
        newImages.push(uploaded);
        allClouds.add(uploaded);
        process.stdout.write(`  ✅ foto ${existing.length + newImages.length}/${TARGET_IMAGES}\n`);
      }
      await sleep(250);
    }

    if (newImages.length > 0) {
      const finalImages = [...existing, ...newImages];
      await sql`UPDATE products SET images = ${finalImages}, "updatedAt" = NOW() WHERE id = ${p.id}`;
      console.log(`  💾 ${newImages.length} novas fotos (total: ${finalImages.length})`);
      updated++;
    } else {
      console.log(`  ⚠️ nenhuma foto nova encontrada`);
    }

    await sleep(500);
  }

  console.log(`\n═══════════════════════════════════`);
  console.log(`✅ Produtos atualizados: ${updated}/${products.length}`);
  console.log(`═══════════════════════════════════\n`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
