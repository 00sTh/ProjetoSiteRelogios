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
        className="relative overflow-hidden"
        style={{ backgroundColor: "#FAFAFA", aspectRatio: "3/4" }}
      >
        <ProductImage
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain transition-transform duration-700 group-hover:scale-[1.03]"
        />

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundColor: "rgba(10,10,10,0.35)" }}
        >
          <span
            style={{
              fontSize: "9px",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#F5F0E6",
              fontFamily: "var(--font-geist-mono), monospace",
              borderBottom: "1px solid rgba(245,240,230,0.5)",
              paddingBottom: "2px",
            }}
          >
            Ver produto
          </span>
        </div>

        {/* Brand badge */}
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
          padding: "1rem",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          backgroundColor: "#FAFAFA",
        }}
      >
        <p style={{
          fontSize: "9px",
          letterSpacing: "0.25em",
          color: "#ABABAB",
          textTransform: "uppercase",
          margin: 0,
          fontFamily: "var(--font-geist-mono), monospace",
        }}>
          {product.brand ?? "Superclone"}
        </p>
        {product.model_name && (
          <p style={{
            fontSize: "13px",
            fontFamily: "var(--font-cormorant), Georgia, serif",
            color: "#0A0A0A",
            marginTop: "2px",
            fontStyle: "italic",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {product.model_name}
          </p>
        )}
        <p
          className="transition-colors duration-200 group-hover:text-[#0A0A0A]"
          style={{
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontSize: "11px",
            color: "#6A6A6A",
            marginTop: product.model_name ? "2px" : "4px",
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
            fontSize: "13px",
            color: "#0A0A0A",
            margin: "6px 0 0",
            letterSpacing: "0.04em",
            fontWeight: 600,
          }}
        >
          {formatPrice(Number(product.price))}
        </p>
      </div>
    </Link>
  );
}
