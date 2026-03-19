import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductCard } from "@/components/products/product-card";
import { CategoryBrandTabs } from "@/components/products/category-brand-tabs";
import { getProducts, getCategories, getBrandsInCategory } from "@/actions/products";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const revalidate = 1800;

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    page?: string;
    search?: string;
    featured?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const categories = await getCategories();
  const catName = params.category
    ? (categories.find((c) => c.slug === params.category)?.name ?? "Produtos")
    : "Todos os Produtos";
  const title = params.brand ? `${params.brand} — ${catName}` : catName;
  return {
    title,
    description: "Explore nossa coleção completa de produtos importados de luxo.",
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const categorySlug = params.category?.trim().slice(0, 100) || undefined;
  const brand = params.brand?.trim().slice(0, 100) || undefined;

  const [{ products, total, pages }, categories, brandsInCategory] = await Promise.all([
    getProducts({
      categorySlug,
      brand,
      page,
      search: params.search,
      featured: params.featured === "true" ? true : undefined,
    }),
    getCategories(),
    categorySlug ? getBrandsInCategory(categorySlug) : Promise.resolve([]),
  ]);

  const activeCategory = categories.find((c) => c.slug === categorySlug) ?? null;
  const pageTitle = brand
    ? `${brand} — ${activeCategory?.name ?? "Produtos"}`
    : activeCategory?.name ?? "Todos os Produtos";

  return (
    <div style={{ backgroundColor: "#FAFAFA", minHeight: "100vh" }}>
      {/* Page hero */}
      <div
        className="relative py-16 px-4 text-center overflow-hidden"
        style={{
          backgroundColor: "#F2F2F2",
          borderBottom: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(0,0,0,0.02) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10">
          <p className="label-luxury mb-3" style={{ color: "#6A6A6A" }}>
            S Luxury Collection
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold" style={{ color: "#0A0A0A" }}>
            {pageTitle}
          </h1>
          <p className="mt-3 text-sm" style={{ color: "#6A6A6A" }}>
            {total} produto{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Abas de categoria + marca */}
        <Suspense fallback={null}>
          <CategoryBrandTabs
            categories={categories}
            currentCategory={categorySlug ?? null}
            currentBrand={brand ?? null}
            brandsInCategory={brandsInCategory}
          />
        </Suspense>

        {/* Product grid */}
        {products.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center rounded-2xl"
            style={{
              backgroundColor: "#EAEAEA",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <p className="text-lg font-serif mb-3" style={{ color: "#0A0A0A" }}>
              Nenhum Produto Encontrado
            </p>
            <p className="text-sm mb-6" style={{ color: "#6A6A6A" }}>
              Tente ajustar seus filtros de busca.
            </p>
            <Link
              href="/products"
              className="px-6 py-2.5 rounded-full text-xs font-semibold tracking-widest uppercase transition-all hover:bg-[#E8E8E8] hover:shadow-[0_0_15px_rgba(201,201,201,0.4)]"
              style={{ backgroundColor: "#C9C9C9", color: "#0A0A0A" }}
            >
              Limpar Filtros
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 border-t border-l border-[rgba(0,0,0,0.06)]">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {pages > 1 && (
              <Pagination pages={pages} page={page} params={params} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function pageUrl(
  params: Record<string, string | undefined>,
  p: number
): string {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries({ ...params, page: String(p) }).filter(
        ([, v]) => v !== undefined
      ) as [string, string][]
    )
  ).toString();
  return `/products?${qs}`;
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];
  const left = Math.max(2, current - 2);
  const right = Math.min(total - 1, current + 2);

  if (left > 2) pages.push("…");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("…");

  pages.push(total);
  return pages;
}

function Pagination({
  pages,
  page,
  params,
}: {
  pages: number;
  page: number;
  params: Record<string, string | undefined>;
}) {
  const items = getPageNumbers(page, pages);

  const btnBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "2.25rem",
    height: "2.25rem",
    padding: "0 0.5rem",
    fontSize: "12px",
    letterSpacing: "0.04em",
    borderRadius: "2px",
    transition: "all 0.2s",
    textDecoration: "none",
    border: "1px solid rgba(0,0,0,0.1)",
  };

  return (
    <div className="mt-12 flex flex-wrap justify-center items-center gap-1">
      {page > 1 ? (
        <Link href={pageUrl(params, page - 1)} style={{ ...btnBase, color: "#6A6A6A" }} aria-label="Página anterior">
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span style={{ ...btnBase, color: "rgba(0,0,0,0.2)", cursor: "default" }}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </span>
      )}

      {items.map((item, idx) =>
        item === "…" ? (
          <span key={`ellipsis-${idx}`} style={{ ...btnBase, border: "none", color: "#ABABAB", cursor: "default" }}>
            …
          </span>
        ) : (
          <Link
            key={item}
            href={pageUrl(params, item)}
            style={{
              ...btnBase,
              backgroundColor: item === page ? "#0A0A0A" : "transparent",
              color: item === page ? "#F5F0E6" : "#6A6A6A",
              border: item === page ? "1px solid #0A0A0A" : "1px solid rgba(0,0,0,0.1)",
            }}
          >
            {item}
          </Link>
        )
      )}

      {page < pages ? (
        <Link href={pageUrl(params, page + 1)} style={{ ...btnBase, color: "#6A6A6A" }} aria-label="Próxima página">
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span style={{ ...btnBase, border: "none", color: "rgba(0,0,0,0.2)", cursor: "default" }}>
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  );
}
