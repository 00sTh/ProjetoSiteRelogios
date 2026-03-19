import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { formatPrice, parseImages } from "@/lib/utils";
import type { ProductWithCategory } from "@/types";

interface FeaturedGridProps {
  products: ProductWithCategory[];
}

export function FeaturedGrid({ products }: FeaturedGridProps) {
  if (products.length === 0) return null;

  const [hero, ...rest] = products;
  const grid = rest.slice(0, 4);

  return (
    <section className="overflow-hidden" style={{ backgroundColor: "#FAFAFA", paddingBottom: "8rem" }}>

      {/* Section header */}
      <div style={{ padding: "4rem 0 2rem", textAlign: "center" }}>
        <p style={{
          fontSize: "9px",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "#ABABAB",
          margin: "0 0 0.75rem",
          fontFamily: "var(--font-geist-mono), monospace",
        }}>
          CURATED SELECTION
        </p>
        <h2 style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2rem",
          fontWeight: 300,
          fontStyle: "italic",
          color: "#0A0A0A",
          margin: 0,
        }}>
          Seleção em Destaque
        </h2>
      </div>

      {/* Editorial layout: 1 hero (left) + 2x2 grid (right) */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        style={{ borderLeft: "1px solid rgba(0,0,0,0.06)", borderTop: "1px solid rgba(0,0,0,0.06)" }}
      >
        {/* Hero — spans 1 column on md, 2 on lg */}
        {hero && (
          <div className="lg:col-span-2">
            <FeaturedItem product={hero} large />
          </div>
        )}

        {/* Right grid — 2x2 */}
        <div className="grid grid-cols-2 grid-rows-2">
          {grid.map((product) => (
            <FeaturedItem key={product.id} product={product} large={false} />
          ))}
        </div>
      </div>

      {/* View all CTA */}
      <div className="text-center pt-16">
        <Link
          href="/products"
          className="inline-block transition-colors duration-300 hover:text-[#0A0A0A]"
          style={{
            fontSize: "11px",
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            color: "#ABABAB",
            textDecoration: "none",
            borderBottom: "1px solid rgba(0,0,0,0.15)",
            paddingBottom: "2px",
          }}
        >
          Ver todos os produtos
        </Link>
      </div>
    </section>
  );
}

function FeaturedItem({
  product,
  large,
}: {
  product: NonNullable<FeaturedGridProps["products"][number]>;
  large: boolean;
}) {
  const images = parseImages(product.images as unknown as string);
  const mainImage = images[0] ?? "/placeholder.svg";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block min-w-0"
      style={{
        borderRight: "1px solid rgba(0,0,0,0.06)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        textDecoration: "none",
      }}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden ${large ? "h-80 md:h-[520px]" : "h-48 md:h-64"}`}
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <ProductImage
          src={mainImage}
          alt={product.name}
          fill
          sizes={large ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 50vw, 17vw"}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />

        {/* Hover gradient overlay with brand/model */}
        <div
          className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          style={{ background: "linear-gradient(to top, rgba(10,10,10,0.7) 0%, transparent 60%)", padding: large ? "1.5rem" : "0.875rem" }}
        >
          {product.brand && (
            <p style={{
              fontSize: "8px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(245,240,230,0.7)",
              margin: "0 0 4px",
              fontFamily: "var(--font-geist-mono), monospace",
            }}>
              {product.brand}
            </p>
          )}
          {product.model_name && (
            <p style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: large ? "1.25rem" : "0.9rem",
              fontWeight: 300,
              fontStyle: "italic",
              color: "#F5F0E6",
              margin: 0,
            }}>
              {product.model_name}
            </p>
          )}
        </div>

        {/* Brand badge */}
        <span style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          fontSize: "8px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          backgroundColor: "rgba(10,10,10,0.75)",
          color: "rgba(245,240,230,0.9)",
          padding: "3px 8px",
          pointerEvents: "none",
          fontFamily: "var(--font-geist-mono), monospace",
        }}>
          {product.brand ?? "Superclone"}
        </span>
      </div>

      {/* Info */}
      <div
        style={{
          padding: large ? "1.25rem 1.5rem" : "0.875rem 1rem",
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {product.model_name && (
          <p style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: large ? "1rem" : "0.8rem",
            fontStyle: "italic",
            color: "#0A0A0A",
            margin: "0 0 2px",
          }}>
            {product.model_name}
          </p>
        )}
        <p
          style={{
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontSize: "12px",
            color: "#6A6A6A",
            margin: 0,
            letterSpacing: "0.02em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.name}
        </p>
        <p
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "11px",
            color: "#8A8A8A",
            margin: "3px 0 0",
            letterSpacing: "0.04em",
          }}
        >
          {formatPrice(Number(product.price))}
        </p>
      </div>
    </Link>
  );
}
