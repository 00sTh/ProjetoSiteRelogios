import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { formatPrice, parseImages } from "@/lib/utils";
import type { ProductWithCategory } from "@/types";

interface FeaturedGridProps {
  products: ProductWithCategory[];
}

export function FeaturedGrid({ products }: FeaturedGridProps) {
  if (products.length === 0) return null;

  // Split: first 2 are "featured" (larger), rest are "standard"
  const [first, second, ...rest] = products;

  return (
    <section className="overflow-hidden" style={{ backgroundColor: "#FAFAFA", paddingBottom: "8rem" }}>

      {/* Section header */}
      <div style={{ padding: "4rem 0 2rem", textAlign: "center" }}>
        <p style={{ fontSize: "9px", letterSpacing: "0.4em", textTransform: "uppercase", color: "#ABABAB", margin: "0 0 0.75rem", fontFamily: "var(--font-geist-mono), monospace" }}>
          CURATED SELECTION
        </p>
        <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 300, fontStyle: "italic", color: "#0A0A0A", margin: 0 }}>
          Relógios em Destaque
        </h2>
      </div>

      {/* Top row — 2 large items */}
      {(first || second) && (
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ borderLeft: "1px solid rgba(0,0,0,0.06)", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          {[first, second].filter(Boolean).map((product) => (
            <FeaturedItem key={product.id} product={product} large />
          ))}
        </div>
      )}

      {/* Divider */}
      {rest.length > 0 && (
        <div style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.06)" }} />
      )}

      {/* Bottom rows — 3-column smaller grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ borderLeft: "1px solid rgba(0,0,0,0.06)", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          {rest.map((product) => (
            <FeaturedItem key={product.id} product={product} large={false} />
          ))}
        </div>
      )}

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
          View all products
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
        className={`relative overflow-hidden ${large ? "h-64 md:h-80 lg:h-96" : "h-48 md:h-52 lg:h-60"}`}
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <ProductImage
          src={mainImage}
          alt={product.name}
          fill
          sizes={large ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
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
          Superclone
        </span>
      </div>

      {/* Info — below image, not overlaid */}
      <div
        style={{
          padding: large ? "1.25rem 1.5rem" : "0.875rem 1rem",
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontSize: "12px",
            color: "#0A0A0A",
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
