// node --env-file=.env.local scripts/seed-description-images.mjs
import { neon } from "@neondatabase/serverless";
import { v2 as cloudinary } from "cloudinary";

const SERPER_KEY = "cd997fc33c9a6729c8adef285e619d284e0e5be6";
const sql = neon(process.env.DATABASE_URL);
const sleep = ms => new Promise(r => setTimeout(r, ms));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const BRAND_DOMAINS = {
  "Rolex":"rolex.com","Patek Philippe":"patek.com","Audemars Piguet":"audemarspiguet.com",
  "Omega":"omegawatches.com","Cartier":"cartier.com","TAG Heuer":"tagheuer.com",
  "IWC":"iwc.com","Jaeger-LeCoultre":"jaeger-lecoultre.com","Tudor":"tudorwatch.com",
  "Jaeger Lecoultre":"jaeger-lecoultre.com","Breitling":"breitling.com",
  "Chanel":"chanel.com","Hermès":"hermes.com","Gucci":"gucci.com",
  "Louis Vuitton":"louisvuitton.com","Prada":"prada.com","Bottega Veneta":"bottegaveneta.com",
  "Bvlgari":"bulgari.com","Celine":"celine.com","Creed":"creedperfume.com",
  "Dior":"dior.com","Guerlain":"guerlain.com","Maison Francis Kurkdjian":"maisonfranciskurkdjian.com",
  "Parfums de Marly":"parfumsdemarly.com","Penhaligon's":"penhaligons.com",
  "Tom Ford":"tomford.com","Yves Saint Laurent":"yslbeauty.com",
  "Christian Louboutin":"christianlouboutin.com","Jimmy Choo":"jimmychoo.com",
  "Manolo Blahnik":"manoloblahnik.com","Salvatore Ferragamo":"ferragamo.com",
};

const SKIP = ["logo","icon","favicon","sprite","banner","avatar","social","placeholder",
              "60x60","80x80","100x100","150x150","200x200","arrow","button","flag","star","check"];

function cleanName(raw) {
  return raw.replace(/\b(EDP|EDT|\d+\s*ml|\d+\s*mm|couro|verniz|azul|preto|branco|dourado)\b/gi, "")
    .replace(/\s{2,}/g, " ").trim().substring(0, 50);
}

async function serperSearch(q, num = 3) {
  try {
    const r = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q, num, gl: "us", hl: "en" }),
    });
    return (await r.json()).organic || [];
  } catch { return []; }
}

async function scrapeImagesViaJina(url) {
  try {
    const r = await fetch(`https://r.jina.ai/${url}`, {
      headers: { "Accept": "text/plain", "X-Return-Format": "markdown" },
      signal: AbortSignal.timeout(25000),
    });
    if (!r.ok) return [];
    const md = await r.text();
    // Extract image URLs from markdown: ![alt](url)
    const urls = [...md.matchAll(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g)]
      .map(m => m[1])
      .filter(u => {
        const low = u.toLowerCase();
        return /\.(jpg|jpeg|png|webp)(\?|$)/i.test(u) &&
               !SKIP.some(s => low.includes(s)) &&
               !low.includes("data:") &&
               u.length < 500;
      });
    return [...new Set(urls)].slice(0, 10);
  } catch { return []; }
}

async function uploadToCloudinary(url, folder) {
  try {
    const r = await cloudinary.uploader.upload(url, {
      folder,
      resource_type: "image",
      timeout: 25000,
      transformation: [{ quality: "auto:best", fetch_format: "auto" }],
    });
    return r.secure_url;
  } catch { return null; }
}

async function main() {
  const products = await sql`
    SELECT p.id, p.name, b.name AS brand, c.slug AS cat,
           array_length(p."descriptionImages", 1) AS dcount
    FROM products p
    JOIN brands b ON p."brandId" = b.id
    JOIN categories c ON p."categoryId" = c.id
    WHERE p.active = true
      AND (p."descriptionImages" IS NULL OR array_length(p."descriptionImages", 1) IS NULL OR array_length(p."descriptionImages", 1) < 2)
    ORDER BY c.slug, b.name, p.name
  `;

  console.log(`\n🖼️  ${products.length} produtos para coletar imagens de detalhe...\n`);
  let updated = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const name = cleanName(p.name);
    const domain = BRAND_DOMAINS[p.brand];
    console.log(`\n[${i+1}/${products.length}] ${p.brand} — ${name}`);

    // Find official product page via Serper
    let pageUrl = null;
    if (domain) {
      const res = await serperSearch(`site:${domain} "${name}"`, 2);
      await sleep(300);
      pageUrl = res[0]?.link;
    }
    if (!pageUrl) {
      const res = await serperSearch(`"${p.brand}" "${name}" official`, 3);
      await sleep(300);
      pageUrl = res.find(r => !r.link?.includes("youtube") && !r.link?.includes("amazon"))?.link;
    }

    if (!pageUrl) { console.log("  ⚠️ URL não encontrada"); continue; }
    console.log(`  🌐 ${pageUrl.substring(0, 70)}`);

    const imgUrls = await scrapeImagesViaJina(pageUrl);
    console.log(`  🖼️  ${imgUrls.length} imagens candidatas`);
    await sleep(400);

    const uploaded = [];
    for (const url of imgUrls) {
      if (uploaded.length >= 4) break;
      const up = await uploadToCloudinary(url, `slc/details`);
      if (up) { uploaded.push(up); process.stdout.write(`  ✅ ${uploaded.length}/4\n`); }
      await sleep(200);
    }

    if (uploaded.length >= 2) {
      await sql`UPDATE products SET "descriptionImages" = ${uploaded}, "updatedAt" = NOW() WHERE id = ${p.id}`;
      updated++;
    } else {
      console.log("  ⚠️ Imagens insuficientes");
    }
    await sleep(400);
  }

  console.log(`\n✅ ${updated}/${products.length} produtos atualizados\n`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
