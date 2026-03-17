/**
 * Import WeShop products into LuxImport SQLite database
 * Run: node prisma/import-weshop.cjs
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Map scraped category names → existing LuxImport category slugs
const CATEGORY_MAP = {
  // → Relógios
  'Rolex': 'relogios',
  'Omega': 'relogios',
  'AP (Audemars Piguet)': 'relogios',
  'Cartier (Watches)': 'relogios',
  'Richard Mille': 'relogios',
  'Patek Philippe': 'relogios',
  'Breitling': 'relogios',
  'Jaeger-LeCoultre': 'relogios',
  'Panerai': 'relogios',
  'HUBLOT': 'relogios',
  'IWC': 'relogios',
  'PIAGET': 'relogios',
  'Vacheron Constantin': 'relogios',
  'Blancpain': 'relogios',
  'Longines': 'relogios',
  'Watches (Other Brands)': 'relogios',
  // → Bolsas & Carteiras
  'LV Bags': 'bolsas',
  'YSL Bags': 'bolsas',
  'Dior Bags': 'bolsas',
  'Gucci Bags': 'bolsas',
  'Hermes Bags': 'bolsas',
  'Coach Bags': 'bolsas',
  'Prada Bags': 'bolsas',
  'MiuMiu Bags': 'bolsas',
  'Fendi Bags': 'bolsas',
  'Goya Bags': 'bolsas',
  'Wallet': 'bolsas',
  'Luggage': 'bolsas',
  // → Moda (sapatos)
  'LV Shoes': 'moda',
  'Prada Shoes': 'moda',
  'Hermes Shoes': 'moda',
  'Burberry Shoes': 'moda',
  'Dior Shoes': 'moda',
  'Chanel Shoes': 'moda',
  'Gucci Shoes': 'moda',
  'Fendi Shoes': 'moda',
  'Balenciaga Shoes': 'moda',
  'BALMAIN Shoes': 'moda',
  'MiuMiu Shoes': 'moda',
  'Jimmy Choo Shoes': 'moda',
  'Christian Louboutin Shoes': 'moda',
  'Hermès Shoes': 'moda',
  'Prada Shoes (New)': 'moda',
  'Dior Shoes (New)': 'moda',
  // → Acessórios (óculos, joias, perfumes, cintos)
  'Louis Vuitton Glasses': 'acessorios',
  'Dior Glasses': 'acessorios',
  'Versace Glasses': 'acessorios',
  'Fendi Glasses': 'acessorios',
  'Cartier Glasses': 'acessorios',
  'Chrome Hearts Glasses': 'acessorios',
  'Dita Glasses': 'acessorios',
  'MontBlanc Glasses': 'acessorios',
  'Gucci Glasses': 'acessorios',
  'Maybach Glasses': 'acessorios',
  'Hermes Glasses': 'acessorios',
  'Chanel Glasses': 'acessorios',
  'Balenciaga Glasses': 'acessorios',
  'YSL Glasses': 'acessorios',
  'Loewe Glasses': 'acessorios',
  'Tiffany Glasses': 'acessorios',
  'MiuMiu Glasses': 'acessorios',
  'Prada Glasses': 'acessorios',
  'Cartier Jewelry': 'acessorios',
  'Bulgari Jewelry': 'acessorios',
  'Louis Vuitton Jewelry': 'acessorios',
  'Dior Jewelry': 'acessorios',
  'YSL Jewelry': 'acessorios',
  'Van Cleef & Arpels Jewelry': 'acessorios',
  'Tiffany Jewelry': 'acessorios',
  'MiuMiu Jewelry': 'acessorios',
  'Dior Perfume': 'acessorios',
  'Chanel Perfume': 'acessorios',
  'Hermes Perfume': 'acessorios',
  'Tom Ford Perfume': 'acessorios',
  'Bvlgari Perfume': 'acessorios',
  'YSL Perfume': 'acessorios',
  'Hermes Belt': 'acessorios',
  'LV Belt': 'acessorios',
  'Prada Belt': 'acessorios',
  'Chanel Belt': 'acessorios',
};

// Price ranges by category (min, max) in BRL
const PRICE_RANGES = {
  'relogios':   [1500,  25000],
  'bolsas':     [800,   8000],
  'moda':       [500,   3000],
  'acessorios': [300,   2500],
};

function randPrice(slug) {
  const [min, max] = PRICE_RANGES[slug] || [500, 5000];
  const step = 50;
  const steps = Math.floor((max - min) / step);
  return min + Math.floor(Math.random() * steps) * step;
}

function randStock() {
  return Math.floor(Math.random() * 15) + 3; // 3–17
}

// Generate clean English product name from category + goods_id suffix
function makeName(category, goodsId, index) {
  const suffix = goodsId ? goodsId.slice(-5) : String(index).padStart(4, '0');
  return `${category} #${suffix}`;
}

// Generate unique slug
function makeSlug(category, goodsId) {
  const base = category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const suffix = goodsId ? goodsId.slice(-8) : Math.random().toString(36).slice(2, 10);
  return `${base}-${suffix}`;
}

async function main() {
  const dataPath = path.join(__dirname, '../../weshop-products.json');
  if (!fs.existsSync(dataPath)) {
    console.error('weshop-products.json not found at', dataPath);
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`Loaded ${products.length} products from JSON`);

  // Load categories from DB
  const categories = await prisma.category.findMany();
  const catBySlug = Object.fromEntries(categories.map(c => [c.slug, c]));
  console.log('Categories in DB:', categories.map(c => c.slug).join(', '));

  // Check existing slugs to avoid conflicts
  const existing = await prisma.product.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existing.map(p => p.slug));
  console.log(`Existing products in DB: ${existing.length}`);

  let created = 0;
  let skipped = 0;
  let noCategory = 0;

  // Process in batches of 50
  const BATCH = 50;
  const toCreate = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const catSlug = CATEGORY_MAP[p.category];

    if (!catSlug) {
      noCategory++;
      continue;
    }

    const cat = catBySlug[catSlug];
    if (!cat) {
      noCategory++;
      continue;
    }

    // Generate unique slug
    let slug = makeSlug(p.category, p.goods_id);
    let attempt = 0;
    while (existingSlugs.has(slug)) {
      attempt++;
      slug = makeSlug(p.category, p.goods_id) + '-' + attempt;
    }
    existingSlugs.add(slug);

    const images = (p.images || []).filter(Boolean).slice(0, 8);
    const description = (p.title || '').replace(/\n/g, ' ').trim().slice(0, 500)
      || `${p.category} — luxury imported product.`;

    toCreate.push({
      slug,
      name: makeName(p.category, p.goods_id, i),
      description,
      price: randPrice(catSlug),
      stock: randStock(),
      images: JSON.stringify(images),
      featured: i % 20 === 0, // every 20th product is featured
      active: true,
      categoryId: cat.id,
    });
  }

  console.log(`\nPrepared ${toCreate.length} products to insert (${noCategory} skipped — no category mapping)`);

  // Insert in batches
  for (let i = 0; i < toCreate.length; i += BATCH) {
    const batch = toCreate.slice(i, i + BATCH);
    await prisma.product.createMany({ data: batch });
    created += batch.length;
    process.stdout.write(`\r  Inserted ${created}/${toCreate.length}...`);
  }

  console.log(`\n\n✓ Done! ${created} products imported.`);

  // Final count
  const total = await prisma.product.count();
  console.log(`Total products in DB now: ${total}`);

  // Count per category
  const counts = await prisma.product.groupBy({
    by: ['categoryId'],
    _count: { id: true },
  });
  for (const c of counts) {
    const cat = categories.find(x => x.id === c.categoryId);
    console.log(`  ${cat?.name}: ${c._count.id}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
