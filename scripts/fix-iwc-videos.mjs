// node --env-file=.env.local scripts/fix-iwc-videos.mjs
import { neon } from "@neondatabase/serverless";

const SERPER_KEY = "cd997fc33c9a6729c8adef285e619d284e0e5be6";
const sql = neon(process.env.DATABASE_URL);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const IWC_PRODUCTS = [
  { slug: "iwc-portugieser-chronograph-iw371617", q: "IWC Portugieser Chronograph IW371617 official" },
  { slug: "iwc-pilot-s-watch-mark-xx-aco",        q: "IWC Pilot Watch Mark XX official review" },
  { slug: "ingenieur-automatico-40",               q: "IWC Ingenieur Automatic 40 2023 official" },
  { slug: "iwc-portofino-automatic-40mm",          q: "IWC Portofino Automatic 40mm official" },
  { slug: "iwc-pilot-s-crono-44",                  q: "IWC Pilot Chronograph 44mm official" },
];

async function searchYT(q) {
  const r = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ q: q + " site:youtube.com", num: 8 }),
  });
  const data = await r.json();
  return (data.organic || [])
    .filter(r => r.link?.includes("youtube.com/watch?v="))
    .map(r => ({ url: r.link, title: r.title }));
}

function extractId(url) {
  return url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)?.[1] || null;
}

async function isEmbeddable(id) {
  try {
    const r = await fetch(`https://www.youtube-nocookie.com/embed/${id}`, {
      signal: AbortSignal.timeout(10000),
    });
    const html = await r.text();
    return !html.includes('"UNPLAYABLE"') && !html.includes('"LOGIN_REQUIRED"') &&
           !html.includes("errorcode=150") && !html.includes('"status":"ERROR"');
  } catch { return false; }
}

async function main() {
  console.log("\n🔧 Corrigindo vídeos IWC...\n");

  for (const p of IWC_PRODUCTS) {
    console.log(`🔍 ${p.q.substring(0, 50)}`);
    const candidates = await searchYT(p.q);
    await sleep(400);

    let found = null;
    for (const c of candidates.slice(0, 5)) {
      const id = extractId(c.url);
      if (!id) continue;
      const ok = await isEmbeddable(id);
      await sleep(300);
      if (ok) { found = { id, title: c.title }; break; }
      console.log(`  ⛔ ${id} bloqueado`);
    }

    if (found) {
      const embedUrl = `https://www.youtube-nocookie.com/embed/${found.id}`;
      await sql`UPDATE products SET video = ${embedUrl}, "updatedAt" = NOW() WHERE slug = ${p.slug}`;
      console.log(`  ✅ ${found.title?.substring(0, 60)}`);
    } else {
      console.log(`  ⚠️ Nenhum vídeo embeddable encontrado`);
    }
    await sleep(600);
  }

  console.log("\n✅ Pronto!\n");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
