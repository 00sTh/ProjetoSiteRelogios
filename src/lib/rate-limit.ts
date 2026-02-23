/**
 * Rate Limiter in-memory para rotas de API do Next.js.
 *
 * Decisões de segurança:
 * - Usa sliding window simplificado: cada IP tem um array de timestamps.
 * - Limites diferentes por rota (login mais restrito que checkout).
 * - Cleanup automático a cada 60s para evitar memory leak.
 * - Em produção, substituir por Redis (ioredis) para funcionar em
 *   ambientes multi-instância (Vercel serverless, k8s, etc.).
 *
 * Proteção contra: brute-force em login, credential stuffing,
 * abuso de API de checkout para enumeração de cartões.
 */

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitConfig {
  /** Número máximo de requisições permitidas na janela */
  maxRequests: number;
  /** Janela de tempo em milissegundos */
  windowMs: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup periódico para evitar vazamento de memória
const CLEANUP_INTERVAL_MS = 60_000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup(windowMs: number) {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
  // Não impedir o processo de terminar
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

export const RATE_LIMIT_CONFIGS = {
  /** Login: 5 tentativas por minuto por IP */
  login: { maxRequests: 5, windowMs: 60_000 } satisfies RateLimitConfig,
  /** Checkout: 10 tentativas por minuto por IP */
  checkout: { maxRequests: 10, windowMs: 60_000 } satisfies RateLimitConfig,
  /** Registro: 3 tentativas por minuto por IP */
  register: { maxRequests: 3, windowMs: 60_000 } satisfies RateLimitConfig,
  /** Rotas genéricas: 30 req/min */
  general: { maxRequests: 30, windowMs: 60_000 } satisfies RateLimitConfig,
} as const;

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetInMs: number;
}

/**
 * Verifica se o IP pode fazer a requisição dentro do limite configurado.
 *
 * @param identifier - Normalmente o IP do cliente (request.headers.get("x-forwarded-for"))
 * @param route - Chave da configuração (login, checkout, register, general)
 */
export function checkRateLimit(
  identifier: string,
  route: keyof typeof RATE_LIMIT_CONFIGS
): RateLimitResult {
  const config = RATE_LIMIT_CONFIGS[route];
  ensureCleanup(config.windowMs);

  const key = `${route}:${identifier}`;
  const now = Date.now();

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps fora da janela
  entry.timestamps = entry.timestamps.filter(
    (t) => now - t < config.windowMs
  );

  if (entry.timestamps.length >= config.maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const resetInMs = config.windowMs - (now - oldestInWindow);
    return {
      success: false,
      remaining: 0,
      resetInMs,
    };
  }

  entry.timestamps.push(now);

  return {
    success: true,
    remaining: config.maxRequests - entry.timestamps.length,
    resetInMs: config.windowMs,
  };
}

/**
 * Helper para criar resposta HTTP 429 padronizada.
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Muitas requisições. Tente novamente em breve.",
      retryAfterMs: result.resetInMs,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil(result.resetInMs / 1000)),
        "X-RateLimit-Remaining": String(result.remaining),
      },
    }
  );
}
