"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { Category } from "@prisma/client";

interface ProductFiltersProps {
  categories: (Category & { _count: { products: number } })[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category");

  const setFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <aside
      className="rounded-2xl p-5 h-fit sticky top-24"
      style={{
        backgroundColor: "#111111",
        border: "1px solid rgba(212,175,55,0.15)",
      }}
    >
      <h3
        className="label-luxury mb-4 pb-3"
        style={{
          color: "#D4AF37",
          borderBottom: "1px solid rgba(212,175,55,0.15)",
        }}
      >
        Categorias
      </h3>
      <ul className="space-y-1">
        <li>
          <button
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: !currentCategory
                ? "rgba(212,175,55,0.12)"
                : "transparent",
              color: !currentCategory ? "#D4AF37" : "#9A9A9A",
              border: !currentCategory
                ? "1px solid rgba(212,175,55,0.3)"
                : "1px solid transparent",
            }}
            onClick={() => setFilter("category", null)}
          >
            <span>Todos</span>
          </button>
        </li>
        {categories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          return (
            <li key={cat.id}>
              <button
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: isActive
                    ? "rgba(212,175,55,0.12)"
                    : "transparent",
                  color: isActive ? "#D4AF37" : "#9A9A9A",
                  border: isActive
                    ? "1px solid rgba(212,175,55,0.3)"
                    : "1px solid transparent",
                }}
                onClick={() => setFilter("category", cat.slug)}
              >
                <span>{cat.name}</span>
                <span
                  className="text-xs ml-auto"
                  style={{
                    color: isActive ? "#D4AF37" : "rgba(200,187,168,0.5)",
                  }}
                >
                  {cat._count.products}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
