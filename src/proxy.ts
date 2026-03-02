/**
 * middleware.ts — Auth (Clerk) + Security headers
 *
 * Rotas públicas: /, /sign-in, /sign-up, /products, /sobre-nos,
 *   /videos, /politica-de-privacidade, /termos-de-uso, /loja,
 *   /api/newsletter, /api/webhooks, /api/check-payment, /api/frete
 *
 * Rotas admin: exige userId + role === "admin"
 * Rotas protegidas: /account, /cart, /checkout, /wishlist — exige userId
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Rotas que exigem login (não-autenticado → sign-in)
const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/wishlist(.*)",
]);

function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  return res;
}

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    if (!userId) {
      return withSecurityHeaders(
        NextResponse.redirect(new URL("/sign-in?redirect_url=/admin", request.url))
      );
    }
    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    if (role !== "admin") {
      return withSecurityHeaders(
        NextResponse.redirect(new URL("/acesso-negado", request.url))
      );
    }
  }

  if (isProtectedRoute(request) && !userId) {
    return withSecurityHeaders(
      NextResponse.redirect(
        new URL(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`, request.url)
      )
    );
  }

  return withSecurityHeaders(NextResponse.next());
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
