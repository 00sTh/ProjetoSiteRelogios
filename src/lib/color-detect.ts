"server-only";

import { unstable_cache } from "next/cache";

// ─── Named color centers (luxury product palette) ─────────────────────────────

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

// Colors to skip in output (usually backgrounds/noise)
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

async function analyzeImageWithSharp(url: string): Promise<string[]> {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return [];

  const buf = Buffer.from(await res.arrayBuffer());

  // Dynamically import sharp (ESM-friendly)
  const sharp = (await import("sharp")).default;

  const { data } = await sharp(buf)
    .resize(80, 80, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const counts: Record<string, number> = {};
  let sampled = 0;

  for (let i = 0; i < data.length; i += 9) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const brightness = (r + g + b) / 3;

    // Skip near-white (background) and extremely dark noise
    if (brightness > 215) continue;
    if (brightness < 12) continue;

    sampled++;
    const name = nearestColor(r, g, b);
    if (!SKIP_NAMES.has(name)) {
      counts[name] = (counts[name] ?? 0) + 1;
    }
  }

  if (sampled === 0) return [];

  return Object.entries(counts)
    .filter(([, c]) => c / sampled > 0.07) // at least 7% presence
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);
}

// ─── Cached detection (keyed by productId) ───────────────────────────────────

/**
 * Returns product colors, preferring pre-analyzed DB values over sharp fallback.
 *
 * @param productId      - Used as cache key
 * @param imageUrls      - Fallback: images to analyze with sharp
 * @param colorsAnalyzed - true if the DB field has been set (even if empty array)
 * @param storedColors   - The colors array from DB (empty = analyzed but no colors found)
 */
export const detectProductColors = unstable_cache(
  async (
    productId: string,
    imageUrls: string[],
    colorsAnalyzed: boolean,
    storedColors: string[]
  ): Promise<string[]> => {
    // DB has pre-analyzed result — return it directly (no sharp needed)
    if (colorsAnalyzed) return storedColors;

    // Fallback: sharp pixel analysis (for products not yet analyzed by AI)
    if (!imageUrls[0]) return [];
    try {
      const results = await Promise.allSettled(
        imageUrls.slice(0, 2).map((url) => analyzeImageWithSharp(url))
      );
      const seen = new Set<string>();
      const colors: string[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") {
          for (const c of r.value) {
            if (!seen.has(c)) { seen.add(c); colors.push(c); }
          }
        }
      }
      return colors.slice(0, 5);
    } catch {
      return [];
    }
  },
  ["product-colors-v2"],
  { revalidate: 60 * 60 * 24 * 7 } // 7 days
);
