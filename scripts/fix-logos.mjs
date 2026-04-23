// node --env-file=.env.local scripts/fix-logos.mjs
// Re-fetches transparent PNG logos for all brands via Serper + Gemini + Cloudinary
import { neon } from "@neondatabase/serverless";
import { v2 as cloudinary } from "cloudinary";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SERPER_KEY = "cd997fc33c9a6729c8adef285e619d284e0e5be6";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const sql = neon(process.env.DATABASE_URL);

async function serperImages(query, num = 10) {
  const res = await fetch("https://google.serper.dev/images", {
    method: "POST",
    headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num }),
  });
  const data = await res.json();
  return (data.images || []).map(i => ({ url: i.imageUrl, title: i.title || "" })).filter(i => i.url);
}

async function pickBestLogo(candidates, brandName) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const parts = [];
  const validItems = [];

  for (const item of candidates.slice(0, 6)) {
    try {
      const res = await fetch(item.url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const mime = (res.headers.get("content-type") || "image/jpeg").split(";")[0];
      if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(mime)) continue;
      parts.push({ inlineData: { data: buf.toString("base64"), mimeType: mime === "image/svg+xml" ? "image/png" : mime } });
      validItems.push(item);
    } catch { /* skip */ }
  }

  if (!validItems.length) return null;
  if (validItems.length === 1) return validItems[0].url;

  try {
    const result = await model.generateContent([
      {
        text: `These are logo images for the brand "${brandName}". Which image (index 0-${validItems.length - 1}) is the best official logo with: (1) transparent or white/light background, (2) clearly shows the brand name/symbol, (3) no watermarks or extra text. Reply ONLY with the number.`,
      },
      ...parts,
    ]);
    const idx = parseInt(result.response.text().trim());
    return validItems[isNaN(idx) ? 0 : Math.min(idx, validItems.length - 1)].url;
  } catch {
    return validItems[0].url;
  }
}

async function uploadLogoToCloudinary(url, slug) {
  try {
    const res = await cloudinary.uploader.upload(url, {
      folder: "slc/logos",
      public_id: slug + "_clean",
      resource_type: "image",
      format: "png",
      transformation: [
        { effect: "trim:15" },
        { background: "transparent" },
      ],
      overwrite: true,
    });
    return res.secure_url;
  } catch (e) {
    console.log(`  ⚠️ Upload falhou: ${e.message}`);
    return null;
  }
}

function addCloudinaryTrim(existingUrl) {
  // Insert e_trim,b_transparent,f_png transformation into existing Cloudinary URL
  if (!existingUrl || !existingUrl.includes("res.cloudinary.com")) return existingUrl;
  return existingUrl.replace(
    "/image/upload/",
    "/image/upload/e_trim:20,b_transparent,f_png/"
  );
}

async function main() {
  const brands = await sql`SELECT id, name, slug, logo FROM brands WHERE logo IS NOT NULL ORDER BY name`;
  console.log(`\n═══ FIX LOGOS: ${brands.length} marcas ═══\n`);

  for (let i = 0; i < brands.length; i++) {
    const b = brands[i];
    console.log(`[${i + 1}/${brands.length}] ${b.name}`);

    try {
      // Buscar logo transparente no Serper com múltiplas queries
      let candidates = [];

      // Query 1: logo transparent PNG nos melhores sites
      const q1 = await serperImages(`${b.name} logo transparent PNG site:worldvectorlogo.com OR site:seeklogo.com OR site:logos-world.net`, 6);
      candidates.push(...q1);

      // Query 2: logo oficial marca
      if (candidates.filter(c => c.url.endsWith(".png") || c.url.includes(".png")).length < 2) {
        const q2 = await serperImages(`${b.name} official logo transparent background high resolution PNG`, 6);
        candidates.push(...q2);
      }

      // Filtrar: priorizar PNGs
      const pngs = candidates.filter(c => c.url.toLowerCase().includes(".png"));
      const others = candidates.filter(c => !c.url.toLowerCase().includes(".png"));
      const sorted = [...pngs, ...others];

      console.log(`  🔍 ${sorted.length} candidatos (${pngs.length} PNG)`);

      if (sorted.length > 0) {
        const bestUrl = await pickBestLogo(sorted, b.name);
        if (bestUrl) {
          const cloudUrl = await uploadLogoToCloudinary(bestUrl, b.slug);
          if (cloudUrl) {
            await sql`UPDATE brands SET logo = ${cloudUrl} WHERE id = ${b.id}`;
            console.log(`  ✅ Novo logo: ${cloudUrl}`);
            await new Promise(r => setTimeout(r, 800));
            continue;
          }
        }
      }

      // Fallback: adicionar transformação Cloudinary ao logo existente
      const trimmedUrl = addCloudinaryTrim(b.logo);
      if (trimmedUrl !== b.logo) {
        await sql`UPDATE brands SET logo = ${trimmedUrl} WHERE id = ${b.id}`;
        console.log(`  ✂️ Trim aplicado no logo existente`);
      } else {
        console.log(`  ⏭️ Sem mudança`);
      }
    } catch (e) {
      console.log(`  ❌ ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 800));
  }

  console.log("\n🎉 Logos concluídos!\n");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
