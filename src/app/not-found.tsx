import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #050505 0%, #0A0A0A 40%, #111111 70%, #0A0A0A 100%)",
      }}
    >
      {/* Gold radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,175,55,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 text-center max-w-lg">
        {/* Decorative line */}
        <div
          className="w-px h-16 mx-auto mb-8"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(212,175,55,0.4))",
          }}
        />

        {/* Gold 404 */}
        <p
          className="font-serif text-[8rem] font-bold leading-none mb-2"
          style={{
            background: "linear-gradient(135deg, #D4AF37 0%, #F0D060 50%, #A88B28 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </p>

        {/* Separator */}
        <div className="flex items-center gap-4 justify-center mb-6">
          <div
            className="h-px flex-1 max-w-16"
            style={{ background: "rgba(212,175,55,0.3)" }}
          />
          <Sparkles className="h-4 w-4" style={{ color: "rgba(212,175,55,0.5)" }} />
          <div
            className="h-px flex-1 max-w-16"
            style={{ background: "rgba(212,175,55,0.3)" }}
          />
        </div>

        <h1
          className="font-serif text-3xl font-bold mb-4"
          style={{ color: "#F5F5F5" }}
        >
          Página não encontrada
        </h1>
        <p
          className="text-base leading-relaxed mb-10"
          style={{ color: "#9A9A9A" }}
        >
          A página que você procura não existe ou foi movida. Que tal explorar
          nossa coleção de luxo?
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-200 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            style={{ backgroundColor: "#D4AF37", color: "#0A0A0A" }}
          >
            Início
          </Link>
          <Link
            href="/products"
            className="flex items-center gap-2 justify-center px-6 py-3 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-200"
            style={{
              border: "1px solid rgba(212,175,55,0.4)",
              color: "#D4AF37",
            }}
          >
            Ver Coleção <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Bottom decoration */}
        <div
          className="w-px h-16 mx-auto mt-8"
          style={{
            background: "linear-gradient(to top, transparent, rgba(212,175,55,0.4))",
          }}
        />
      </div>
    </div>
  );
}
