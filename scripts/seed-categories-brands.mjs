// node --env-file=.env.local scripts/seed-categories-brands.mjs
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

async function serperImages(query, num = 8) {
  const res = await fetch("https://google.serper.dev/images", {
    method: "POST",
    headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num }),
  });
  const data = await res.json();
  return (data.images || []).map(i => i.imageUrl).filter(Boolean);
}

async function pickBestImage(urls, instruction) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const parts = [];
  const validUrls = [];
  for (const url of urls.slice(0, 5)) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const mime = (res.headers.get("content-type") || "image/jpeg").split(";")[0];
      parts.push({ inlineData: { data: buf.toString("base64"), mimeType: mime } });
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
    console.log(`  ⚠️ Upload falhou: ${e.message}`);
    return null;
  }
}

// ── CATEGORIAS ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    slug: "relogios",
    query: "luxury watch Rolex Patek Philippe Omega editorial campaign photo dark background",
    instruction: "Pick the most editorial, luxury lifestyle watch photo with a dark or dramatic background. Best visual impact.",
    folder: "slc/categories",
  },
  {
    slug: "perfumes",
    query: "luxury perfume bottle Tom Ford Chanel editorial campaign photo dark moody background",
    instruction: "Pick the most editorial, luxury lifestyle perfume bottle photo. Dark, moody, elegant background.",
    folder: "slc/categories",
  },
  {
    slug: "bolsas",
    query: "luxury handbag Hermès Chanel Louis Vuitton editorial campaign photo elegant woman",
    instruction: "Pick the most editorial luxury handbag photo. Fashion campaign style, elegant and aspirational.",
    folder: "slc/categories",
  },
  {
    slug: "sapatos",
    query: "luxury high heels shoes Christian Louboutin Jimmy Choo editorial campaign photo red sole",
    instruction: "Pick the most editorial luxury shoes/heels photo. Fashion campaign style, glamorous.",
    folder: "slc/categories",
  },
];

// ── MARCAS ────────────────────────────────────────────────────────────────────
const BRANDS = [
  // Relógios
  { slug: "rel-rolex",          logoQuery: "Rolex crown logo PNG transparent white background",                         bannerQuery: "Rolex watches collection editorial lifestyle dark background",          logoInstruction: "Pick the cleanest Rolex crown logo on white/transparent background.", bannerInstruction: "Pick the best editorial Rolex campaign photo." },
  { slug: "rel-patek-philippe", logoQuery: "Patek Philippe logo PNG transparent official white background",              bannerQuery: "Patek Philippe Nautilus Aquanaut watches editorial campaign dark",       logoInstruction: "Pick the cleanest Patek Philippe logo.",                            bannerInstruction: "Pick the most elegant Patek Philippe campaign photo." },
  { slug: "rel-omega",          logoQuery: "Omega watches logo PNG transparent official white background",               bannerQuery: "Omega Seamaster Speedmaster watches editorial campaign dark",          logoInstruction: "Pick the cleanest Omega Greek letter logo.",                        bannerInstruction: "Pick the best Omega campaign editorial photo." },
  { slug: "rel-cartier",        logoQuery: "Cartier logo PNG transparent official white background jewelry",             bannerQuery: "Cartier Tank Santos watches collection editorial dark background",     logoInstruction: "Pick the cleanest Cartier wordmark logo in black or dark.",         bannerInstruction: "Pick the most elegant Cartier watches campaign photo." },
  { slug: "rel-iwc",            logoQuery: "IWC Schaffhausen logo PNG transparent official white background",            bannerQuery: "IWC Pilot Portugieser watches editorial campaign dark background",    logoInstruction: "Pick the cleanest IWC Schaffhausen logo.",                          bannerInstruction: "Pick the best IWC campaign editorial photo." },
  { slug: "rel-audemars-piguet",logoQuery: "Audemars Piguet AP logo PNG transparent official white background",          bannerQuery: "Audemars Piguet Royal Oak watches editorial campaign dark",           logoInstruction: "Pick the cleanest Audemars Piguet logo.",                           bannerInstruction: "Pick the most dramatic AP Royal Oak campaign photo." },
  { slug: "rel-tudor",          logoQuery: "Tudor watches logo rose PNG transparent official white background",          bannerQuery: "Tudor watches Black Bay Pelagos editorial campaign dark",             logoInstruction: "Pick the cleanest Tudor rose logo.",                                bannerInstruction: "Pick the best Tudor campaign editorial photo." },
  { slug: "rel-tag-heuer",      logoQuery: "TAG Heuer logo PNG transparent official white background",                  bannerQuery: "TAG Heuer Carrera Monaco chronograph editorial campaign dark",        logoInstruction: "Pick the cleanest TAG Heuer logo.",                                 bannerInstruction: "Pick the best TAG Heuer campaign editorial photo." },
  { slug: "rel-jaeger-lecoultre",logoQuery: "Jaeger-LeCoultre logo PNG transparent official white background",          bannerQuery: "Jaeger-LeCoultre Reverso Polaris watches editorial campaign",         logoInstruction: "Pick the cleanest Jaeger-LeCoultre logo.",                          bannerInstruction: "Pick the most elegant Jaeger-LeCoultre campaign photo." },
  // Perfumes
  { slug: "perf-tom-ford",      logoQuery: "Tom Ford logo PNG transparent official white background beauty",            bannerQuery: "Tom Ford Black Orchid Tobacco Vanille perfume editorial dark",        logoInstruction: "Pick the cleanest Tom Ford wordmark logo in black.",                bannerInstruction: "Pick the most seductive Tom Ford fragrance campaign photo." },
  { slug: "perf-chanel",        logoQuery: "Chanel logo CC interlocking PNG transparent official white background",     bannerQuery: "Chanel No5 Coco Mademoiselle perfume editorial fashion campaign",     logoInstruction: "Pick the cleanest Chanel interlocking CC logo.",                    bannerInstruction: "Pick the most elegant Chanel perfume campaign photo." },
  { slug: "perf-dior",          logoQuery: "Dior logo PNG transparent official white background beauty",               bannerQuery: "Dior Miss Dior Sauvage perfume editorial dark background campaign",  logoInstruction: "Pick the cleanest Dior wordmark or CD logo.",                       bannerInstruction: "Pick the most elegant Dior fragrance campaign photo." },
  { slug: "perf-maison-francis-kurkdjian", logoQuery: "Maison Francis Kurkdjian MFK logo PNG transparent official",   bannerQuery: "Maison Francis Kurkdjian Baccarat Rouge 540 perfume editorial",       logoInstruction: "Pick the cleanest MFK logo.",                                       bannerInstruction: "Pick the most luxurious MFK Baccarat Rouge campaign photo." },
  { slug: "perf-creed",         logoQuery: "Creed perfume logo PNG transparent official white background",             bannerQuery: "Creed Aventus Royal Exclusives perfume editorial dark background",    logoInstruction: "Pick the cleanest Creed wordmark logo.",                            bannerInstruction: "Pick the most prestigious Creed perfume campaign photo." },
  { slug: "perf-parfums-de-marly", logoQuery: "Parfums de Marly logo PNG transparent official white background",       bannerQuery: "Parfums de Marly Delina Pegasus perfume editorial campaign",          logoInstruction: "Pick the cleanest Parfums de Marly logo.",                          bannerInstruction: "Pick the most elegant Parfums de Marly campaign photo." },
  { slug: "perf-penhaligons",   logoQuery: "Penhaligon's logo PNG transparent official white background British",      bannerQuery: "Penhaligon's Portraits perfume editorial luxury campaign",            logoInstruction: "Pick the cleanest Penhaligon's logo.",                              bannerInstruction: "Pick the most whimsical Penhaligon's campaign photo." },
  { slug: "perf-guerlain",      logoQuery: "Guerlain logo PNG transparent official white background beauty Paris",     bannerQuery: "Guerlain Mon Guerlain perfume editorial campaign luxury",             logoInstruction: "Pick the cleanest Guerlain G logo or wordmark.",                    bannerInstruction: "Pick the most elegant Guerlain fragrance campaign photo." },
  { slug: "perf-bvlgari",       logoQuery: "Bulgari Bvlgari logo PNG transparent official white background",           bannerQuery: "Bvlgari Le Gemme perfume jewel editorial dark background",            logoInstruction: "Pick the cleanest Bvlgari logo.",                                   bannerInstruction: "Pick the most luxurious Bvlgari fragrance campaign photo." },
  { slug: "perf-cartier",       logoQuery: "Cartier logo PNG transparent official white background jewelry",           bannerQuery: "Cartier Les Heures perfume luxury editorial dark background",         logoInstruction: "Pick the cleanest Cartier wordmark logo.",                          bannerInstruction: "Pick the most elegant Cartier fragrance campaign photo." },
  { slug: "perf-celine",        logoQuery: "Celine Paris logo PNG transparent official white background fashion",      bannerQuery: "Celine Haute Parfumerie perfume editorial fashion dark campaign",     logoInstruction: "Pick the cleanest Celine wordmark logo.",                           bannerInstruction: "Pick the most minimalist Celine campaign photo." },
  { slug: "perf-ysl",           logoQuery: "Yves Saint Laurent YSL logo PNG transparent official white background",   bannerQuery: "YSL Libre Mon Paris perfume editorial campaign dark",                 logoInstruction: "Pick the cleanest YSL logo (interlocking YSL or wordmark).",        bannerInstruction: "Pick the most bold YSL fragrance campaign photo." },
  { slug: "perf-clive-christian", logoQuery: "Clive Christian perfume logo PNG transparent official white background", bannerQuery: "Clive Christian No 1 perfume luxury editorial dark background",      logoInstruction: "Pick the cleanest Clive Christian crown logo.",                     bannerInstruction: "Pick the most exclusive Clive Christian campaign photo." },
  // Bolsas
  { slug: "bol-hermes",         logoQuery: "Hermès Paris logo PNG transparent official white background",              bannerQuery: "Hermès Birkin Kelly handbag editorial fashion campaign",              logoInstruction: "Pick the cleanest Hermès wordmark logo.",                           bannerInstruction: "Pick the most prestigious Hermès bag campaign photo." },
  { slug: "bol-louis-vuitton",  logoQuery: "Louis Vuitton LV logo monogram PNG transparent official white background", bannerQuery: "Louis Vuitton Neverfull Capucines handbag editorial fashion campaign", logoInstruction: "Pick the cleanest LV logo or monogram.",                           bannerInstruction: "Pick the most iconic Louis Vuitton bag campaign photo." },
  { slug: "bol-chanel",         logoQuery: "Chanel CC logo interlocking PNG transparent official white background",    bannerQuery: "Chanel Classic Flap Boy bag editorial fashion campaign dark",         logoInstruction: "Pick the cleanest Chanel CC interlocking logo.",                    bannerInstruction: "Pick the most iconic Chanel bag campaign photo." },
  { slug: "bol-gucci",          logoQuery: "Gucci logo PNG transparent official white background fashion",             bannerQuery: "Gucci Marmont Dionysus handbag editorial fashion campaign",           logoInstruction: "Pick the cleanest Gucci wordmark or GG logo.",                      bannerInstruction: "Pick the most editorial Gucci bag campaign photo." },
  { slug: "bol-bottega-veneta", logoQuery: "Bottega Veneta logo PNG transparent official white background",            bannerQuery: "Bottega Veneta Cassette Jodie bag editorial fashion campaign",        logoInstruction: "Pick the cleanest Bottega Veneta wordmark logo.",                   bannerInstruction: "Pick the most sophisticated Bottega Veneta campaign photo." },
  { slug: "bol-prada",          logoQuery: "Prada triangle logo PNG transparent official white background",            bannerQuery: "Prada Galleria Cleo handbag editorial fashion campaign dark",         logoInstruction: "Pick the cleanest Prada triangle logo or wordmark.",                bannerInstruction: "Pick the most editorial Prada bag campaign photo." },
  // Sapatos
  { slug: "sap-christian-louboutin", logoQuery: "Christian Louboutin logo PNG transparent official white background", bannerQuery: "Christian Louboutin So Kate Pigalle red sole shoes editorial campaign", logoInstruction: "Pick the cleanest Christian Louboutin wordmark logo.",             bannerInstruction: "Pick the most glamorous Christian Louboutin shoes campaign photo." },
  { slug: "sap-jimmy-choo",     logoQuery: "Jimmy Choo logo PNG transparent official white background shoes",          bannerQuery: "Jimmy Choo Anouk Romy heels shoes editorial fashion campaign",       logoInstruction: "Pick the cleanest Jimmy Choo wordmark logo.",                       bannerInstruction: "Pick the most glamorous Jimmy Choo shoes campaign photo." },
  { slug: "sap-manolo-blahnik", logoQuery: "Manolo Blahnik logo PNG transparent official white background shoes",     bannerQuery: "Manolo Blahnik BB Hangisi heels shoes editorial fashion campaign",    logoInstruction: "Pick the cleanest Manolo Blahnik wordmark logo.",                   bannerInstruction: "Pick the most editorial Manolo Blahnik shoes campaign photo." },
  { slug: "sap-salvatore-ferragamo", logoQuery: "Salvatore Ferragamo logo PNG transparent official white background", bannerQuery: "Salvatore Ferragamo Vara shoes heels editorial fashion campaign",    logoInstruction: "Pick the cleanest Ferragamo logo.",                                 bannerInstruction: "Pick the most elegant Ferragamo shoes campaign photo." },
];

async function main() {
  // ── Phase 1: Categories ───────────────────────────────────────────────────
  console.log("\n═══ FASE 1: IMAGENS DE CATEGORIAS ═══\n");
  for (const cat of CATEGORIES) {
    console.log(`📂 Categoria: ${cat.slug}`);
    try {
      const urls = await serperImages(cat.query, 8);
      console.log(`   🔍 ${urls.length} imagens encontradas`);
      const best = await pickBestImage(urls, cat.instruction);
      if (!best) { console.log(`   ⚠️ Nenhuma imagem válida`); continue; }
      const uploaded = await uploadFromUrl(best, cat.folder);
      if (!uploaded) continue;
      await sql`UPDATE categories SET image = ${uploaded} WHERE slug = ${cat.slug}`;
      console.log(`   ✅ ${uploaded}`);
    } catch (e) {
      console.log(`   ❌ ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  // ── Phase 2: Brand Logos + Banners ────────────────────────────────────────
  console.log("\n═══ FASE 2: LOGOS E BANNERS DAS MARCAS ═══\n");
  for (const brand of BRANDS) {
    console.log(`🏷️  Marca: ${brand.slug}`);

    // Logo
    try {
      const urls = await serperImages(brand.logoQuery, 8);
      const best = await pickBestImage(urls, brand.logoInstruction);
      if (best) {
        const uploaded = await uploadFromUrl(best, "slc/logos");
        if (uploaded) {
          await sql`UPDATE brands SET logo = ${uploaded} WHERE slug = ${brand.slug}`;
          console.log(`   ✅ Logo: ${uploaded}`);
        }
      }
    } catch (e) {
      console.log(`   ⚠️ Logo falhou: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 800));

    // Banner
    try {
      const urls = await serperImages(brand.bannerQuery, 8);
      const best = await pickBestImage(urls, brand.bannerInstruction);
      if (best) {
        const uploaded = await uploadFromUrl(best, "slc/banners");
        if (uploaded) {
          await sql`UPDATE brands SET banner = ${uploaded} WHERE slug = ${brand.slug}`;
          console.log(`   ✅ Banner: ${uploaded}`);
        }
      }
    } catch (e) {
      console.log(`   ⚠️ Banner falhou: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 800));
  }

  console.log("\n🎉 Categorias e marcas concluídas!\n");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
