import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Suspense } from "react";
import { ProductFilters } from "@/components/admin/product-filters";
export const dynamic = "force-dynamic";

const TAKE = 20;

export default async function AdminProdutos({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const cat = sp.cat ?? "";
  const statusFilter = sp.status ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1"));

  const where = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(cat ? { categoryId: cat } : {}),
    ...(statusFilter === "ativo" ? { active: true } : statusFilter === "inativo" ? { active: false } : {}),
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { createdAt: "desc" }, take: TAKE, skip: (page - 1) * TAKE, include: { brand: true, category: true } }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const pages = Math.ceil(total / TAKE);
  const from = total === 0 ? 0 : (page - 1) * TAKE + 1;
  const to = Math.min(page * TAKE, total);

  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("cat", cat);
    if (statusFilter) params.set("status", statusFilter);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/produtos${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl font-light">
          Produtos <span className="text-sm font-sans opacity-40">({total})</span>
        </h1>
        <Link href="/admin/produtos/novo" className="px-4 py-2 text-[10px] tracking-widest uppercase text-white" style={{ backgroundColor: "#0D0B0B" }}>
          + Novo
        </Link>
      </div>

      <Suspense fallback={null}>
        <ProductFilters categories={categories} />
      </Suspense>

      <div className="border" style={{ borderColor: "rgba(13,11,11,0.1)", backgroundColor: "white" }}>
        {products.length === 0 && <p className="p-6 text-sm opacity-40">Nenhum produto encontrado.</p>}
        {products.map(p => (
          <div key={p.id} className="flex items-center gap-4 px-4 py-3 border-b last:border-0" style={{ borderColor: "rgba(13,11,11,0.06)" }}>
            {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover flex-shrink-0" />}
            <p className="flex-1 text-sm truncate">{p.name}</p>
            <p className="label-slc hidden sm:block opacity-60 flex-shrink-0">{p.brand.name}</p>
            <p className="label-slc hidden md:block opacity-40 flex-shrink-0">{p.category.name}</p>
            <p className="font-mono text-sm flex-shrink-0">{formatPrice(p.price)}</p>
            <p className="text-xs px-2 py-0.5 flex-shrink-0" style={{ backgroundColor: p.active ? "rgba(0,100,0,0.1)" : "rgba(107,26,42,0.1)", color: p.active ? "green" : "#6B1A2A" }}>
              {p.active ? "Ativo" : "Inativo"}
            </p>
            <Link href={`/admin/produtos/${p.id}`} className="label-slc opacity-50 hover:opacity-100 flex-shrink-0">Editar</Link>
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="label-slc opacity-40 text-[10px]">{from}–{to} de {total} produtos</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={pageUrl(page - 1)} className="px-3 py-1.5 text-[10px] tracking-widest uppercase border" style={{ borderColor: "rgba(13,11,11,0.2)" }}>
                ← Anterior
              </Link>
            )}
            {page < pages && (
              <Link href={pageUrl(page + 1)} className="px-3 py-1.5 text-[10px] tracking-widest uppercase border" style={{ borderColor: "rgba(13,11,11,0.2)" }}>
                Próxima →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
