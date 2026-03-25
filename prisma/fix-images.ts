// Rebusca imagens corretas via Serper.dev para produtos com imagens genéricas do Unsplash
import { neon } from "@neondatabase/serverless";
import { v2 as cloudinary } from "cloudinary";

const sql = neon(process.env.DATABASE_URL!);
const SERPER_KEY = "cd997fc33c9a6729c8adef285e619d284e0e5be6";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function searchImages(query: string): Promise<string[]> {
  const res = await fetch("https://google.serper.dev/images", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-KEY": SERPER_KEY },
    body: JSON.stringify({ q: `${query} official product photo`, num: 5 }),
  });
  const data = (await res.json()) as { images?: { imageUrl: string }[] };
  return (data.images || [])
    .map((i) => i.imageUrl)
    .filter((u) => u.startsWith("http") && !u.includes("unsplash"));
}

async function uploadFromUrl(url: string, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      url,
      { folder, resource_type: "image", timeout: 20000 },
      (err, result) => {
        if (err || !result) reject(err ?? new Error("upload failed"));
        else resolve(result.secure_url);
      }
    );
  });
}

async function main() {
  const products = await sql`
    SELECT id, name FROM products
    WHERE images[1] LIKE 'https://images.unsplash.com%'
    ORDER BY name
  `;

  console.log(`Atualizando ${products.length} produtos...`);

  for (let i = 0; i < products.length; i++) {
    const p = products[i] as { id: string; name: string };
    process.stdout.write(`[${i + 1}/${products.length}] ${p.name.substring(0, 40)}... `);

    try {
      const urls = await searchImages(p.name);
      if (!urls.length) { console.log("sem resultados"); continue; }

      let uploaded: string | null = null;
      for (const url of urls) {
        try {
          uploaded = await uploadFromUrl(url, "slc/products");
          break;
        } catch { /* tenta próxima */ }
      }

      if (!uploaded) { console.log("upload falhou"); continue; }

      await sql`UPDATE products SET images = ARRAY[${uploaded}] WHERE id = ${p.id}`;
      console.log("✓");
    } catch (e) {
      console.log(`erro: ${(e as Error).message}`);
    }

    // Rate limit: 3 req/s no Serper free
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log("Concluído!");
}

main().catch(console.error);
