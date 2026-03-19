"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface Props {
  categories: Category[];
  currentCategory: string | null;
  currentBrand: string | null;
  brandsInCategory: string[];
}

export function CategoryBrandTabs({
  categories,
  currentCategory,
  currentBrand,
  brandsInCategory,
}: Props) {
  const router = useRouter();

  function selectCategory(slug: string | null) {
    if (!slug) {
      router.push("/products");
    } else {
      router.push(`/products?category=${slug}`);
    }
  }

  function selectBrand(brand: string | null) {
    const base = currentCategory ? `/products?category=${currentCategory}` : "/products";
    if (!brand) {
      router.push(base);
    } else {
      router.push(`${base}&brand=${encodeURIComponent(brand)}`);
    }
  }

  const brandSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return (
    <div
      className="mb-8 sticky z-10"
      style={{ top: "64px", backgroundColor: "#FAFAFA", paddingTop: "12px" }}
    >
      {/* Category tabs */}
      <div
        className="flex flex-wrap gap-1 pb-4 mb-4"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
      >
        <button
          onClick={() => selectCategory(null)}
          className="px-4 py-2 text-sm font-medium transition-all duration-200 relative"
          style={{ color: currentCategory === null ? "#0A0A0A" : "#6A6A6A", background: "none", border: "none" }}
        >
          Todos
          {currentCategory === null && (
            <span
              className="absolute bottom-0 left-0 right-0"
              style={{ height: "2px", backgroundColor: "#C9A947" }}
            />
          )}
        </button>
        {categories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.slug)}
              className="px-4 py-2 text-sm font-medium transition-all duration-200 relative"
              style={{ color: isActive ? "#0A0A0A" : "#6A6A6A", background: "none", border: "none" }}
            >
              {cat.name}
              <span
                className="ml-1.5 text-xs"
                style={{ color: isActive ? "#ABABAB" : "#CACACA" }}
              >
                {cat._count.products}
              </span>
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0"
                  style={{ height: "2px", backgroundColor: "#C9A947" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Brand pills */}
      {brandsInCategory.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => selectBrand(null)}
            className="px-3 py-1 text-xs font-medium rounded-full transition-all duration-200"
            style={
              currentBrand === null
                ? { backgroundColor: "#0A0A0A", color: "#F5F0E6", border: "1px solid #0A0A0A" }
                : { backgroundColor: "transparent", color: "#6A6A6A", border: "1px solid rgba(0,0,0,0.15)" }
            }
          >
            Todas as marcas
          </button>

          {brandsInCategory.map((brand) => {
            const isActive = currentBrand === brand;
            return (
              <button
                key={brand}
                onClick={() => selectBrand(brand)}
                className="px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 flex items-center gap-1"
                style={
                  isActive
                    ? { backgroundColor: "#0A0A0A", color: "#F5F0E6", border: "1px solid #0A0A0A" }
                    : { backgroundColor: "transparent", color: "#6A6A6A", border: "1px solid rgba(0,0,0,0.15)" }
                }
              >
                {brand}
                {isActive && (
                  <span
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); selectBrand(null); }}
                    style={{ marginLeft: "2px", opacity: 0.7, cursor: "pointer" }}
                  >
                    ×
                  </span>
                )}
              </button>
            );
          })}

          {/* Link to brand page when a brand is active */}
          {currentBrand && (
            <Link
              href={`/products/brand/${brandSlug(currentBrand)}`}
              className="text-xs transition-colors duration-200"
              style={{
                color: "#ABABAB",
                textDecoration: "none",
                borderBottom: "1px solid rgba(0,0,0,0.15)",
                paddingBottom: "1px",
                marginLeft: "4px",
              }}
            >
              Ver página da marca →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
