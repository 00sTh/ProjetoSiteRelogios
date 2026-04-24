// node --env-file=.env.local scripts/seed-brand-videos.mjs
// Busca vídeo Vimeo específico para cada marca
import { neon } from "@neondatabase/serverless";

const SERPER_KEY = "cd997fc33c9a6729c8adef285e619d284e0e5be6";
const sql = neon(process.env.DATABASE_URL);

const makeVimeoBg = (id) =>
  `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&background=1`;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Busca vídeos Vimeo no Google via Serper
async function serperVimeo(query, num = 6) {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ q: `site:vimeo.com ${query}`, num }),
  });
  const data = await res.json();
  return (data.organic || [])
    .map(r => ({ link: r.link, title: r.title || "" }))
    .filter(r => r.link?.match(/vimeo\.com\/\d+/));
}

// oEmbed — verifica se o vídeo permite embedding
async function isEmbeddable(id) {
  if (!id) return false;
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`,
      { signal: AbortSignal.timeout(6000) }
    );
    return res.status === 200;
  } catch { return false; }
}

// Testa a lista e retorna primeiro ID embeddable
async function firstEmbeddable(videos) {
  for (const v of videos) {
    const id = v.link?.match(/vimeo\.com\/(\d+)/)?.[1];
    if (!id) continue;
    if (await isEmbeddable(id)) return id;
    await sleep(250);
  }
  return null;
}

// Queries por marca e categoria
const BRAND_QUERIES = {
  // ── RELÓGIOS ──────────────────────────────────────────────────────────────
  "Rolex":           ["Rolex watch cinematic film", "Rolex Submariner Daytona film", "Rolex luxury timepiece editorial"],
  "Patek Philippe":  ["Patek Philippe cinematic film", "Patek Philippe Nautilus editorial", "Patek Philippe luxury watch film"],
  "Audemars Piguet": ["Audemars Piguet Royal Oak film", "Audemars Piguet cinematic campaign", "AP Royal Oak luxury film"],
  "Omega":           ["Omega Seamaster cinematic", "Omega Speedmaster film campaign", "Omega watch luxury editorial"],
  "Cartier":         ["Cartier Santos Ballon Bleu film", "Cartier watch cinematic campaign", "Cartier Tank luxury film"],
  "TAG Heuer":       ["TAG Heuer watch cinematic film", "Tag Heuer Formula 1 campaign film", "TAG Heuer luxury editorial"],
  "IWC":             ["IWC Portugieser Pilot watch film", "IWC Schaffhausen cinematic campaign", "IWC luxury watch editorial"],
  "Jaeger Lecoultre":["Jaeger-LeCoultre watch cinematic", "Jaeger LeCoultre film campaign", "JLC luxury timepiece film"],
  "Tudor":           ["Tudor watch cinematic film", "Tudor Black Bay campaign editorial", "Tudor luxury watch film"],

  // ── PERFUMES ─────────────────────────────────────────────────────────────
  "Bvlgari":              ["Bulgari Bvlgari perfume film campaign", "Bvlgari fragrance editorial cinematic", "Bvlgari luxury scent film"],
  "Cartier":              ["Cartier perfume fragrance film", "Cartier Les Heures film", "Cartier scent campaign cinematic"],
  "Celine":               ["Celine fragrance film campaign", "Celine perfume editorial cinematic", "Celine luxury scent film"],
  "Chanel":               ["Chanel perfume fragrance film", "Chanel N5 Coco Mademoiselle cinematic", "Chanel scent editorial film"],
  "Clive Christian":      ["Clive Christian perfume film", "luxury niche fragrance cinematic", "Clive Christian scent editorial"],
  "Creed":                ["Creed Aventus fragrance film", "Creed perfume cinematic editorial", "Creed luxury scent campaign"],
  "Dior":                 ["Dior Sauvage Jadore perfume film", "Christian Dior fragrance cinematic", "Dior scent campaign editorial"],
  "Guerlain":             ["Guerlain perfume cinematic film", "Guerlain fragrance editorial", "Guerlain Mon Guerlain film"],
  "Maison Francis Kurkdjian": ["Maison Francis Kurkdjian fragrance film", "MFK Baccarat Rouge cinematic", "Francis Kurkdjian perfume editorial"],
  "Parfums de Marly":     ["Parfums de Marly fragrance film", "Parfums de Marly Delina Cassili cinematic", "luxury niche perfume editorial campaign"],
  "Penhaligon's":         ["Penhaligon fragrance film", "Penhaligon's perfume cinematic editorial", "British niche perfume luxury film"],
  "Tom Ford":             ["Tom Ford fragrance film campaign", "Tom Ford Oud Wood Black Orchid cinematic", "Tom Ford perfume editorial luxury"],
  "Yves Saint Laurent":   ["YSL Saint Laurent fragrance film", "Yves Saint Laurent Black Opium campaign", "YSL perfume cinematic editorial"],

  // ── BOLSAS ───────────────────────────────────────────────────────────────
  "Bottega Veneta":  ["Bottega Veneta bag cinematic film", "Bottega Veneta leather goods editorial", "Bottega Veneta fashion film campaign"],
  "Chanel":          ["Chanel handbag film campaign", "Chanel Boy Classic Flap cinematic", "Chanel luxury bag editorial film"],
  "Gucci":           ["Gucci handbag film campaign", "Gucci Dionysus Marmont cinematic", "Gucci luxury bag editorial"],
  "Hermès":          ["Hermès Birkin Kelly bag film", "Hermes leather goods cinematic editorial", "Hermès luxury bag campaign film"],
  "Louis Vuitton":   ["Louis Vuitton handbag film", "LV Neverfull Capucines cinematic", "Louis Vuitton leather goods editorial"],
  "Prada":           ["Prada handbag film campaign", "Prada Galleria Cleo cinematic", "Prada luxury bag editorial"],

  // ── SAPATOS ──────────────────────────────────────────────────────────────
  "Christian Louboutin": ["Christian Louboutin shoes film", "Louboutin heels cinematic campaign", "red sole shoes luxury editorial film"],
  "Jimmy Choo":          ["Jimmy Choo shoes film campaign", "Jimmy Choo heels cinematic editorial", "Jimmy Choo luxury shoes film"],
  "Manolo Blahnik":      ["Manolo Blahnik shoes film", "Manolo Blahnik Hangisi BB cinematic", "Manolo Blahnik luxury heels editorial"],
  "Salvatore Ferragamo": ["Salvatore Ferragamo shoes film", "Ferragamo heels cinematic campaign", "Ferragamo luxury shoes editorial"],
};

// Fallbacks por categoria (se nenhuma query de marca funcionar)
const CAT_FALLBACKS = {
  relogios: "1161989549",  // Precision in the Dark
  perfumes: "852389300",   // LV World of Fragrances
  bolsas:   "517330894",   // Louis Vuitton
  sapatos:  "89283310",    // Minna Parikka fashion
};

async function main() {
  const brands = await sql`
    SELECT b.id, b.name, b.slug, c.slug AS cat
    FROM brands b JOIN categories c ON b."categoryId" = c.id
    ORDER BY c.slug, b.name
  `;

  console.log(`\nBuscando vídeos Vimeo para ${brands.length} marcas...\n`);

  let fixed = 0, fallback = 0;

  for (let i = 0; i < brands.length; i++) {
    const b = brands[i];
    process.stdout.write(`[${i + 1}/${brands.length}] ${b.name} (${b.cat}): `);

    const queries = BRAND_QUERIES[b.name] || [`${b.name} luxury cinematic film campaign`];
    let bestId = null;

    for (const q of queries) {
      const videos = await serperVimeo(q, 6);
      bestId = await firstEmbeddable(videos);
      if (bestId) break;
      await sleep(400);
    }

    if (bestId) {
      await sql`UPDATE brands SET video = ${makeVimeoBg(bestId)} WHERE id = ${b.id}`;
      console.log(`✅ vimeo.com/${bestId}`);
      fixed++;
    } else {
      // Usa fallback da categoria
      const fbId = CAT_FALLBACKS[b.cat];
      if (fbId) {
        await sql`UPDATE brands SET video = ${makeVimeoBg(fbId)} WHERE id = ${b.id}`;
        console.log(`↩ fallback cat (vimeo.com/${fbId})`);
      } else {
        await sql`UPDATE brands SET video = NULL WHERE id = ${b.id}`;
        console.log("→ null");
      }
      fallback++;
    }

    await sleep(500);
  }

  console.log(`\n✅ ${fixed} marcas com vídeo próprio | ↩ ${fallback} com fallback/null\n`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
