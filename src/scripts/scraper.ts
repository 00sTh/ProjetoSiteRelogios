/**
 * Web Scraper — Coleta Segura e Ética de Dados de Relógios
 *
 * Medidas de segurança e ética implementadas:
 *
 * 1. Rotação de User-Agent: A cada requisição, um User-Agent diferente é
 *    selecionado aleatoriamente de uma lista realista. Isso distribui as
 *    requisições entre diferentes perfis de navegador, evitando detecção
 *    por fingerprinting de User-Agent.
 *
 * 2. Pausas Aleatórias (Random Delays): Entre cada requisição, o scraper
 *    aguarda um intervalo aleatório entre MIN_DELAY_MS e MAX_DELAY_MS.
 *    Isso simula comportamento humano e evita:
 *    - Bloqueio de IP por rate limiting do servidor alvo
 *    - Sobrecarga do servidor (respeito à infraestrutura alheia)
 *    - Detecção por padrões de timing regulares
 *
 * 3. Sanitização com DOMPurify (via jsdom): Toda descrição HTML raspada é
 *    sanitizada antes de armazenar no banco. Isso previne:
 *    - Stored XSS: HTML malicioso injetado na descrição seria executado
 *      quando a descrição for renderizada no frontend
 *    - Script injection: Tags <script>, event handlers (onload, onerror),
 *      e URLs javascript: são removidos
 *
 * 4. Respeito ao robots.txt: O scraper deve ser configurado para verificar
 *    e respeitar as diretivas do robots.txt do site alvo.
 *
 * Uso: npx tsx src/scripts/scraper.ts
 */

import puppeteer, { type Browser, type Page } from "puppeteer";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

// --- Configuration ---

const MIN_DELAY_MS = 2000;
const MAX_DELAY_MS = 6000;
const MAX_RETRIES = 3;

// --- User-Agent Rotation ---
// Realistic browser User-Agents covering Chrome, Firefox, Safari, and Edge
// on Windows, macOS, and Linux. Updated periodically to stay current.

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// --- Random Delay ---

function randomDelay(): Promise<void> {
  const delay =
    Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) +
    MIN_DELAY_MS;
  console.log(`[Scraper] Aguardando ${delay}ms antes da próxima requisição...`);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// --- HTML Sanitization ---
// Uses DOMPurify with jsdom to sanitize HTML in a Node.js environment.
// Only allows safe formatting tags — all scripts, event handlers,
// and dangerous attributes are stripped.

const window = new JSDOM("").window;
const purify = DOMPurify(window as unknown as Window);

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "ul",
  "ol",
  "li",
  "span",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
];

const ALLOWED_ATTR = ["class"];

function sanitizeHtml(dirty: string): string {
  return purify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
}

// --- Scraper Types ---

interface ScrapedProduct {
  name: string;
  brand: string;
  description: string; // Sanitized HTML
  priceCents: number;
  images: string[];
  sourceUrl: string;
}

// --- Core Scraping Logic ---

async function scrapePage(
  page: Page,
  url: string
): Promise<ScrapedProduct | null> {
  const userAgent = getRandomUserAgent();
  await page.setUserAgent(userAgent);
  console.log(`[Scraper] Navegando para: ${url}`);
  console.log(`[Scraper] User-Agent: ${userAgent}`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30_000,
      });

      // Example selectors — ADAPT these to the actual target site structure.
      // These are illustrative placeholders.
      const product = await page.evaluate(() => {
        const nameEl = document.querySelector("h1.product-title");
        const brandEl = document.querySelector(".product-brand");
        const descEl = document.querySelector(".product-description");
        const priceEl = document.querySelector(".product-price");
        const imageEls = document.querySelectorAll(".product-gallery img");

        const priceText = priceEl?.textContent?.replace(/[^\d,]/g, "") ?? "0";
        const priceCents = Math.round(
          parseFloat(priceText.replace(",", ".")) * 100
        );

        return {
          name: nameEl?.textContent?.trim() ?? "",
          brand: brandEl?.textContent?.trim() ?? "",
          descriptionRaw: descEl?.innerHTML ?? "",
          priceCents,
          images: Array.from(imageEls).map(
            (img) => (img as HTMLImageElement).src
          ),
        };
      });

      if (!product.name) {
        console.warn(`[Scraper] Produto não encontrado em: ${url}`);
        return null;
      }

      // Sanitize the raw HTML description before storage
      const sanitizedDescription = sanitizeHtml(product.descriptionRaw);

      return {
        name: product.name,
        brand: product.brand,
        description: sanitizedDescription,
        priceCents: product.priceCents,
        images: product.images,
        sourceUrl: url,
      };
    } catch (error) {
      console.error(
        `[Scraper] Tentativa ${attempt}/${MAX_RETRIES} falhou para ${url}:`,
        error instanceof Error ? error.message : error
      );
      if (attempt < MAX_RETRIES) {
        await randomDelay();
      }
    }
  }

  console.error(`[Scraper] Todas as tentativas falharam para: ${url}`);
  return null;
}

// --- Main Execution ---

async function main() {
  const urls: string[] = [
    // Add target product URLs here
    // "https://example.com/product/1",
    // "https://example.com/product/2",
  ];

  if (urls.length === 0) {
    console.log(
      "[Scraper] Nenhuma URL configurada. Adicione URLs ao array 'urls' no script."
    );
    return;
  }

  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();

    // Disable loading images and fonts to speed up scraping
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (resourceType === "image" || resourceType === "font") {
        req.abort();
      } else {
        req.continue();
      }
    });

    const results: ScrapedProduct[] = [];

    for (const url of urls) {
      await randomDelay();
      const product = await scrapePage(page, url);
      if (product) {
        results.push(product);
        console.log(`[Scraper] Coletado: ${product.name} (${product.brand})`);
      }
    }

    console.log(`\n[Scraper] Total coletado: ${results.length}/${urls.length}`);
    console.log(JSON.stringify(results, null, 2));

    // TODO: Insert into database using Prisma
    // for (const product of results) {
    //   await prisma.product.upsert({
    //     where: { slug: generateSlug(product.name) },
    //     update: { ...product },
    //     create: { ...product, slug: generateSlug(product.name) },
    //   });
    // }
  } catch (error) {
    console.error("[Scraper] Erro fatal:", error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
