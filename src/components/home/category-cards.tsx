import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Layers } from "lucide-react";
import { getCategories } from "@/actions/products";

export async function CategoryCards() {
  const categories = await getCategories();
  const display = categories.slice(0, 3);

  if (display.length === 0) return null;

  return (
    <section
      className="py-12 px-4"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <div className="container mx-auto max-w-7xl">
        <p
          className="label-luxury text-center mb-6"
          style={{ color: "#C9C9C9", letterSpacing: "0.2em", fontSize: "0.65rem" }}
        >
          Curated for You
        </p>

        {/* Mobile: horizontal scroll; Desktop: 3 columns */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 scrollbar-hide">
          {display.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative flex-shrink-0 w-64 md:w-auto snap-start overflow-hidden rounded-xl"
              style={{ aspectRatio: "1 / 1" }}
            >
              {/* Background image or gradient */}
              {(category as { imageUrl?: string | null }).imageUrl ? (
                <Image
                  src={(category as { imageUrl: string }).imageUrl}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 256px, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, #111111 0%, #0A0A0A 50%, #141414 100%)",
                  }}
                >
                  <Layers
                    className="h-12 w-12 opacity-20"
                    style={{ color: "#C9C9C9" }}
                  />
                </div>
              )}

              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.2) 50%, transparent 100%)",
                }}
              />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3
                  className="font-serif text-lg font-semibold mb-1"
                  style={{ color: "#F5F5F5" }}
                >
                  {category.name}
                </h3>
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium transition-colors duration-200 group-hover:text-[#C9C9C9]"
                  style={{ color: "rgba(200,187,168,0.8)" }}
                >
                  Explore <ArrowRight className="h-3 w-3" />
                </span>
              </div>

              {/* Hover border */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ border: "1px solid rgba(201,201,201,0.4)" }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
