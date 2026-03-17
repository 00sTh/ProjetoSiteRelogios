/**
 * One-time fix script for LuxImport product data
 *
 * Operations:
 *   A — Curate featured: 10 watches shown on home grid
 *   B — Clean Chinese descriptions: replace CJK text with Portuguese
 *   C — Deactivate eletronicos category (images likely have Chinese watermarks)
 *
 * Run: node prisma/fix-products.cjs
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CJK_REGEX = /[\u3040-\u30FF\u4E00-\u9FFF]/;

const DESCRIPTIONS = {
  relogios: 'Relógio de luxo importado. Acabamento premium, movimento de alta precisão. Peça exclusiva disponível por encomenda.',
  acessorios: 'Acessório de luxo importado. Material nobre com acabamento refinado. Exclusividade e qualidade premium.',
  moda: 'Peça de moda de luxo importada. Design exclusivo de marca premium internacional.',
  bolsas: 'Bolsa de luxo importada. Couro ou material premium com ferragens douradas. Exclusividade e sofisticação.',
  eletronicos: 'Eletrônico de luxo importado. Tecnologia premium com design sofisticado.',
};

async function main() {
  // ── A: Curate featured ────────────────────────────────────────────────────
  console.log('A: Clearing all featured flags...');
  await prisma.product.updateMany({ data: { featured: false } });

  const watchCategory = await prisma.category.findUnique({ where: { slug: 'relogios' } });
  if (!watchCategory) throw new Error('Category "relogios" not found');

  const watches = await prisma.product.findMany({
    where: { categoryId: watchCategory.id, active: true },
    take: 10,
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true },
  });

  await prisma.product.updateMany({
    where: { id: { in: watches.map((w) => w.id) } },
    data: { featured: true },
  });
  console.log(`A: Marked ${watches.length} watches as featured:`);
  watches.forEach((w) => console.log(`   - ${w.name}`));

  // ── B: Clean Chinese descriptions ─────────────────────────────────────────
  console.log('\nB: Cleaning Chinese descriptions...');

  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const categorySlugMap = Object.fromEntries(categories.map((c) => [c.id, c.slug]));

  const BATCH = 100;
  let offset = 0;
  let totalFixed = 0;

  while (true) {
    const products = await prisma.product.findMany({
      take: BATCH,
      skip: offset,
      select: { id: true, description: true, categoryId: true },
    });
    if (products.length === 0) break;

    const toFix = products.filter((p) => CJK_REGEX.test(p.description));
    if (toFix.length > 0) {
      for (const p of toFix) {
        const slug = categorySlugMap[p.categoryId] ?? 'relogios';
        const description = DESCRIPTIONS[slug] ?? DESCRIPTIONS.relogios;
        await prisma.product.update({ where: { id: p.id }, data: { description } });
      }
      totalFixed += toFix.length;
      console.log(`   Batch ${offset / BATCH + 1}: fixed ${toFix.length}/${products.length}`);
    }

    offset += BATCH;
    if (products.length < BATCH) break;
  }

  console.log(`B: Fixed ${totalFixed} descriptions total.`);

  // ── C: Deactivate eletronicos ─────────────────────────────────────────────
  console.log('\nC: Deactivating eletronicos category...');
  const eletronicosCat = await prisma.category.findUnique({ where: { slug: 'eletronicos' } });
  if (eletronicosCat) {
    const result = await prisma.product.updateMany({
      where: { categoryId: eletronicosCat.id },
      data: { active: false },
    });
    console.log(`C: Deactivated ${result.count} products in eletronicos.`);
  } else {
    console.log('C: Category "eletronicos" not found — skipped.');
  }

  console.log('\nDone.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
