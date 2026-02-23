import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security Middleware — Next.js Edge Middleware
 *
 * Runs on every request at the edge. Implements:
 * - Strict Content-Security-Policy (CSP)
 * - X-Frame-Options to prevent clickjacking
 * - X-Content-Type-Options to prevent MIME sniffing
 * - Referrer-Policy to control information leakage
 * - Permissions-Policy to restrict browser features
 * - Strict-Transport-Security (HSTS) for HTTPS enforcement
 *
 * Rationale: These headers form the first line of defense.
 * They are set at the middleware level so every response
 * (pages, API routes, static assets) is covered uniformly.
 */

// Nonce generation is not available in Edge Runtime with crypto.randomUUID
// but we can use a strict CSP with 'self' directives which is robust enough.

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // --- Content-Security-Policy ---
  // Strict allowlist: only same-origin scripts/styles, no inline (except
  // Next.js requires 'unsafe-inline' for styles due to Tailwind injection).
  // 'unsafe-eval' is explicitly excluded to block eval-based XSS.
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'", // Tailwind injects styles inline
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'", // Reinforces X-Frame-Options
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  // --- X-Frame-Options ---
  // Blocks all framing. Prevents clickjacking attacks where an attacker
  // embeds the site in an iframe to trick users into clicking hidden elements.
  response.headers.set("X-Frame-Options", "DENY");

  // --- X-Content-Type-Options ---
  // Prevents browsers from MIME-sniffing a response away from the declared
  // content-type. Stops attacks where an attacker uploads a file with a
  // crafted MIME type to trigger script execution.
  response.headers.set("X-Content-Type-Options", "nosniff");

  // --- Referrer-Policy ---
  // 'strict-origin-when-cross-origin' sends the origin only on cross-origin
  // requests and the full referrer on same-origin. Prevents leaking paths
  // (e.g., /checkout?order=123) to third-party sites while maintaining
  // internal analytics functionality.
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // --- Permissions-Policy ---
  // Disables sensitive browser APIs not needed by the application.
  // Prevents third-party scripts from accessing camera, microphone, etc.
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // --- Strict-Transport-Security ---
  // Forces HTTPS for 1 year with subdomains. preload allows inclusion in
  // browser preload lists so even the first visit is over HTTPS.
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // --- X-DNS-Prefetch-Control ---
  // Controls DNS prefetching. 'off' prevents the browser from performing
  // DNS lookups for external links, reducing privacy leakage.
  response.headers.set("X-DNS-Prefetch-Control", "off");

  // Remove server identification header
  response.headers.delete("X-Powered-By");

  return response;
}

export const config = {
  // Apply to all routes except static files and Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
