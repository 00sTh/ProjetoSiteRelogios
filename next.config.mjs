import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "res.cloudinary.com" },
      { hostname: "*.vercel-storage.com" },
      { hostname: "*.public.blob.vercel-storage.com" },
      { hostname: "chart.googleapis.com" },
      { protocol: "http", hostname: "localhost" },
      { hostname: "*.wsxcme.com" },
      { hostname: "xcimg.szwego.com" },
      { hostname: "*.szwego.com" },
      { hostname: "newimg.szwego.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // HSTS — força HTTPS por 1 ano em produção
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Bloqueia carregamento em iframes externos (clickjacking)
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // Evita MIME sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Limita informações de referrer
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Desativa features não utilizadas
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self)",
          },
          // CSP — permite Clerk, Cloudinary, WeShop CDN
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js + Clerk precisam de unsafe-inline/eval
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.clerk.com https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              // Imagens: Cloudinary, WeShop CDN, Unsplash, Clerk avatars, Google Charts
              "img-src 'self' data: blob: https://res.cloudinary.com https://xcimg.szwego.com https://*.szwego.com https://*.wsxcme.com https://images.unsplash.com https://img.clerk.com https://chart.googleapis.com",
              "font-src 'self' data:",
              // Conexões: Clerk, APIs de CEP, Cloudinary upload
              "connect-src 'self' https://*.clerk.com https://*.clerk.dev https://api.cloudinary.com https://viacep.com.br https://brasilapi.com.br https://sandbox.cieloecommerce.cielo.com.br https://api.cieloecommerce.cielo.com.br https://api.userede.com.br",
              // Frames: Clerk (auth), Cloudflare Turnstile
              "frame-src 'self' https://*.clerk.com https://*.clerk.dev https://challenges.cloudflare.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
