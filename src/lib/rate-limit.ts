/**
 * In-Memory Rate Limiter — Token Bucket Algorithm
 *
 * Protects critical API routes (login, register, checkout) against:
 * - Brute-force password attacks
 * - Credential stuffing
 * - Checkout abuse / card testing
 *
 * Implementation: Uses a sliding-window token bucket per IP address.
 * Each IP gets a fixed number of tokens that refill over time.
 * When tokens run out, requests are rejected with HTTP 429.
 *
 * Trade-off: In-memory storage means rate limits reset on server restart
 * and don't work across multiple server instances. For production with
 * multiple replicas, replace the Map with Redis (e.g., @upstash/ratelimit).
 * This in-memory approach is appropriate for single-instance deployments
 * and development.
 *
 * Periodic cleanup runs every 60s to evict stale entries and prevent
 * unbounded memory growth from unique IPs.
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  /** Maximum tokens (requests) in the bucket */
  maxTokens: number;
  /** Time window in milliseconds for a full refill */
  refillWindowMs: number;
}

// Preset configurations for different route sensitivities
export const RATE_LIMIT_PRESETS = {
  /** Login: 5 attempts per 15 minutes — prevents brute-force */
  login: { maxTokens: 5, refillWindowMs: 15 * 60 * 1000 },

  /** Register: 3 attempts per 15 minutes — prevents mass account creation */
  register: { maxTokens: 3, refillWindowMs: 15 * 60 * 1000 },

  /** Checkout: 10 attempts per 15 minutes — prevents card testing */
  checkout: { maxTokens: 10, refillWindowMs: 15 * 60 * 1000 },

  /** General API: 60 requests per minute */
  general: { maxTokens: 60, refillWindowMs: 60 * 1000 },
} as const;

class RateLimiter {
  private buckets: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: RateLimitConfig) {
    this.config = config;
    // Cleanup stale entries every 60 seconds to prevent memory leaks
    this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);
    // Allow Node.js to exit even if the interval is active
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Check if a request from the given identifier (IP) is allowed.
   * Returns { allowed, remainingTokens, retryAfterMs }.
   */
  check(identifier: string): {
    allowed: boolean;
    remainingTokens: number;
    retryAfterMs: number;
  } {
    const now = Date.now();
    let entry = this.buckets.get(identifier);

    if (!entry) {
      // First request from this IP: full bucket minus one token
      entry = { tokens: this.config.maxTokens - 1, lastRefill: now };
      this.buckets.set(identifier, entry);
      return {
        allowed: true,
        remainingTokens: entry.tokens,
        retryAfterMs: 0,
      };
    }

    // Calculate how many tokens to add back based on elapsed time
    const elapsed = now - entry.lastRefill;
    const refillRate = this.config.maxTokens / this.config.refillWindowMs;
    const tokensToAdd = elapsed * refillRate;

    entry.tokens = Math.min(this.config.maxTokens, entry.tokens + tokensToAdd);
    entry.lastRefill = now;

    if (entry.tokens < 1) {
      // No tokens left: calculate when the next token will be available
      const deficit = 1 - entry.tokens;
      const retryAfterMs = Math.ceil(deficit / refillRate);
      return {
        allowed: false,
        remainingTokens: 0,
        retryAfterMs,
      };
    }

    // Consume one token
    entry.tokens -= 1;
    return {
      allowed: true,
      remainingTokens: Math.floor(entry.tokens),
      retryAfterMs: 0,
    };
  }

  /** Remove entries that have fully refilled (inactive IPs) */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.buckets) {
      if (now - entry.lastRefill > this.config.refillWindowMs) {
        this.buckets.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.buckets.clear();
  }
}

// Singleton instances per route type — survive across requests in the
// same server process (Next.js API routes are long-lived in production).
const limiters = new Map<string, RateLimiter>();

/**
 * Get or create a rate limiter for the given route key.
 *
 * Usage in API routes:
 * ```ts
 * import { rateLimit, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";
 *
 * export async function POST(request: Request) {
 *   const ip = request.headers.get("x-forwarded-for") ?? "unknown";
 *   const { allowed, retryAfterMs } = rateLimit("login", ip);
 *
 *   if (!allowed) {
 *     return Response.json(
 *       { error: "Muitas tentativas. Tente novamente mais tarde." },
 *       {
 *         status: 429,
 *         headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
 *       }
 *     );
 *   }
 *   // ... proceed with login logic
 * }
 * ```
 */
export function rateLimit(
  routeKey: keyof typeof RATE_LIMIT_PRESETS,
  identifier: string
) {
  let limiter = limiters.get(routeKey);
  if (!limiter) {
    limiter = new RateLimiter(RATE_LIMIT_PRESETS[routeKey]);
    limiters.set(routeKey, limiter);
  }
  return limiter.check(identifier);
}
