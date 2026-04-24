// node --env-file=.env.local scripts/seed-watch-gallery.mjs
import { neon } from "@neondatabase/serverless";
import { v2 as cloudinary } from "cloudinary";

const SERPER_KEY = "cd997fc33c9a6729c8adef285e619d284e0e5be6";
const TARGET = 8;
const sql = neon(process.env.DATABASE_URL);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const BRAND_DOMAINS = {
  "Rolex": "rolex.com",
  "Patek Philippe": "patek.com",
  "Audemars Piguet": "audemarspiguet.com",
  "Omega": "omegawatches.com",
  "Cartier": "cartier.com",
  "TAG Heuer": "tagheuer.com",
  "IWC": "iwc.com",
  "Jaeger-LeCoultre": "jaeger-lecoultre.com",
  "Tudor": "tudorwatch.com",
  "Breitling": "breitling.com",
  "Panerai": "panerai.com",
  "Hublot": "hublot.com",
};

const SKIP = ["logo","icon","favicon","sprite","banner","cart","nav","header","footer",
              "avatar","social","60x60","80x80","100x100","150x150","200x200","placeholder"];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function serperImages(query, num = 10) {
  try {
    const res = await fetch("https://google.serper.dev/images", {
      method: "POST",
      headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, num }),
    });
    const data = await res.json();
    return (data.images || []).map(i => i.imageUrl).filter(Boolean);
  } catch { return []; }
}

function isGood(url) {
  if (!url?.startsWith("http")) return false;
  if (/\.(svg|gif)(\?|$)/i.test(url)) return false;
  const low = url.toLowerCase();
  return !SKIP.some(s => low.includes(s));
}

async function upload(url, folder) {
  if (!isGood(url)) return null;
  try {
    const r = await cloudinary.uploader.upload(url, {
      folder,
      resource_type: "image",
      timeout: 20000,
      transformation: [{ quality: "auto:best", fetch_format: "auto" }],
    });
    return r.secure_url;
  } catch { return null; }
}

async function main() {
  const watches = await sql`
    SELECT p.id, p.name, p.images, b.name AS brand
    FROM products p
    JOIN brands b ON p."brandId" = b.id
    JOIN categories c ON b."categoryId" = c.id
    WHERE c.slug = 'relogios' AND p.active = true
      AND array_length(p.images, 1) < ${TARGET}
    ORDER BY array_length(p.images, 1) ASC NULLS FIRST, p.name
  `;

  console.log(`\n🕐 ${watches.length} relógios para atualizar\n`);
  let updated = 0, totalNew = 0;

  for (let i = 0; i < watches.length; i++) {
    const p = watches[i];
    const existing = p.images || [];
    const need = TARGET - existing.length;
    console.log(`\n[${i+1}/${watches.length}] ${p.brand} — ${p.name.substring(0,50)} (${existing.length} → ${TARGET})`);

    const domain = BRAND_DOMAINS[p.brand];
    const name = p.name.replace(/\b(\d+mm|\d+m|automático|automatic)\b/gi,"").trim().substring(0,50);

    // 3 queries diferentes para variedade de ângulos
    const queries = [
      domain ? `"${name}" site:${domain}` : `"${p.brand}" "${name}" relógio oficial`,
      `${p.brand} ${name} press official image watch`,
      `${p.brand} ${name} watch dial bracelet detail`,
    ];

    const candidates = [];
    for (const q of queries) {
      const imgs = await serperImages(q, 10);
      candidates.push(...imgs);
      await sleep(250);
    }

    const known = new Set(existing);
    const unique = [...new Set(candidates)].filter(u => !known.has(u) && isGood(u));
    console.log(`  🔍 ${unique.length} candidatas`);

    const newImgs = [];
    for (const url of unique) {
      if (newImgs.length >= need) break;
      const up = await upload(url, "slc/relogios");
      if (up && !known.has(up)) {
        newImgs.push(up);
        known.add(up);
        process.stdout.write(`  ✅ ${existing.length + newImgs.length}/${TARGET}\n`);
      }
      await sleep(150);
    }

    if (newImgs.length > 0) {
      const final = [...existing, ...newImgs];
      await sql`UPDATE products SET images = ${final}, "updatedAt" = NOW() WHERE id = ${p.id}`;
      console.log(`  💾 +${newImgs.length} fotos (total: ${final.length})`);
      updated++; totalNew += newImgs.length;
    } else {
      console.log(`  ⚠️  nenhuma foto nova`);
    }
    await sleep(400);
  }

  console.log(`\n✅ ${updated}/${watches.length} relógios atualizados | ${totalNew} fotos novas\n`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
