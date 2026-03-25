// Rebusca imagens via Serper.dev para produtos com Unsplash genérico
const { neon } = require("@neondatabase/serverless");
const cloudinary = require("cloudinary").v2;

// env loaded via --env-file flag

const sql = neon(process.env.DATABASE_URL);
const SERPER_KEY = "cd997fc33c9a6729c8adef285e619d284e0e5be6";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const BAD_DOMAINS = ["unsplash", "walmart", "amazon", "mercadolivre", "shopee", "supermercado", "extra.com", "carrefour"];

async function searchImages(name) {
  const res = await fetch("https://google.serper.dev/images", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-KEY": SERPER_KEY },
    body: JSON.stringify({ q: `"${name}" luxury product official photo`, num: 10, gl: "us" }),
  });
  const data = await res.json();
  return (data.images || [])
    .map((i) => i.imageUrl)
    .filter((u) => u.startsWith("http") && !BAD_DOMAINS.some((d) => u.includes(d)));
}

async function upload(url) {
  return new Promise((res, rej) =>
    cloudinary.uploader.upload(url, { folder: "slc/products", resource_type: "image", timeout: 15000 }, (e, r) =>
      e || !r ? rej(e ?? new Error("no result")) : res(r.secure_url)
    )
  );
}

async function main() {
  const prods = await sql`SELECT id, name FROM products WHERE images[1] LIKE 'https://images.unsplash.com%' ORDER BY name`;
  console.log(`\nAtualizando ${prods.length} produtos...\n`);

  let ok = 0, fail = 0;
  for (let i = 0; i < prods.length; i++) {
    const p = prods[i];
    process.stdout.write(`[${i + 1}/${prods.length}] ${p.name.substring(0, 42).padEnd(42)} `);
    try {
      const urls = await searchImages(p.name);
      if (!urls.length) { console.log("sem resultado"); fail++; continue; }
      let done = false;
      for (const url of urls) {
        try {
          const uploaded = await upload(url);
          await sql`UPDATE products SET images = ARRAY[${uploaded}] WHERE id = ${p.id}`;
          console.log("✓");
          done = true; ok++;
          break;
        } catch { /* tenta próxima */ }
      }
      if (!done) { console.log("upload falhou"); fail++; }
    } catch (e) {
      console.log(`erro: ${e.message}`);
      fail++;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log(`\nPronto! ✓ ${ok} atualizados  ✗ ${fail} falhas`);
}

main().catch(console.error);
