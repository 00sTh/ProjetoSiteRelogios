/**
 * Batch AI color analysis for LuxImport products
 *
 * Uses Gemini 1.5 Flash (Google AI) to analyze product images
 * and store detected colors in the database.
 *
 * Resume-safe: products with colors != null are automatically skipped.
 *
 * Run:
 *   GEMINI_API_KEY="AIza..." DATABASE_URL="file:./prisma/dev.db" \
 *     node prisma/analyze-colors.cjs
 */

const { PrismaClient } = require('@prisma/client');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.0-flash-lite';
const TARGET_SLUGS = ['relogios', 'oculos', 'bolsas'];
// Free tier: 10 RPM. CONCURRENCY=2 + DELAY_MS=12000 = 10 req/min.
const CONCURRENCY = 2;
const DELAY_MS = 12000;
const BATCH_SIZE = 50;

// Vocabulário permitido — deve coincidir com os chips do ProductActions
const ALLOWED_COLORS = new Set([
  'Preto', 'Branco', 'Prata', 'Cinza', 'Dourado', 'Rose Gold',
  'Azul', 'Azul Claro', 'Marrom', 'Bege', 'Vermelho',
  'Verde', 'Rosa', 'Roxo', 'Laranja', 'Transparente',
]);

const PROMPT = `Analise esta foto de produto de luxo (relógio, óculos ou bolsa).

Responda SOMENTE com um objeto JSON com dois campos:
1. "brand": a marca do produto (ex: "Rolex", "Omega", "Ray-Ban", "Louis Vuitton", "Gucci"). Se não identificável, use null.
2. "colors": array com as cores principais VISÍVEIS no produto (não o fundo branco/cinza).

Para cores, use APENAS estas palavras:
"Preto","Branco","Prata","Cinza","Dourado","Rose Gold","Azul","Azul Claro","Marrom","Bege","Vermelho","Verde","Rosa","Roxo","Laranja","Transparente"

Máximo 4 cores. Se não identificável, use [].

Exemplo: {"brand":"Rolex","colors":["Preto","Dourado"]}
Resposta:`;

const prisma = new PrismaClient();

/**
 * Calls Gemini API with a product image URL.
 * Downloads the image and sends as base64 inlineData.
 * Returns filtered color array or [] on failure.
 */
async function analyzeImage(imageUrl) {
  // Fetch image
  const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(15_000) });
  if (!imgRes.ok) return [];

  const buf = await imgRes.arrayBuffer();
  const base64 = Buffer.from(buf).toString('base64');
  const mimeType = imgRes.headers.get('content-type')?.split(';')[0] || 'image/jpeg';

  // Call Gemini
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: PROMPT },
        ],
      }],
      generationConfig: { maxOutputTokens: 64, temperature: 0 },
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (response.status === 429) {
    // Rate limited — exponential backoff (max 5 retries)
    if (!analyzeImage._retries) analyzeImage._retries = 0;
    analyzeImage._retries++;
    const wait = Math.min(60_000 * analyzeImage._retries, 300_000);
    const waitSec = Math.round(wait / 1000);
    process.stderr.write(`\n  ⏳ Rate limited, waiting ${waitSec}s (retry ${analyzeImage._retries}/5)...\n`);
    await new Promise((r) => setTimeout(r, wait));
    if (analyzeImage._retries <= 5) return analyzeImage(imageUrl);
    analyzeImage._retries = 0;
    return [];
  }
  analyzeImage._retries = 0;

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Gemini error ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const text = raw.trim().replace(/^```json?\s*/i, '').replace(/```$/, '');

  const parsed = JSON.parse(text);

  const colors = Array.isArray(parsed.colors)
    ? parsed.colors.filter((c) => ALLOWED_COLORS.has(c)).slice(0, 4)
    : [];
  const brand = typeof parsed.brand === 'string' ? parsed.brand.trim() : null;

  return { colors, brand };
}

/**
 * Processes a single product: fetch first image, analyze, save to DB.
 */
async function processProduct(product) {
  let images;
  if (Array.isArray(product.images)) {
    images = product.images;
  } else {
    try {
      images = JSON.parse(product.images || '[]');
    } catch {
      images = [];
    }
  }

  const imageUrl = images[0];
  if (!imageUrl) {
    await prisma.product.update({
      where: { id: product.id },
      data: { colors: JSON.stringify([]), brand: null },
    });
    return { colors: [], brand: null };
  }

  const { colors, brand } = await analyzeImage(imageUrl);
  await prisma.product.update({
    where: { id: product.id },
    data: { colors: JSON.stringify(colors), brand },
  });
  return { colors, brand };
}

/**
 * Processes all unanalyzed products in a category with CONCURRENCY parallel requests.
 */
async function processCategory(categorySlug) {
  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) {
    console.log(`  ⚠️  Category "${categorySlug}" not found — skipping`);
    return;
  }

  const total = await prisma.product.count({
    where: { categoryId: category.id, colors: null },
  });

  if (total === 0) {
    console.log(`  ✅ ${categorySlug}: all products already analyzed`);
    return;
  }

  console.log(`\n📦 ${categorySlug}: ${total} products to analyze`);

  let processed = 0;
  let errors = 0;

  while (true) {
    const batch = await prisma.product.findMany({
      where: { categoryId: category.id, colors: null },
      select: { id: true, images: true },
      take: BATCH_SIZE,
    });

    if (batch.length === 0) break;

    for (let i = 0; i < batch.length; i += CONCURRENCY) {
      const chunk = batch.slice(i, i + CONCURRENCY);

      const results = await Promise.allSettled(
        chunk.map((p) => processProduct(p)),
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          processed++;
          const { colors, brand } = result.value;
          const pct = Math.round((processed / total) * 100);
          process.stdout.write(
            `\r  [${pct}%] ${processed}/${total} — ${brand ?? '?'} ${JSON.stringify(colors)}    `,
          );
        } else {
          errors++;
          console.error(`\n  ❌ Error: ${result.reason?.message ?? result.reason}`);
        }
      }

      // Rate limit: stay under 10 RPM (free tier)
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\n  ✅ ${categorySlug}: done (${processed} analyzed, ${errors} errors)`);
}

async function main() {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não definido. Defina a variável de ambiente antes de rodar.');
  }

  console.log('🤖 LuxImport — AI Color Analysis Pipeline');
  console.log(`   Model: ${MODEL}`);
  console.log(`   Concurrency: ${CONCURRENCY}`);
  console.log(`   Categories: ${TARGET_SLUGS.join(', ')}\n`);

  for (const slug of TARGET_SLUGS) {
    await processCategory(slug);
  }

  console.log('\n🎉 Análise concluída!');
}

main()
  .catch((e) => {
    console.error('\n💥 Fatal:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
