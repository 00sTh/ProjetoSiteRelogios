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
      className="rounded-2xl p-5 h-fit sticky top-20"
      style={{
        backgroundColor: "#F2F2F2",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <h3
        className="label-luxury mb-4 pb-3"
        style={{
          color: "#6A6A6A",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        Categories
      </h3>
      <ul className="space-y-1">
        <li>
          <button
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: !currentCategory
                ? "rgba(0,0,0,0.08)"
                : "transparent",
              color: !currentCategory ? "#0A0A0A" : "#6A6A6A",
              border: !currentCategory
                ? "1px solid rgba(0,0,0,0.2)"
                : "1px solid transparent",
            }}
            onClick={() => setFilter("category", null)}
          >
            <span>All</span>
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
                    ? "rgba(0,0,0,0.08)"
                    : "transparent",
                  color: isActive ? "#0A0A0A" : "#6A6A6A",
                  border: isActive
                    ? "1px solid rgba(0,0,0,0.2)"
                    : "1px solid transparent",
                }}
                onClick={() => setFilter("category", cat.slug)}
              >
                <span>{cat.name}</span>
                <span
                  className="text-xs ml-auto"
                  style={{
                    color: isActive ? "#0A0A0A" : "#9A9A9A",
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
