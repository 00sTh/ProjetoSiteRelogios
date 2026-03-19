"server-only";

import { unstable_cache } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_PROMPT = `Analise esta imagem de produto de luxo. Retorne um JSON com:
{
  "colors": ["cor1", "cor2"],
  "brand": "NomeDaMarca",
  "model": "NomeDoModelo"
}
Regras:
- colors: máximo 4 cores em português (ex: "Preto", "Dourado", "Azul Marinho", "Prata", "Rose Gold")
- brand: marca detectada (ex: "Rolex", "Louis Vuitton", "Omega") ou null se não identificada
- model: modelo específico (ex: "Submariner", "Neverfull", "Speedmaster") ou null se não identificado
Apenas JSON puro, sem markdown, sem explicações.`;

async function analyzeWithGemini(imageUrl: string): Promise<{
  colors: string[];
  brand: string | null;
  model: string | null;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { colors: [], brand: null, model: null };

  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const res = await fetch(imageUrl, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return { colors: [], brand: null, model: null };
  const buf = Buffer.from(await res.arrayBuffer());
  const base64 = buf.toString("base64");
  const mimeType = (res.headers.get("content-type") ?? "image/jpeg").split(";")[0]!;

  const result = await geminiModel.generateContent([
    GEMINI_PROMPT,
    { inlineData: { data: base64, mimeType } },
  ]);
  const text = result.response.text().trim();
  const cleaned = text.replace(/```json?|```/g, "").trim();
  const json = JSON.parse(cleaned);
  return {
    colors: Array.isArray(json.colors) ? json.colors.slice(0, 4) : [],
    brand: typeof json.brand === "string" ? json.brand : null,
    model: typeof json.model === "string" ? json.model : null,
  };
}

// ─── Sharp fallback (pixel sampling) ─────────────────────────────────────────

const COLOR_CENTERS: { name: string; r: number; g: number; b: number }[] = [
  { name: "Preto",     r: 25,  g: 25,  b: 25  },
  { name: "Cinza",     r: 110, g: 110, b: 110 },
  { name: "Prata",     r: 175, g: 175, b: 175 },
  { name: "Dourado",   r: 205, g: 165, b: 50  },
  { name: "Rose Gold", r: 200, g: 140, b: 100 },
  { name: "Azul",      r: 30,  g: 60,  b: 180 },
  { name: "Azul Claro",r: 80,  g: 155, b: 215 },
  { name: "Marrom",    r: 125, g: 70,  b: 35  },
  { name: "Vermelho",  r: 195, g: 25,  b: 25  },
  { name: "Verde",     r: 30,  g: 120, b: 55  },
  { name: "Rosa",      r: 215, g: 120, b: 155 },
  { name: "Roxo",      r: 110, g: 40,  b: 160 },
];

const SKIP_NAMES = new Set(["Cinza"]);

function distSq(r: number, g: number, b: number, center: { r: number; g: number; b: number }) {
  return (r - center.r) ** 2 + (g - center.g) ** 2 + (b - center.b) ** 2;
}

function nearestColor(r: number, g: number, b: number): string {
  let best = COLOR_CENTERS[0]!;
  let bestDist = distSq(r, g, b, best);
  for (let i = 1; i < COLOR_CENTERS.length; i++) {
    const d = distSq(r, g, b, COLOR_CENTERS[i]!);
    if (d < bestDist) { bestDist = d; best = COLOR_CENTERS[i]!; }
  }
  return best.name;
}

async function analyzeWithSharp(url: string): Promise<string[]> {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return [];
  const buf = Buffer.from(await res.arrayBuffer());
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const sharp = (await Function('return import("sharp")')()).default;
  const { data } = await sharp(buf)
    .resize(80, 80, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const counts: Record<string, number> = {};
  let sampled = 0;
  for (let i = 0; i < data.length; i += 9) {
    const r = data[i]!; const g = data[i + 1]!; const b = data[i + 2]!;
    const brightness = (r + g + b) / 3;
    if (brightness > 215 || brightness < 12) continue;
    sampled++;
    const name = nearestColor(r, g, b);
    if (!SKIP_NAMES.has(name)) counts[name] = (counts[name] ?? 0) + 1;
  }
  if (sampled === 0) return [];
  return Object.entries(counts)
    .filter(([, c]) => c / sampled > 0.07)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);
}

// ─── Exported functions ───────────────────────────────────────────────────────

/**
 * Returns product colors. Prefers Gemini over Sharp fallback.
 * If colorsAnalyzed is true, returns storedColors directly (no API call).
 */
export const detectProductColors = unstable_cache(
  async (
    productId: string,
    imageUrls: string[],
    colorsAnalyzed: boolean,
    storedColors: string[]
  ): Promise<string[]> => {
    if (colorsAnalyzed) return storedColors;
    if (!imageUrls[0]) return [];
    try {
      const { colors } = await analyzeWithGemini(imageUrls[0]);
      if (colors.length > 0) return colors;
      // Fallback to sharp if Gemini returned nothing
      return await analyzeWithSharp(imageUrls[0]);
    } catch {
      try {
        return await analyzeWithSharp(imageUrls[0]);
      } catch {
        return [];
      }
    }
  },
  ["product-colors-gemini-v1"],
  { revalidate: 60 * 60 * 24 * 7 }
);

/**
 * Full image analysis (colors + brand + model) — used in admin bulk analyze.
 * Cached per productId for 30 days.
 */
export const analyzeProductImage = unstable_cache(
  async (productId: string, imageUrl: string) => {
    try {
      return await analyzeWithGemini(imageUrl);
    } catch {
      return { colors: [] as string[], brand: null, model: null };
    }
  },
  ["product-image-analysis-v1"],
  { revalidate: 60 * 60 * 24 * 30 }
);
