/**
 * LuxImport one-time data fix v2
 *
 * A — Strip #XXXXX hash suffix from product names
 * B — Rename moda → sapatos
 * C — Create oculos category, migrate glasses from acessorios
 *
 * Run: DATABASE_URL="file:./prisma/dev.db" node prisma/fix-products-v2.cjs
 */

const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();

const HASH_SUFFIX = /\s*#[A-Za-z0-9_\-]+$/;

async function main() {
  // ── A: Strip #XXXXX from product names ────────────────────────────────────
  console.log('A: Stripping hash suffixes from product names...');
  const BATCH = 200;
  let offset = 0;
  let totalFixed = 0;

  while (true) {
    const products = await prisma.product.findMany({
      take: BATCH,
      skip: offset,
      select: { id: true, name: true },
    });
    if (products.length === 0) break;

    const toFix = products.filter((p) => HASH_SUFFIX.test(p.name));
    for (const p of toFix) {
      const cleaned = p.name.replace(HASH_SUFFIX, '').trim();
      await prisma.product.update({ where: { id: p.id }, data: { name: cleaned } });
    }
    totalFixed += toFix.length;
    if (toFix.length > 0) {
      console.log(`   Batch ${Math.floor(offset / BATCH) + 1}: cleaned ${toFix.length}/${products.length}`);
    }

    offset += BATCH;
    if (products.length < BATCH) break;
  }
  console.log(`A: Cleaned ${totalFixed} product names.`);

  // ── B: Rename moda → sapatos ───────────────────────────────────────────────
  console.log('\nB: Renaming moda → sapatos...');
  const moda = await prisma.category.findUnique({ where: { slug: 'moda' } });
  if (moda) {
    await prisma.category.update({
      where: { id: moda.id },
      data: { slug: 'sapatos', name: 'Sapatos' },
    });
    console.log('B: Done.');
  } else {
    console.log('B: Category "moda" not found — skipped.');
  }

  // ── C: Create oculos, migrate glasses ─────────────────────────────────────
  console.log('\nC: Setting up oculos category...');
  const acessorios = await prisma.category.findUnique({ where: { slug: 'acessorios' } });
  if (!acessorios) {
    console.log('C: Category "acessorios" not found — skipped.');
  } else {
    let oculos = await prisma.category.findUnique({ where: { slug: 'oculos' } });
    if (!oculos) {
      oculos = await prisma.category.create({
        data: { id: randomUUID(), name: 'Óculos', slug: 'oculos' },
      });
      console.log('C: Created category oculos.');
    } else {
      console.log('C: Category oculos already exists.');
    }

    const migrated = await prisma.product.updateMany({
      where: {
        categoryId: acessorios.id,
        name: { contains: 'Glasses' },
      },
      data: { categoryId: oculos.id },
    });
    console.log(`C: Migrated ${migrated.count} glasses products to oculos.`);
  }

  console.log('\nDone.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
