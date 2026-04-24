// node --env-file=.env.local scripts/seed-rich-descriptions.mjs
import { neon } from "@neondatabase/serverless";

const SERPER_KEY = "cd997fc33c9a6729c8adef285e619d284e0e5be6";
const sql = neon(process.env.DATABASE_URL);
const SUFFIX = " superclone replica alta qualidade superclone";
const sleep = ms => new Promise(r => setTimeout(r, ms));

const BRAND_DOMAINS = {
  "Rolex":"rolex.com","Patek Philippe":"patek.com","Audemars Piguet":"audemarspiguet.com",
  "Omega":"omegawatches.com","Cartier":"cartier.com","TAG Heuer":"tagheuer.com",
  "IWC":"iwc.com","Jaeger-LeCoultre":"jaeger-lecoultre.com","Tudor":"tudorwatch.com",
  "Jaeger Lecoultre":"jaeger-lecoultre.com","Breitling":"breitling.com",
  "Panerai":"panerai.com","Hublot":"hublot.com",
  "Chanel":"chanel.com","Hermès":"hermes.com","Gucci":"gucci.com",
  "Louis Vuitton":"louisvuitton.com","Prada":"prada.com","Bottega Veneta":"bottegaveneta.com",
  "Bvlgari":"bulgari.com","Celine":"celine.com","Creed":"creedperfume.com",
  "Dior":"dior.com","Guerlain":"guerlain.com","Maison Francis Kurkdjian":"maisonfranciskurkdjian.com",
  "Parfums de Marly":"parfumsdemarly.com","Penhaligon's":"penhaligons.com",
  "Tom Ford":"tomford.com","Yves Saint Laurent":"yslbeauty.com",
  "Christian Louboutin":"christianlouboutin.com","Jimmy Choo":"jimmychoo.com",
  "Manolo Blahnik":"manoloblahnik.com","Salvatore Ferragamo":"ferragamo.com",
};

const EDITORIAL = {
  relogios: ["hodinkee.com","watchpro.com","ablogtowatch.com","chrono24.com"],
  perfumes: ["fragrantica.com","basenotes.net","parfumo.com"],
  bolsas:   ["purseblog.com","whowhatwear.com","harpersbazaar.com","vogue.com"],
  sapatos:  ["vogue.com","whowhatwear.com","harpersbazaar.com","footwearnews.com"],
};

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36";

async function serperSearch(q, num = 5) {
  try {
    const r = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q, num, gl: "us", hl: "en" }),
    });
    return (await r.json()).organic || [];
  } catch { return []; }
}

async function scrapePage(url) {
  // Try Jina AI first — renders JS, returns clean text
  try {
    const r = await fetch(`https://r.jina.ai/${url}`, {
      headers: { "Accept": "text/plain", "X-Return-Format": "text" },
      signal: AbortSignal.timeout(25000),
    });
    if (r.ok) {
      const text = await r.text();
      const SKIP_PAT = /^(skip to|add to|view in|discover in|menu|search|store|favourites?|sign in|log in|back to|share|filter|sort|close|open|toggle|\$|€|£|R\$|usd|eur|reference \w+$|[*#>|\\])/i;
      const lines = text.split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 40 && !SKIP_PAT.test(l));
      const content = lines.slice(0, 12).join(" ").replace(/\s+/g, " ").substring(0, 1500);
      if (content.length > 100) return content;
    }
  } catch {}

  // Fallback: plain fetch + meta tags
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "text/html", "Accept-Language": "en-US,en;q=0.9" },
      signal: AbortSignal.timeout(12000),
    });
    if (!r.ok) return "";
    const html = await r.text();
    const metaDesc =
      html.match(/<meta\s[^>]*name=["']description["'][^>]*content=["']([^"']{30,})/i)?.[1] ||
      html.match(/<meta\s[^>]*property=["']og:description["'][^>]*content=["']([^"']{30,})/i)?.[1] || "";
    const paras = [...html.matchAll(/<p[^>]*>([^<]{80,600})<\/p>/g)]
      .map(m => m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
      .filter(t => t.length > 60 && !/cookie|privacy|javascript|loading/i.test(t))
      .slice(0, 4);
    return [metaDesc, ...paras].filter(Boolean).join(" ").replace(/\s+/g, " ").substring(0, 800);
  } catch { return ""; }
}

async function scrapeFragrantica(url) {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(12000),
    });
    if (!r.ok) return null;
    const html = await r.text();

    const gender = html.match(/for\s+(women\s+and\s+men|women|men)\b/i)?.[1];
    const genderLabel = !gender ? "" :
      gender.toLowerCase() === "women" ? "Women" :
      gender.toLowerCase() === "men" ? "Men" : "Women and Men";

    const accords = [...html.matchAll(/class=["'][^"']*accord[^"']*["'][^>]*>[\s\S]*?<div[^>]*>([^<]{3,30})<\/div>/gi)]
      .map(m => m[1].trim()).filter(Boolean).slice(0, 6);

    const extractNotes = seg => seg
      ? [...seg.matchAll(/title=["']([^"']{3,30})["']/g)].map(m => m[1]).slice(0, 6)
      : [];
    const topNotes    = extractNotes(html.match(/top\s+notes?[\s\S]{0,300}?(<[^>]+>[\s\S]*?<\/[^>]+>){1,10}/i)?.[0]);
    const heartNotes  = extractNotes(html.match(/(?:middle|heart)\s+notes?[\s\S]{0,300}?(<[^>]+>[\s\S]*?<\/[^>]+>){1,10}/i)?.[0]);
    const baseNotes   = extractNotes(html.match(/base\s+notes?[\s\S]{0,300}?(<[^>]+>[\s\S]*?<\/[^>]+>){1,10}/i)?.[0]);
    const desc = html.match(/<div[^>]*itemprop=["']description["'][^>]*>([\s\S]{50,2000}?)<\/div>/i)?.[1]
      ?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 800) || "";

    return { genderLabel, accords, topNotes, heartNotes, baseNotes, desc };
  } catch { return null; }
}

function cleanSnippet(s) {
  return s?.replace(/\s+/g, " ").replace(/\.\.\.$/, "").trim() || "";
}

function cleanName(raw) {
  return raw
    .replace(/\b(EDP|EDT|\d+\s*ml|\d+\s*mm)\b/gi, "")
    .replace(/\b(couro|verniz|veludo|satin|cetim|camurça|croco|python|leopardo|dourado|prateado|preto|azul|vermelho|branco|marrom|bege|nude|rosa|verde|ouro|prata|aço|titânio)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .substring(0, 55);
}

async function buildDescription(p) {
  const domain = BRAND_DOMAINS[p.brand];
  const name = cleanName(p.name);
  const parts = [];

  // 1. Official brand site — Serper snippet + page scrape
  if (domain) {
    const res = await serperSearch(`site:${domain} "${name}"`, 3);
    await sleep(350);
    for (const r of res.slice(0, 2)) {
      const snippet = cleanSnippet(r.snippet);
      if (snippet.length > 40) parts.push(snippet);
    }
    if (res[0]?.link) {
      const scraped = await scrapePage(res[0].link);
      if (scraped.length > 60) parts.push(scraped);
      await sleep(400);
    }
  }

  // 2a. Perfumes — Fragrantica structured data + Basenotes snippet
  if (p.cat === "perfumes") {
    const fRes = await serperSearch(`site:fragrantica.com "${p.brand}" "${name}"`, 2);
    await sleep(350);
    if (fRes[0]?.link) {
      const fd = await scrapeFragrantica(fRes[0].link);
      await sleep(400);
      if (fd) {
        const noteParts = [];
        if (fd.genderLabel) noteParts.push(`Fragrance for ${fd.genderLabel}.`);
        if (fd.accords.length) noteParts.push(`Main accords: ${fd.accords.join(", ")}.`);
        if (fd.topNotes.length) noteParts.push(`Top notes: ${fd.topNotes.join(", ")}.`);
        if (fd.heartNotes.length) noteParts.push(`Heart notes: ${fd.heartNotes.join(", ")}.`);
        if (fd.baseNotes.length) noteParts.push(`Base notes: ${fd.baseNotes.join(", ")}.`);
        if (noteParts.length) parts.push(noteParts.join(" "));
        if (fd.desc.length > 60) parts.push(fd.desc);
      }
    }
    const bnRes = await serperSearch(`site:basenotes.net "${p.brand}" "${name}"`, 2);
    await sleep(350);
    for (const r of bnRes) {
      const s = cleanSnippet(r.snippet);
      if (s.length > 50) parts.push(s);
    }

  // 2b. Other categories — editorial snippets + page scrapes
  } else {
    const sites = EDITORIAL[p.cat] || [];
    if (sites.length) {
      const siteFilter = sites.slice(0, 3).map(s => `site:${s}`).join(" OR ");
      const editRes = await serperSearch(`"${p.brand}" "${name}" (${siteFilter})`, 6);
      await sleep(350);
      for (const r of editRes.slice(0, 4)) {
        const s = cleanSnippet(r.snippet);
        if (s.length > 50) parts.push(s);
      }
      // Scrape the top editorial page
      if (editRes[0]?.link && !editRes[0].link.includes("youtube")) {
        const scraped = await scrapePage(editRes[0].link);
        if (scraped.length > 80) parts.push(scraped);
        await sleep(400);
      }
    }
  }

  // 3. General web search for additional context
  const genRes = await serperSearch(`"${p.brand}" "${name}" review history design`, 5);
  await sleep(350);
  for (const r of genRes.slice(0, 3)) {
    const s = cleanSnippet(r.snippet);
    if (s.length > 50 && !parts.some(existing => existing.includes(s.substring(0, 30)))) {
      parts.push(s);
    }
  }

  // 4. Fallback — broader search when still low on content
  if (parts.join("").length < 150) {
    const shortName = name.split(" ").slice(0, 3).join(" ");
    const fallRes = await serperSearch(`${p.brand} ${shortName}`, 5);
    await sleep(350);
    for (const r of fallRes.slice(0, 4)) {
      const s = cleanSnippet(r.snippet);
      if (s.length > 50) parts.push(s);
    }
    if (fallRes[0]?.link && !fallRes[0].link.includes("youtube")) {
      const scraped = await scrapePage(fallRes[0].link);
      if (scraped.length > 60) parts.push(scraped);
      await sleep(350);
    }
  }

  // Deduplicate and combine
  const seen = new Set();
  const unique = parts.filter(t => {
    const key = t.substring(0, 40).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return t.length > 30;
  });

  return unique.join("\n\n").replace(/\n{3,}/g, "\n\n").trim().substring(0, 3000);
}

async function main() {
  const products = await sql`
    SELECT p.id, p.name, b.name AS brand, c.slug AS cat
    FROM products p
    JOIN brands b ON p."brandId" = b.id
    JOIN categories c ON p."categoryId" = c.id
    WHERE p.active = true
      AND (p.description IS NULL OR length(p.description) < 1500)
    ORDER BY c.slug, b.name, p.name
  `;

  console.log(`\n📦 ${products.length} produtos — coletando descrições dos sites originais...\n`);
  let updated = 0, skipped = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`\n[${i+1}/${products.length}] ${p.brand} — ${p.name.substring(0, 50)}`);

    const desc = await buildDescription(p);
    console.log(`  📚 ${desc.length} chars coletados`);

    if (desc.length > 100) {
      const final = desc + SUFFIX;
      await sql`UPDATE products SET description = ${final}, "updatedAt" = NOW() WHERE id = ${p.id}`;
      console.log(`  ✅ salvo`);
      updated++;
    } else {
      console.log(`  ⚠️ conteúdo insuficiente, pulando`);
      skipped++;
    }

    await sleep(300);
  }

  console.log(`\n✅ ${updated} atualizados | ${skipped} pulados | ${products.length} total\n`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
