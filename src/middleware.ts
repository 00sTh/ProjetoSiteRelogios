import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware global do Next.js — intercepta TODAS as requisições.
 *
 * Decisões de segurança:
 * - CSP (Content-Security-Policy): bloqueia scripts inline/externos não autorizados,
 *   mitigando XSS refletido e DOM-based. Usa nonce gerado por requisição.
 * - X-Frame-Options DENY: impede clickjacking ao proibir embedding em iframes.
 * - X-Content-Type-Options nosniff: impede MIME-sniffing que pode transformar
 *   uploads inocentes em vetores de ataque.
 * - Referrer-Policy strict-origin-when-cross-origin: limita vazamento de dados
 *   em cabeçalhos Referer para origens externas.
 * - Permissions-Policy: desabilita APIs de hardware (camera, mic, geolocation)
 *   que não são necessárias em um e-commerce.
 * - Strict-Transport-Security (HSTS): força HTTPS por 1 ano com includeSubDomains.
 */

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  // CSP mais permissiva em dev para hot-reload funcionar
  const cspDirectives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`,
    `img-src 'self' data: https:`,
    `font-src 'self'`,
    `connect-src 'self'${isDev ? " ws://localhost:3000" : ""}`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ];

  const csp = cspDirectives.join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // --- Security Headers ---
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  // Remove header que expõe tecnologia do servidor
  response.headers.delete("X-Powered-By");

  return response;
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware a todas as rotas exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico, robots.txt, sitemap.xml
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
