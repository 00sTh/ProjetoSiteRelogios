// node --env-file=.env.local scripts/seed-perfumes.mjs
import { neon } from "@neondatabase/serverless";
import { v2 as cloudinary } from "cloudinary";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SERPER_KEY = "cd997fc33c9a6729c8adef285e619d284e0e5be6";
const CATEGORY_ID = "cmn4u3l3b0001uvcmr5etse3d"; // perfumes

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const sql = neon(process.env.DATABASE_URL);

function cuid() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 12);
  return `c${ts}${rand}`;
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function serperImages(query) {
  const res = await fetch("https://google.serper.dev/images", {
    method: "POST",
    headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num: 6 }),
  });
  const data = await res.json();
  return (data.images || []).map(i => i.imageUrl).filter(Boolean);
}

async function pickBestImage(urls, productName) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const parts = [];
  const validUrls = [];

  for (const url of urls.slice(0, 4)) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const mime = res.headers.get("content-type") || "image/jpeg";
      parts.push({ inlineData: { data: buf.toString("base64"), mimeType: mime.split(";")[0] } });
      validUrls.push(url);
    } catch { /* skip */ }
  }

  if (!validUrls.length) return null;
  if (validUrls.length === 1) return validUrls[0];

  try {
    const result = await model.generateContent([
      { text: `Which image index (0-${validUrls.length - 1}) shows "${productName}" with the cleanest white or neutral background and best product presentation? Reply ONLY with the number.` },
      ...parts,
    ]);
    const idx = parseInt(result.response.text().trim());
    return validUrls[isNaN(idx) ? 0 : Math.min(idx, validUrls.length - 1)];
  } catch {
    return validUrls[0];
  }
}

async function uploadFromUrl(url) {
  const res = await cloudinary.uploader.upload(url, { folder: "slc", resource_type: "image" });
  return res.secure_url;
}

// ── Brands: existing slug → id map ───────────────────────────────────────────
const EXISTING_BRANDS = {
  "perf-creed": "cmn4u3osy000guvcmdy2l4va2",
  "perf-chanel": "cmn4u3obp000duvcm7o1bjgjj",
  "perf-dior": "cmn4u3ohl000euvcmara21947",
  "perf-maison-francis-kurkdjian": "cmn4u3on4000fuvcmvubqd7s5",
  "perf-tom-ford": "cmn4u3o66000cuvcmjbjlw8mw",
};

const NEW_BRANDS = [
  { name: "Parfums de Marly", slug: "perf-parfums-de-marly" },
  { name: "Penhaligon's", slug: "perf-penhaligons" },
  { name: "Guerlain", slug: "perf-guerlain" },
  { name: "Bvlgari", slug: "perf-bvlgari" },
  { name: "Cartier", slug: "perf-cartier" },
  { name: "Celine", slug: "perf-celine" },
  { name: "Yves Saint Laurent", slug: "perf-ysl" },
  { name: "Clive Christian", slug: "perf-clive-christian" },
];

const PERFUMES = [
  { brand: "perf-creed", name: "Creed Aventus EDP 100ml", price: 1890, comparePrice: 2190, stock: 5, featured: true, description: "O ícone absoluto da perfumaria de nicho. Notas de abacaxi, groselha negra, bétula defumada e musgo carvalho." },
  { brand: "perf-creed", name: "Creed Green Irish Tweed EDP 120ml", price: 1490, stock: 4, description: "Clássico atemporal. Violeta, íris, sândalo e musgo carvalho — elegância britânica em essência." },
  { brand: "perf-parfums-de-marly", name: "Parfums de Marly Delina EDP 75ml", price: 1290, comparePrice: 1490, stock: 6, featured: true, description: "A rainha floral moderna. Litchi, rosa turca, pimenta-rosa e musgo carvalho." },
  { brand: "perf-parfums-de-marly", name: "Parfums de Marly Cassili EDP 75ml", price: 1190, stock: 5, description: "Elegância feminina em pêssego, bergamota, rosa e cedro. Refinamento puro." },
  { brand: "perf-maison-francis-kurkdjian", name: "Maison Francis Kurkdjian Baccarat Rouge 540 EDP 70ml", price: 1590, comparePrice: 1890, stock: 4, featured: true, description: "Safran, cédre, ambrowood e jasmin — o perfume que redefiniu o luxo olfativo contemporâneo." },
  { brand: "perf-maison-francis-kurkdjian", name: "Maison Francis Kurkdjian Baccarat Rouge 540 Extrait 70ml", price: 2190, stock: 2, description: "Versão Extrait de Parfum com maior concentração e longevidade extraordinária. Mais rico e envolvente." },
  { brand: "perf-penhaligons", name: "Penhaligon's The Tragedy of Lord George EDP 75ml", price: 990, stock: 3, description: "Da icônica coleção Portraits. Citros, especiarias, couro e musgo — dramático e irresistível." },
  { brand: "perf-dior", name: "Dior Oud Ispahan EDP 125ml", price: 1790, comparePrice: 1990, stock: 3, description: "Da La Collection Privée. Rosa búlgara, oud oriental e patchouli — floral oriental de luxo absoluto." },
  { brand: "perf-dior", name: "Dior Ambre Nuit EDP 125ml", price: 1690, stock: 4, description: "Da La Collection Privée. Rosa, âmbar e madeira — sensualidade noturna envolvente." },
  { brand: "perf-tom-ford", name: "Tom Ford Tobacco Vanille EDP 50ml", price: 1290, stock: 5, description: "Da Private Blend. Tabaco, baunilha, especiarias e madeira — opulência e sofisticação em cada nota." },
  { brand: "perf-tom-ford", name: "Tom Ford Oud Wood EDP 50ml", price: 1390, stock: 5, description: "Da Private Blend. Oud raro, sândalo e rosewood — o pioneiro dos ouds ocidentais refinados." },
  { brand: "perf-guerlain", name: "Guerlain Néroli Outrenoir EDP 125ml", price: 1490, stock: 3, description: "Da L'Art & La Matière. Néroli, bergamota e âmbar — luminosidade solar com profundidade noturna." },
  { brand: "perf-bvlgari", name: "Bvlgari Orom Le Gemme EDP 100ml", price: 1390, stock: 3, description: "Da Le Gemme. Inspirado no safira azul — notas aquáticas, âmbar e madeiras preciosas." },
  { brand: "perf-bvlgari", name: "Bvlgari Tygar Le Gemme EDP 100ml", price: 1390, stock: 3, description: "Da Le Gemme. Pimenta, couro e oud — masculinidade selvagem e refinada." },
  { brand: "perf-cartier", name: "Cartier Oud & Santal EDP 100ml", price: 990, stock: 4, description: "Das Les Heures Voyageuses. Oud e sândalo em equilíbrio perfeito — exotismo elegante." },
  { brand: "perf-celine", name: "Celine Reptile Haute Parfumerie EDP 100ml", price: 890, stock: 3, description: "Da Haute Parfumerie Celine. Couro, pimenta e cedro — distinção minimalista parisiense." },
  { brand: "perf-chanel", name: "Chanel Sycomore Les Exclusifs EDP 200ml", price: 1990, stock: 2, featured: true, description: "Da Les Exclusifs. Vetiver fumado, cedro e notas florais — ícone de refinamento francês." },
  { brand: "perf-chanel", name: "Chanel Le Lion Les Exclusifs EDP 75ml", price: 1490, stock: 3, description: "Da Les Exclusifs. Âmbar, couro e notas florais — a audácia de um leão em frasco elegante." },
  { brand: "perf-ysl", name: "Yves Saint Laurent Tuxedo EDP 75ml", price: 990, stock: 4, description: "Do Le Vestiaire des Parfums. Cedro, âmbar e couro — elegância noturna na tradição YSL." },
  { brand: "perf-clive-christian", name: "Clive Christian No. 1 EDP 50ml", price: 4990, comparePrice: 5500, stock: 1, featured: true, description: "Um dos perfumes mais caros do mundo. Bergamota, âmbar cinza, jasmim e sândalo — luxo sem compromisso." },
];

async function main() {
  console.log("🧹 Deletando perfumes antigos...");
  await sql`DELETE FROM products WHERE "categoryId" = ${CATEGORY_ID}`;
  await sql`DELETE FROM brands WHERE slug = 'perf-amouage'`;
  console.log("✅ Perfumes antigos removidos");

  // Criar novas marcas
  const brandIds = { ...EXISTING_BRANDS };
  for (const b of NEW_BRANDS) {
    const existing = await sql`SELECT id FROM brands WHERE slug = ${b.slug}`;
    if (existing.length) { brandIds[b.slug] = existing[0].id; continue; }
    const id = cuid();
    await sql`INSERT INTO brands (id, name, slug, "categoryId") VALUES (${id}, ${b.name}, ${b.slug}, ${CATEGORY_ID})`;
    brandIds[b.slug] = id;
    console.log(`✅ Marca criada: ${b.name}`);
  }

  for (const p of PERFUMES) {
    console.log(`\n📦 Processando: ${p.name}`);
    const brandId = brandIds[p.brand];
    if (!brandId) { console.log(`  ⚠️ Marca não encontrada: ${p.brand}`); continue; }

    // Buscar imagem com Serper
    let cloudinaryUrl = "";
    try {
      const query = `${p.name} perfume bottle white background official product photo`;
      const imageUrls = await serperImages(query);
      console.log(`  🔍 ${imageUrls.length} imagens encontradas`);

      const bestUrl = await pickBestImage(imageUrls, p.name);
      if (bestUrl) {
        cloudinaryUrl = await uploadFromUrl(bestUrl);
        console.log(`  ☁️ Upload: ${cloudinaryUrl}`);
      }
    } catch (e) {
      console.log(`  ⚠️ Imagem falhou: ${e.message}`);
    }

    const slug = slugify(p.name);
    const images = cloudinaryUrl ? `ARRAY['${cloudinaryUrl}']::text[]` : `ARRAY[]::text[]`;
    const id = cuid();

    await sql`
      INSERT INTO products (id, name, slug, price, "comparePrice", stock, featured, active, description, images, colors, "brandId", "categoryId", "createdAt", "updatedAt")
      VALUES (
        ${id}, ${p.name},
        ${slug},
        ${p.price},
        ${p.comparePrice ?? null},
        ${p.stock ?? 1},
        ${p.featured ?? false},
        true,
        ${p.description ?? null},
        ${cloudinaryUrl ? [cloudinaryUrl] : []},
        ARRAY[]::text[],
        ${brandId},
        ${CATEGORY_ID},
        NOW(), NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, images = EXCLUDED.images, "updatedAt" = NOW()
    `;
    console.log(`  ✅ Produto criado: ${p.name}`);
  }

  console.log("\n🎉 Concluído!");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
