import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Watch, ShoppingBag, Footprints, Glasses, Gem, Sparkles } from "lucide-react";
import { getCategories } from "@/actions/products";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  relogios: <Watch className="h-10 w-10 opacity-30" style={{ color: "#C9A947" }} />,
  bolsas: <ShoppingBag className="h-10 w-10 opacity-30" style={{ color: "#C9A947" }} />,
  sapatos: <Footprints className="h-10 w-10 opacity-30" style={{ color: "#C9A947" }} />,
  oculos: <Glasses className="h-10 w-10 opacity-30" style={{ color: "#C9A947" }} />,
  perfumes: <Sparkles className="h-10 w-10 opacity-30" style={{ color: "#C9A947" }} />,
  acessorios: <Gem className="h-10 w-10 opacity-30" style={{ color: "#C9A947" }} />,
};

export async function CategoryCards() {
  const categories = await getCategories();
  const display = categories.slice(0, 6);

  if (display.length === 0) return null;

  return (
    <section
      className="py-12 px-4"
      style={{ backgroundColor: "#F5F0E6" }}
    >
      <div className="container mx-auto max-w-7xl">
        <p
          className="text-center mb-2"
          style={{
            fontSize: "9px",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "#8A8A8A",
            fontFamily: "var(--font-geist-mono), monospace",
          }}
        >
          SHOP BY CATEGORY
        </p>
        <h2
          className="text-center mb-8"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.75rem",
            fontWeight: 300,
            fontStyle: "italic",
            color: "#0A0A0A",
            margin: "0 0 2rem",
          }}
        >
          Coleções
        </h2>

        {/* Mobile: horizontal scroll; Desktop: up to 5 columns */}
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-6 md:overflow-visible md:pb-0 scrollbar-hide">
          {display.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative flex-shrink-0 w-48 md:w-auto snap-start overflow-hidden"
              style={{ aspectRatio: "3 / 4", textDecoration: "none" }}
            >
              {/* Background image or neutral gradient */}
              {(category as { imageUrl?: string | null }).imageUrl ? (
                <Image
                  src={(category as { imageUrl: string }).imageUrl}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 192px, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #F0EAE0 0%, #E8DED2 50%, #DDD3C6 100%)",
                  }}
                >
                  {CATEGORY_ICONS[category.slug] ?? (
                    <Gem className="h-10 w-10 opacity-30" style={{ color: "#C9A947" }} />
                  )}
                </div>
              )}

              {/* Subtle dark overlay at bottom */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.05) 55%, transparent 100%)",
                }}
              />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3
                  style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "1rem",
                    fontWeight: 400,
                    fontStyle: "italic",
                    color: "#F5F0E6",
                    margin: "0 0 4px",
                  }}
                >
                  {category.name}
                </h3>
                <span
                  className="inline-flex items-center gap-1 transition-colors duration-200 group-hover:text-white"
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(245,240,230,0.6)",
                    fontFamily: "var(--font-geist-mono), monospace",
                  }}
                >
                  Ver <ArrowRight className="h-2.5 w-2.5" />
                </span>
              </div>

              {/* Hover border */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ border: "1px solid rgba(201,169,71,0.4)" }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
