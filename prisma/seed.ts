/**
 * Seed do banco de dados — Imports (Watches, Sunglasses, Accessories)
 * Execução: npm run db:seed
 *
 * Schema SQLite: images é String (JSON serializado)
 * Schema PostgreSQL: images é String[] nativo
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function img(url: string): string {
  // SQLite: serializa JSON; PostgreSQL: retorna array (ajustado via cast no upsert)
  return JSON.stringify([url]);
}

async function main() {
  console.log("Iniciando seed Imports...");

  // ── Categorias ──────────────────────────────────────────────────────────────
  // Note: Category model has no "description" field — slug/name only
  const watches = await prisma.category.upsert({
    where: { slug: "watches" },
    update: {},
    create: {
      name: "Watches",
      slug: "watches",
    },
  });

  const sunglasses = await prisma.category.upsert({
    where: { slug: "sunglasses" },
    update: {},
    create: {
      name: "Sunglasses",
      slug: "sunglasses",
    },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: {
      name: "Accessories",
      slug: "accessories",
    },
  });

  console.log("3 categories created");

  // ── Produtos ─────────────────────────────────────────────────────────────────
  const products = [
    // ── Watches ─────────────────────────────────────────────────────────────────
    {
      name: "Royal Oak Prestige",
      slug: "royal-oak-prestige",
      description:
        "An iconic octagonal bezel watch crafted in stainless steel with an integrated bracelet. Features a self-winding mechanical movement, sapphire crystal, and water resistance to 50m. A timeless statement of luxury engineering.",
      price: 48900,
      stock: 3,
      featured: true,
      active: true,
      categoryId: watches.id,
      images: img("/placeholder.svg"),
    },
    {
      name: "Nautilus Classic",
      slug: "nautilus-classic",
      description:
        "Inspired by a porthole design, the Nautilus Classic combines sportiness and elegance. Stainless steel case and integrated bracelet, ultra-thin automatic movement, date display, and water resistance to 120m.",
      price: 35000,
      stock: 4,
      featured: true,
      active: true,
      categoryId: watches.id,
      images: img("/placeholder.svg"),
    },
    {
      name: "Submariner Elite",
      slug: "submariner-elite",
      description:
        "A professional diver's watch with a unidirectional rotatable bezel and water resistance to 300m. Oyster architecture in 904L steel, scratch-resistant sapphire crystal, and luminescent display for legibility in the deep.",
      price: 28500,
      stock: 5,
      featured: false,
      active: true,
      categoryId: watches.id,
      images: img("/placeholder.svg"),
    },
    {
      name: "Datejust Refined",
      slug: "datejust-refined",
      description:
        "The quintessential dress watch featuring an instantaneous date display at 3 o'clock with a Cyclops lens. Fluted bezel, Jubilee bracelet, and perpetual rotor self-winding movement. A symbol of timeless refinement.",
      price: 22000,
      stock: 7,
      featured: false,
      active: true,
      categoryId: watches.id,
      images: img("/placeholder.svg"),
    },
    {
      name: "Pilot Chronograph",
      slug: "pilot-chronograph",
      description:
        "Designed for aviation precision, this chronograph features a large crown for gloved hands, a column-wheel movement, and a slide rule bezel. Anti-magnetic soft iron inner case. Reads time across multiple time zones.",
      price: 15800,
      stock: 8,
      featured: false,
      active: true,
      categoryId: watches.id,
      images: img("/placeholder.svg"),
    },

    // ── Sunglasses ───────────────────────────────────────────────────────────────
    {
      name: "Aviator Gold Edition",
      slug: "aviator-gold-edition",
      description:
        "The definitive aviator silhouette reimagined in 24k gold-plated metal frames. Polarized G-15 glass lenses provide true color perception and UV400 protection. Includes a premium leather case and microfiber cloth.",
      price: 4200,
      stock: 15,
      featured: true,
      active: true,
      categoryId: sunglasses.id,
      images: img("/placeholder.svg"),
    },
    {
      name: "Wayfarer Classic",
      slug: "wayfarer-classic",
      description:
        "The most recognised silhouette in eyewear history, updated with premium acetate frames and CR-39 polarized lenses. Lightweight yet durable construction. UV400 protection in a style that never goes out of fashion.",
      price: 2800,
      stock: 20,
      featured: false,
      active: true,
      categoryId: sunglasses.id,
      images: img("/placeholder.svg"),
    },
    {
      name: "Shield Sport",
      slug: "shield-sport",
      description:
        "Engineered for performance with a single wraparound polycarbonate lens offering full peripheral vision and maximum UV protection. Hydrophilic nose pads and grippy temple tips ensure a secure fit during any activity.",
      price: 1950,
      stock: 18,
      featured: false,
      active: true,
      categoryId: sunglasses.id,
      images: img("/placeholder.svg"),
    },
    {
      name: "Cat Eye Luxe",
      slug: "cat-eye-luxe",
      description:
        "A bold cat-eye frame handcrafted from Italian acetate with upswept corners for a dramatic, glamorous look. Gradient mineral glass lenses, gold-toned rivets, and spring hinges for an impeccable fit. Feminine luxury redefined.",
      price: 3400,
      stock: 12,
      featured: true,
      active: true,
      categoryId: sunglasses.id,
      images: img("/placeholder.svg"),
    },

    // ── Accessories ──────────────────────────────────────────────────────────────
    {
      name: "Leather Watch Roll",
      slug: "leather-watch-roll",
      description:
        "Handstitched full-grain vegetable-tanned leather watch roll with three individual cushioned slots. Secure snap closure, suede interior lining, and a compact rolled format ideal for travel. Accommodates most strap widths.",
      price: 1200,
      stock: 25,
      featured: false,
      active: true,
      categoryId: accessories.id,
      images: img("/placeholder.svg"),
    },
    {
      name: "Carbon Fiber Wallet",
      slug: "carbon-fiber-wallet",
      description:
        "Ultra-slim bifold wallet constructed from aerospace-grade carbon fiber composite. RFID-blocking inner layer protects your cards. Eight card slots, two cash pockets. Weighs just 28g — virtually nothing in your pocket.",
      price: 850,
      stock: 30,
      featured: false,
      active: true,
      categoryId: accessories.id,
      images: img("/placeholder.svg"),
    },
    {
      name: "Silk Pocket Square Set",
      slug: "silk-pocket-square-set",
      description:
        "A curated set of five 33x33cm pocket squares in 100% Macclesfield silk, hand-rolled and hand-finished. Each features a distinct pattern — from classic regimental stripes to bold geometric prints. Complete your tailored look.",
      price: 680,
      stock: 40,
      featured: false,
      active: true,
      categoryId: accessories.id,
      images: img("/placeholder.svg"),
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: product as any,
    });
    console.log(`  ${product.name}`);
  }

  console.log(`\n${products.length} products created`);

  // ── SiteSettings ──────────────────────────────────────────────────────────────
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      heroTitle: "Timepieces of Distinction",
      heroSubtitle:
        "Authenticated luxury watches and premium eyewear, imported directly for the discerning collector.",
      whatsappNumber: "5541999999999",
    },
  });

  console.log("SiteSettings created");
  console.log("\nSeed Imports completed successfully!");
  console.log(
    "   12 products across 3 categories (Watches, Sunglasses, Accessories)"
  );
}

main()
  .catch((e) => {
    console.error("Error in seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
