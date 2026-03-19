/**
 * Migra produtos e categorias do SQLite local para o Neon PostgreSQL
 * Run: DATABASE_URL="..." node prisma/migrate-to-neon.cjs
 */
const Database = require('better-sqlite3');
const { Client } = require('pg');
const path = require('path');

const SRC_DB = path.join(__dirname, 'prisma/dev.db');
const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) { console.error('DATABASE_URL not set'); process.exit(1); }

async function main() {
  const sqlite = new Database(SRC_DB, { readonly: true });
  const pg = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await pg.connect();

  // Categories
  const cats = sqlite.prepare('SELECT id, name, slug FROM categories').all();
  console.log(`Inserting ${cats.length} categories...`);
  for (const c of cats) {
    await pg.query(
      `INSERT INTO categories (id, name, slug) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
      [c.id, c.name, c.slug]
    );
  }

  // Products — images stored as JSON string in SQLite, need String[] in PG
  const products = sqlite.prepare(
    'SELECT id, name, slug, description, price, images, stock, active, featured, "categoryId", brand, "createdAt" FROM products'
  ).all();
  console.log(`Inserting ${products.length} products...`);

  let ok = 0, fail = 0;
  for (const p of products) {
    let images = [];
    try { images = JSON.parse(p.images || '[]'); } catch { images = []; }
    if (!Array.isArray(images)) images = [images];

    try {
      await pg.query(
        `INSERT INTO products (id, name, slug, description, price, images, stock, active, featured, "categoryId", brand, "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,to_timestamp($12::bigint/1000),NOW())
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.name, p.slug, p.description, p.price, images,
         p.stock, p.active === 1, p.featured === 1, p.categoryId, p.brand || null, p.createdAt]
      );
      ok++;
    } catch (e) {
      fail++;
      if (fail <= 3) console.error('  fail:', p.slug, e.message);
    }
  }

  console.log(`Done: ${ok} inserted, ${fail} failed`);
  await pg.end();
  sqlite.close();
}

main().catch(e => { console.error(e); process.exit(1); });
