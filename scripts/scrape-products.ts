/**
 * WeShop Product Scraper
 * Usage: WESHOP_URL="https://weshop.com/..." npx tsx scripts/scrape-products.ts
 *
 * Extracts product name, price, and images from WeShop product pages,
 * uploads images to Cloudinary, and saves the product via Prisma.
 */
import { chromium } from "@playwright/test";
import { prisma } from "../src/lib/prisma";
import { uploadImage } from "../src/lib/blob";

async function main() {
  const url = process.env.WESHOP_URL;
  if (!url) {
    console.error("Set WESHOP_URL env var to the WeShop product URL");
    process.exit(1);
  }

  const categorySlug = process.env.CATEGORY_SLUG ?? "watches";

  console.log(`Scraping: ${url}`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

  // Extract product data — WeShop renders with JS so we wait for content
  const name = await page
    .locator("h1")
    .first()
    .textContent()
    .then((t: string | null) => t?.trim() ?? "Unnamed Product");

  // Price — WeShop shows CNY price; we just capture the number for manual BRL conversion
  const priceText = await page
    .locator("[class*='price'], [class*='Price']")
    .first()
    .textContent()
    .catch(() => "0");
  const priceNum = parseFloat((priceText ?? "0").replace(/[^0-9.]/g, "")) || 0;

  // Images — grab all product images
  const imgSrcs: string[] = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img"));
    return imgs
      .map((img) => img.src)
      .filter(
        (src) =>
          src &&
          !src.includes("data:") &&
          (src.includes("product") || src.includes("item") || src.includes("goods"))
      )
      .slice(0, 4);
  });

  await browser.close();

  console.log(`Name: ${name}`);
  console.log(`Price (raw): ${priceNum}`);
  console.log(`Images found: ${imgSrcs.length}`);

  // Upload images to Cloudinary
  const uploadedUrls: string[] = [];
  for (const src of imgSrcs) {
    try {
      const res = await fetch(src);
      const buf = Buffer.from(await res.arrayBuffer());
      const result = await uploadImage(buf, `${name}-${Date.now()}.jpg`);
      uploadedUrls.push(result.url);
      console.log(`Uploaded: ${result.url}`);
    } catch (e) {
      console.warn(`Failed to upload ${src}:`, e);
    }
  }

  const finalImages = uploadedUrls.length > 0 ? uploadedUrls : ["/placeholder.svg"];

  // Find category
  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) {
    console.error(`Category "${categorySlug}" not found. Run: npm run db:seed`);
    process.exit(1);
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  // Save product
  const product = await prisma.product.create({
    data: {
      name,
      slug: `${slug}-${Date.now()}`,
      description: `Imported from WeShop. Original price: ¥${priceNum}`,
      price: priceNum * 0.8, // rough CNY→BRL conversion placeholder
      images: finalImages,
      categoryId: category.id,
      stock: 5,
      active: true,
    },
  });

  console.log(`\nProduct created: ${product.id} — ${product.name}`);
  console.log(`Slug: ${product.slug}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
