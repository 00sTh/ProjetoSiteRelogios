import Image from "next/image";
import Link from "next/link";

const DEFAULT_HERO =
  "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1920&q=80&fit=crop";

interface HeroSectionProps {
  imageUrl?: string | null;
}

export function HeroSection({ imageUrl }: HeroSectionProps) {
  const bg = imageUrl || DEFAULT_HERO;

  return (
    <section className="relative h-screen overflow-hidden">
      <Image
        src={bg}
        alt=""
        fill
        priority
        className="object-cover"
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.72) 100%)" }}
      />

      {/* Centered content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-8">
          <span
            style={{
              display: "block",
              fontSize: "9px",
              letterSpacing: "0.55em",
              textTransform: "uppercase",
              color: "rgba(201,169,71,0.85)",
              fontFamily: "var(--font-geist-mono), monospace",
              marginBottom: "2rem",
            }}
          >
            Relógios · Bolsas · Sapatos · Óculos
          </span>

          <h1
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(5rem, 14vw, 12rem)",
              fontWeight: 300,
              fontStyle: "italic",
              lineHeight: 1,
              color: "#F5F0E6",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            Luxury Collection
          </h1>

          <hr
            style={{
              width: "3rem",
              border: "none",
              borderTop: "1px solid rgba(201,169,71,0.4)",
              margin: "2rem auto",
            }}
          />

          <div className="flex items-center justify-center gap-8">
            <Link
              href="/products"
              className="transition-colors duration-300 hover:text-white"
              style={{
                fontSize: "9px",
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                color: "rgba(245,240,230,0.9)",
                textDecoration: "none",
                borderBottom: "1px solid rgba(201,169,71,0.5)",
                paddingBottom: "2px",
              }}
            >
              Explore Collection
            </Link>
            <Link
              href="/products?category=relogios"
              className="transition-colors duration-300 hover:text-white"
              style={{
                fontSize: "9px",
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                color: "rgba(245,240,230,0.5)",
                textDecoration: "none",
              }}
            >
              Ver por Marca
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
