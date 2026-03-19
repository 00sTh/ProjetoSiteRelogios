import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { getBrandBySlug, getProducts } from "@/actions/products";
import type { ProductWithCategory } from "@/types";

export const revalidate = 1800;

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: "Marca não encontrada" };
  return {
    title: `${brand} — Coleção Completa`,
    description: `Explore todos os produtos ${brand} disponíveis na nossa coleção de luxo.`,
  };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Number(sp.page ?? "1");

  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const { products, total, pages } = await getProducts({ brand, page });

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
        <div className="relative z-10">
          <nav className="flex items-center justify-center gap-2 mb-6 text-xs" style={{ color: "#ABABAB" }}>
            <Link href="/" className="hover:text-[#0A0A0A] transition-colors">Início</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[#0A0A0A] transition-colors">Produtos</Link>
            <span>/</span>
            <span style={{ color: "#6A6A6A" }}>{brand}</span>
          </nav>
          <p className="label-luxury mb-3" style={{ color: "#6A6A6A" }}>
            Coleção Exclusiva
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold" style={{ color: "#0A0A0A" }}>
            {brand}
          </h1>
          <p className="mt-4 text-sm" style={{ color: "#ABABAB" }}>
            {total} produto{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {products.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center rounded-2xl"
            style={{ backgroundColor: "#EAEAEA", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <p className="text-lg font-serif mb-3" style={{ color: "#0A0A0A" }}>
              Nenhum produto encontrado
            </p>
            <Link
              href="/products"
              className="px-6 py-2.5 rounded-full text-xs font-semibold tracking-widest uppercase transition-all"
              style={{ backgroundColor: "#C9C9C9", color: "#0A0A0A" }}
            >
              Ver todos os produtos
            </Link>
          </div>
        ) : (
          <>
            <Suspense fallback={null}>
              <div className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 border-t border-l border-[rgba(0,0,0,0.06)]">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as unknown as ProductWithCategory} />
                ))}
              </div>
            </Suspense>

            {pages > 1 && (
              <BrandPagination pages={pages} page={page} slug={slug} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BrandPagination({ pages, page, slug }: { pages: number; page: number; slug: string }) {
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

  const items: (number | "…")[] = pages <= 7
    ? Array.from({ length: pages }, (_, i) => i + 1)
    : (() => {
        const arr: (number | "…")[] = [1];
        const left = Math.max(2, page - 2);
        const right = Math.min(pages - 1, page + 2);
        if (left > 2) arr.push("…");
        for (let i = left; i <= right; i++) arr.push(i);
        if (right < pages - 1) arr.push("…");
        arr.push(pages);
        return arr;
      })();

  return (
    <div className="mt-12 flex flex-wrap justify-center items-center gap-1">
      {page > 1 ? (
        <Link href={`/products/brand/${slug}?page=${page - 1}`} style={{ ...btnBase, color: "#6A6A6A" }} aria-label="Página anterior">
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span style={{ ...btnBase, color: "rgba(0,0,0,0.2)", cursor: "default" }}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </span>
      )}
      {items.map((item, idx) =>
        item === "…" ? (
          <span key={`e-${idx}`} style={{ ...btnBase, border: "none", color: "#ABABAB", cursor: "default" }}>…</span>
        ) : (
          <Link
            key={item}
            href={`/products/brand/${slug}?page=${item}`}
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
        <Link href={`/products/brand/${slug}?page=${page + 1}`} style={{ ...btnBase, color: "#6A6A6A" }} aria-label="Próxima página">
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
