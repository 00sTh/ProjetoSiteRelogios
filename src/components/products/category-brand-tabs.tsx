"use client";

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

  return (
    <div className="mb-8">
      {/* Abas de categoria */}
      <div
        className="flex flex-wrap gap-1 pb-4 mb-4"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
      >
        <button
          onClick={() => selectCategory(null)}
          className="px-4 py-2 text-sm font-medium transition-all duration-200"
          style={
            currentCategory === null
              ? {
                  backgroundColor: "#0A0A0A",
                  color: "#F5F0E6",
                  borderRadius: "2px",
                  border: "1px solid #0A0A0A",
                }
              : {
                  backgroundColor: "transparent",
                  color: "#6A6A6A",
                  borderRadius: "2px",
                  border: "1px solid rgba(0,0,0,0.1)",
                }
          }
        >
          Todos
        </button>
        {categories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.slug)}
              className="px-4 py-2 text-sm font-medium transition-all duration-200"
              style={
                isActive
                  ? {
                      backgroundColor: "#0A0A0A",
                      color: "#F5F0E6",
                      borderRadius: "2px",
                      border: "1px solid #0A0A0A",
                    }
                  : {
                      backgroundColor: "transparent",
                      color: "#6A6A6A",
                      borderRadius: "2px",
                      border: "1px solid rgba(0,0,0,0.1)",
                    }
              }
            >
              {cat.name}
              <span
                className="ml-1.5 text-xs"
                style={{ color: isActive ? "rgba(245,240,230,0.6)" : "#ABABAB" }}
              >
                {cat._count.products}
              </span>
            </button>
          );
        })}
      </div>

      {/* Pills de marca */}
      {brandsInCategory.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => selectBrand(null)}
            className="px-3 py-1 text-xs font-medium rounded-full transition-all duration-200"
            style={
              currentBrand === null
                ? {
                    backgroundColor: "#0A0A0A",
                    color: "#F5F0E6",
                    border: "1px solid #0A0A0A",
                  }
                : {
                    backgroundColor: "transparent",
                    color: "#6A6A6A",
                    border: "1px solid rgba(0,0,0,0.15)",
                  }
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
                className="px-3 py-1 text-xs font-medium rounded-full transition-all duration-200"
                style={
                  isActive
                    ? {
                        backgroundColor: "#0A0A0A",
                        color: "#F5F0E6",
                        border: "1px solid #0A0A0A",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "#6A6A6A",
                        border: "1px solid rgba(0,0,0,0.15)",
                      }
                }
              >
                {brand}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
