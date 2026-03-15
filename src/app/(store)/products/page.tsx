import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductCard } from "@/components/products/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import { getProducts, getCategories } from "@/actions/products";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Products",
  description: "Explore our complete collection of luxury timepieces and eyewear.",
};

export const revalidate = 1800;

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
    search?: string;
    featured?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");

  const [{ products, total, pages }, categories] = await Promise.all([
    getProducts({
      categorySlug: params.category,
      page,
      search: params.search,
      featured: params.featured === "true" ? true : undefined,
    }),
    getCategories(),
  ]);

  const pageTitle = params.category
    ? categories.find((c) => c.slug === params.category)?.name ?? "Products"
    : params.featured === "true"
    ? "Featured"
    : "All Products";

  return (
    <div style={{ backgroundColor: "#0A0A0A", minHeight: "100vh" }}>
      {/* Page hero */}
      <div
        className="relative py-16 px-4 text-center overflow-hidden"
        style={{
          backgroundColor: "#111111",
          borderBottom: "1px solid rgba(201,201,201,0.2)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(201,201,201,0.04) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10">
          <p
            className="label-luxury mb-3"
            style={{ color: "#C9C9C9" }}
          >
            LuxImport Collection
          </p>
          <h1
            className="font-serif text-4xl md:text-5xl font-bold"
            style={{ color: "#F5F5F5" }}
          >
            {pageTitle}
          </h1>
          <p className="mt-3 text-sm" style={{ color: "#9A9A9A" }}>
            {total} product{total !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-10 max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          {/* Filters */}
          <Suspense
            fallback={
              <div
                className="animate-pulse rounded-2xl h-64"
                style={{
                  backgroundColor: "#111111",
                  border: "1px solid rgba(201,201,201,0.15)",
                }}
              />
            }
          >
            <ProductFilters categories={categories} />
          </Suspense>

          {/* Product grid */}
          <div>
            {products.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-20 text-center rounded-2xl"
                style={{
                  backgroundColor: "#111111",
                  border: "1px solid rgba(201,201,201,0.15)",
                }}
              >
                <p className="text-lg font-serif mb-3" style={{ color: "#F5F5F5" }}>
                  No Products Found
                </p>
                <p className="text-sm mb-6" style={{ color: "#9A9A9A" }}>
                  Try adjusting your search filters.
                </p>
                <Link
                  href="/products"
                  className="px-6 py-2.5 rounded-full text-xs font-semibold tracking-widest uppercase transition-all hover:bg-[#E8E8E8] hover:shadow-[0_0_15px_rgba(201,201,201,0.4)]"
                  style={{ backgroundColor: "#C9C9C9", color: "#0A0A0A" }}
                >
                  Clear Filters
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="mt-12 flex justify-center gap-2">
                    {Array.from({ length: pages }).map((_, i) => {
                      const p = i + 1;
                      const href = new URL(
                        `/products?${new URLSearchParams({
                          ...params,
                          page: String(p),
                        })}`,
                        "http://x"
                      ).search.slice(1);
                      const isActive = p === page;
                      return (
                        <Link
                          key={p}
                          href={`/products?${href}`}
                          className="w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200"
                          style={{
                            backgroundColor: isActive
                              ? "#C9C9C9"
                              : "rgba(201,201,201,0.08)",
                            color: isActive ? "#0A0A0A" : "#9A9A9A",
                            border: isActive
                              ? "1px solid #C9C9C9"
                              : "1px solid rgba(201,201,201,0.2)",
                          }}
                        >
                          {p}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
