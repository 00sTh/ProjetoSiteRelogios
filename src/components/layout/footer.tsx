import Link from "next/link";
import { Sparkles, Instagram, Youtube, Twitter } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { getSiteSettings } from "@/actions/admin";

const storeLinks = [
  { href: "/products", label: "Todos os produtos" },
  { href: "/products?featured=true", label: "Destaques" },
  { href: "/wishlist", label: "Lista de Desejos" },
  { href: "/sobre-nos", label: "Sobre Nós" },
  { href: "/videos", label: "Vídeos" },
];

const accountLinks = [
  { href: "/account", label: "Minha conta" },
  { href: "/cart", label: "Carrinho" },
  { href: "/checkout", label: "Finalizar compra" },
  { href: "/politica-de-privacidade", label: "Privacidade" },
  { href: "/termos-de-uso", label: "Termos de Uso" },
];

export async function Footer() {
  const settings = await getSiteSettings();

  const socialLinks = [
    { icon: Instagram, label: "Instagram", url: settings.instagramUrl },
    { icon: Youtube, label: "YouTube", url: settings.youtubeUrl },
    { icon: Twitter, label: "Twitter / X", url: settings.twitterUrl },
  ].filter((s) => s.url);

  return (
    <footer
      className="relative"
      style={{
        backgroundColor: "#050505",
        borderTop: "1px solid rgba(212,175,55,0.2)",
      }}
    >
      {/* Gold top accent line */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, #D4AF37 30%, #F0D060 50%, #D4AF37 70%, transparent 100%)",
          opacity: 0.6,
        }}
      />

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(212,175,55,0.12)",
                  border: "1px solid rgba(212,175,55,0.4)",
                }}
              >
                <Sparkles className="h-4 w-4" style={{ color: "#D4AF37" }} />
              </div>
              <span
                className="font-serif font-bold text-2xl"
                style={{ color: "#F5F5F5" }}
              >
                {APP_NAME}
              </span>
            </Link>

            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: "#9A9A9A" }}
            >
              {settings.newsletterSubtitle ||
                "Os melhores produtos importados com curadoria rigorosa e autenticidade garantida."}
            </p>

            {/* Newsletter */}
            <div className="space-y-3">
              <p className="label-luxury text-xs" style={{ color: "#D4AF37" }}>
                {settings.newsletterTitle}
              </p>
              <NewsletterForm />
            </div>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map(({ icon: Icon, label, url }) => (
                  <a
                    key={label}
                    href={url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-[0_0_12px_rgba(212,175,55,0.3)]"
                    style={{
                      backgroundColor: "rgba(212,175,55,0.08)",
                      border: "1px solid rgba(212,175,55,0.2)",
                      color: "#9A9A9A",
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Store links */}
          <div className="space-y-5">
            <h3 className="label-luxury font-semibold" style={{ color: "#D4AF37" }}>
              Loja
            </h3>
            <ul className="space-y-3">
              {storeLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors duration-200 hover:text-[#D4AF37]"
                    style={{ color: "#9A9A9A" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div className="space-y-5">
            <h3 className="label-luxury font-semibold" style={{ color: "#D4AF37" }}>
              Conta
            </h3>
            <ul className="space-y-3">
              {accountLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors duration-200 hover:text-[#D4AF37]"
                    style={{ color: "#9A9A9A" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div
          className="mt-16 mb-6 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(212,175,55,0.2), transparent)",
          }}
        />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "#9A9A9A" }}>
            © {new Date().getFullYear()} {APP_NAME} — Importados de Luxo. Todos os direitos reservados.
          </p>
          <p className="text-xs" style={{ color: "rgba(200,187,168,0.35)" }}>
            LGPD · Seus dados protegidos
          </p>
        </div>
      </div>
    </footer>
  );
}
