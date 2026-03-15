import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice, parseImages } from "@/lib/utils";
import { Plus, Pencil, EyeOff, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductRowActions } from "@/components/admin/product-row-actions";

export const metadata: Metadata = { title: "Admin — Produtos" };

const TAKE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: TAKE,
      skip: (page - 1) * TAKE,
    }),
    prisma.product.count(),
  ]);

  const pages = Math.ceil(total / TAKE);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold" style={{ color: "#F5F5F5" }}>
            Produtos
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(200,187,168,0.6)" }}>
            {total} produto{total !== 1 ? "s" : ""} cadastrados
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(201,201,201,0.3)]"
          style={{ backgroundColor: "#C9C9C9", color: "#0A0A0A" }}
        >
          <Plus className="h-4 w-4" />
          Novo produto
        </Link>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(201,201,201,0.15)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "#1A1A1A", borderBottom: "1px solid rgba(201,201,201,0.1)" }}>
              {["Produto", "Categoria", "Preço", "Estoque", "Status", "Ações"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold tracking-wider uppercase"
                  style={{ color: "rgba(200,187,168,0.4)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: "#141414" }}>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm"
                  style={{ color: "rgba(200,187,168,0.4)" }}
                >
                  Nenhum produto cadastrado.{" "}
                  <Link href="/admin/products/new" style={{ color: "#C9C9C9" }}>
                    Criar primeiro produto
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const images = parseImages(product.images as unknown as string);
                const thumb = images[0];
                return (
                  <tr
                    key={product.id}
                    style={{ borderBottom: "1px solid rgba(201,201,201,0.06)" }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-lg overflow-hidden shrink-0"
                          style={{ backgroundColor: "#1A1A1A" }}
                        >
                          {thumb && (
                            <Image
                              src={thumb}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm" style={{ color: "#F5F5F5" }}>
                            {product.name}
                          </p>
                          <p className="text-xs" style={{ color: "rgba(200,187,168,0.5)" }}>
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "#9A9A9A" }}>
                      {product.category.name}
                    </td>
                    <td className="px-5 py-4 font-semibold" style={{ color: "#C9C9C9" }}>
                      {formatPrice(Number(product.price))}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: product.stock === 0 ? "#F87171" : "#9A9A9A" }}>
                      {product.stock}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="flex items-center gap-1.5 text-xs font-medium"
                        style={{ color: product.active ? "#4ADE80" : "#F87171" }}
                      >
                        {product.active ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                        {product.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-[#C9C9C9]"
                          style={{ color: "rgba(200,187,168,0.6)" }}
                        >
                          <Pencil className="h-3 w-3" />
                          Editar
                        </Link>
                        <ProductRowActions
                          productId={product.id}
                          featured={product.featured}
                          productName={product.name}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Paginação */}
        {pages > 1 && (
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{
              borderTop: "1px solid rgba(201,201,201,0.1)",
              backgroundColor: "#1A1A1A",
            }}
          >
            <p className="text-xs" style={{ color: "rgba(200,187,168,0.5)" }}>
              Página {page} de {pages}
            </p>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={`/admin/products?page=${page - 1}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:text-[#C9C9C9]"
                  style={{ color: "#9A9A9A", border: "1px solid rgba(201,201,201,0.2)" }}
                >
                  <ChevronLeft className="h-3 w-3" />
                  Anterior
                </Link>
              ) : (
                <span
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium opacity-30 cursor-not-allowed"
                  style={{ color: "#9A9A9A", border: "1px solid rgba(201,201,201,0.1)" }}
                >
                  <ChevronLeft className="h-3 w-3" />
                  Anterior
                </span>
              )}
              {page < pages ? (
                <Link
                  href={`/admin/products?page=${page + 1}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:text-[#C9C9C9]"
                  style={{ color: "#9A9A9A", border: "1px solid rgba(201,201,201,0.2)" }}
                >
                  Próxima
                  <ChevronRight className="h-3 w-3" />
                </Link>
              ) : (
                <span
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium opacity-30 cursor-not-allowed"
                  style={{ color: "#9A9A9A", border: "1px solid rgba(201,201,201,0.1)" }}
                >
                  Próxima
                  <ChevronRight className="h-3 w-3" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
