/**
 * Web Scraper Seguro e Ético — Catálogo de Relógios
 *
 * Decisões de segurança e ética:
 *
 * 1. User-Agent Rotation:
 *    Pool de User-Agents reais e atualizados. Rotação a cada requisição
 *    para simular tráfego orgânico e evitar fingerprinting.
 *
 * 2. Random Delays:
 *    Pausas aleatórias entre 2-6 segundos entre requisições.
 *    Respeita o servidor alvo e evita bloqueio de IP.
 *    Em conjunto com o limite de concorrência (1 por vez).
 *
 * 3. Sanitização HTML (DOMPurify):
 *    Toda descrição HTML raspada é sanitizada ANTES de salvar no banco.
 *    Remove scripts, event handlers, iframes — previne Stored XSS
 *    caso a descrição seja renderizada no frontend.
 *
 * 4. Respeito ao robots.txt:
 *    Antes de raspar, verificar manualmente o robots.txt do site alvo
 *    e respeitar as diretivas Disallow.
 *
 * Uso: npx tsx scripts/scraper.ts
 */

import puppeteer, { type Browser, type Page } from "puppeteer";
import DOMPurify from "isomorphic-dompurify";

// =============================================================================
// CONFIGURAÇÃO
// =============================================================================

/** URLs dos produtos a serem raspados (adicionar conforme necessário) */
const TARGET_URLS: string[] = [
  // Exemplo: "https://example-watches.com/product/rolex-submariner"
];

/** Pool de User-Agents reais para rotação */
const USER_AGENTS: string[] = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0",
];

/** Delay mínimo e máximo entre requisições (ms) */
const MIN_DELAY_MS = 2000;
const MAX_DELAY_MS = 6000;

/** Número máximo de retentativas por URL */
const MAX_RETRIES = 3;

// =============================================================================
// UTILITÁRIOS
// =============================================================================

/** Retorna um User-Agent aleatório do pool */
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/** Pausa aleatória entre requisições */
function randomDelay(): Promise<void> {
  const delay = Math.floor(
    Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS) + MIN_DELAY_MS
  );
  console.log(`  ⏱  Aguardando ${delay}ms antes da próxima requisição...`);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Sanitiza HTML usando DOMPurify.
 * Remove scripts, event handlers, iframes, e qualquer conteúdo perigoso.
 * Permite apenas tags seguras de formatação de texto.
 */
function sanitizeHTML(dirtyHTML: string): string {
  return DOMPurify.sanitize(dirtyHTML, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "b", "i", "u",
      "ul", "ol", "li", "h1", "h2", "h3", "h4",
      "span", "div", "table", "thead", "tbody", "tr", "td", "th",
    ],
    ALLOWED_ATTR: ["class"],
    KEEP_CONTENT: true,
  });
}

// =============================================================================
// INTERFACE DE DADOS RASPADOS
// =============================================================================

interface ScrapedProduct {
  name: string;
  brand: string;
  price: string;
  description: string; // HTML sanitizado
  images: string[];
  sourceUrl: string;
  scrapedAt: string;
}

// =============================================================================
// CORE SCRAPING
// =============================================================================

/**
 * Raspa dados de um produto individual.
 * NOTA: Os seletores CSS abaixo são genéricos e devem ser ajustados
 * conforme o HTML real do site alvo.
 */
async function scrapeProduct(
  page: Page,
  url: string
): Promise<ScrapedProduct | null> {
  try {
    // Rotaciona User-Agent a cada requisição
    const ua = getRandomUserAgent();
    await page.setUserAgent(ua);
    console.log(`  🔄 User-Agent: ${ua.substring(0, 50)}...`);

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30_000,
    });

    // Extrair dados (ajustar seletores conforme site alvo)
    const data = await page.evaluate(() => {
      const getText = (selector: string): string =>
        document.querySelector(selector)?.textContent?.trim() ?? "";
      const getHTML = (selector: string): string =>
        document.querySelector(selector)?.innerHTML ?? "";
      const getImages = (selector: string): string[] =>
        Array.from(document.querySelectorAll<HTMLImageElement>(selector))
          .map((img) => img.src)
          .filter(Boolean);

      return {
        name: getText("h1.product-name, h1[data-testid='product-title'], h1"),
        brand: getText(".product-brand, [data-testid='brand-name'], .brand"),
        price: getText(".product-price, [data-testid='price'], .price"),
        descriptionHTML: getHTML(
          ".product-description, [data-testid='description'], .description"
        ),
        images: getImages(
          ".product-gallery img, [data-testid='product-image'], .gallery img"
        ),
      };
    });

    // Sanitizar o HTML da descrição ANTES de retornar
    const sanitizedDescription = sanitizeHTML(data.descriptionHTML);

    return {
      name: data.name,
      brand: data.brand,
      price: data.price,
      description: sanitizedDescription,
      images: data.images,
      sourceUrl: url,
      scrapedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`  ❌ Erro ao raspar ${url}:`, error);
    return null;
  }
}

/**
 * Raspa um produto com retentativas e backoff exponencial.
 */
async function scrapeWithRetry(
  page: Page,
  url: string
): Promise<ScrapedProduct | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`\n📦 Raspando: ${url} (tentativa ${attempt}/${MAX_RETRIES})`);
    const result = await scrapeProduct(page, url);
    if (result) return result;

    if (attempt < MAX_RETRIES) {
      const backoff = 2000 * Math.pow(2, attempt - 1);
      console.log(`  ♻️  Retentativa em ${backoff}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
  return null;
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  if (TARGET_URLS.length === 0) {
    console.log("⚠️  Nenhuma URL configurada em TARGET_URLS.");
    console.log("   Adicione URLs ao array TARGET_URLS no início do arquivo.");
    return;
  }

  console.log("🚀 Iniciando scraper seguro...");
  console.log(`   ${TARGET_URLS.length} URL(s) para processar`);

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

    // Bloquear recursos desnecessários para performance
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const blockedTypes = ["font", "media"];
      if (blockedTypes.includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    const results: ScrapedProduct[] = [];

    for (let i = 0; i < TARGET_URLS.length; i++) {
      const url = TARGET_URLS[i];
      const product = await scrapeWithRetry(page, url);

      if (product) {
        results.push(product);
        console.log(`  ✅ Sucesso: ${product.name || "Sem nome"}`);
      } else {
        console.log(`  ❌ Falha definitiva: ${url}`);
      }

      // Random delay entre requisições (exceto na última)
      if (i < TARGET_URLS.length - 1) {
        await randomDelay();
      }
    }

    // Output — em produção, salvar no banco via Prisma
    console.log("\n" + "=".repeat(60));
    console.log(`📊 Resultados: ${results.length}/${TARGET_URLS.length} produtos raspados`);
    console.log("=".repeat(60));

    if (results.length > 0) {
      // Salvar como JSON para inspeção
      const fs = await import("fs/promises");
      const outputDir = new URL("./output", import.meta.url).pathname;
      await fs.mkdir(outputDir, { recursive: true });
      const outputPath = `${outputDir}/products-${Date.now()}.json`;
      await fs.writeFile(outputPath, JSON.stringify(results, null, 2), "utf-8");
      console.log(`💾 Resultados salvos em: ${outputPath}`);
    }
  } catch (error) {
    console.error("💥 Erro fatal no scraper:", error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
