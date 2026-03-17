import Link from "next/link";
import { formatPrice, parseImages } from "@/lib/utils";
import { ProductImage } from "@/components/ui/product-image";
import type { ProductWithCategory } from "@/types";

interface ProductCardProps {
  product: ProductWithCategory;
}

export function ProductCard({ product }: ProductCardProps) {
  const images = parseImages(product.images as unknown as string);
  const mainImage = images[0] ?? "/placeholder.svg";
  const inStock = product.stock > 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block min-w-0"
      style={{
        borderRight: "1px solid rgba(0,0,0,0.06)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        borderLeft: "1px solid rgba(0,0,0,0.06)",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        textDecoration: "none",
      }}
    >
      {/* Image */}
      <div
        className="relative h-48 sm:h-56 overflow-hidden"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <ProductImage
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain transition-transform duration-700 group-hover:scale-[1.03]"
        />

        <span style={{
          position: "absolute",
          top: "8px",
          left: "8px",
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

        {!inStock && (
          <div className="absolute bottom-3 left-3">
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                backgroundColor: "rgba(0,0,0,0.7)",
                color: "#FAFAFA",
                padding: "3px 8px",
              }}
            >
              Indisponível
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div
        style={{
          padding: "0.875rem 1rem",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          backgroundColor: "#FAFAFA",
        }}
      >
        <p
          className="transition-colors duration-200 group-hover:text-[#0A0A0A]"
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
