import Link from "next/link";
import Image from "next/image";
import { getAdminCategories, deleteCategory } from "@/actions/admin";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { CategoryDeleteButton } from "@/components/admin/category-delete-button";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold" style={{ color: "#F5F5F5" }}>
            Categorias
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(200,187,168,0.6)" }}>
            {categories.length} categoria{categories.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: "#C9C9C9", color: "#0A0A0A" }}
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Link>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(201,201,201,0.15)", backgroundColor: "#141414" }}
      >
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Tag className="h-10 w-10" style={{ color: "rgba(201,201,201,0.3)" }} />
            <p style={{ color: "rgba(200,187,168,0.5)" }}>Nenhuma categoria cadastrada.</p>
            <Link
              href="/admin/categories/new"
              className="text-sm font-medium"
              style={{ color: "#C9C9C9" }}
            >
              Criar primeira categoria →
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(201,201,201,0.1)" }}>
                {["Nome", "Slug", "Categoria Pai", "Produtos", "Ações"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "rgba(200,187,168,0.5)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  style={{ borderBottom: "1px solid rgba(201,201,201,0.06)" }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {cat.imageUrl ? (
                        <Image
                          src={cat.imageUrl}
                          alt={cat.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-lg object-cover"
                          style={{ border: "1px solid rgba(201,201,201,0.2)" }}
                          unoptimized
                        />
                      ) : (
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: "rgba(201,201,201,0.1)" }}
                        >
                          <Tag className="h-4 w-4" style={{ color: "rgba(201,201,201,0.6)" }} />
                        </div>
                      )}
                      <span className="font-medium text-sm" style={{ color: "#F5F5F5" }}>
                        {cat.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "rgba(201,201,201,0.08)", color: "#C9C9C9" }}>
                      {cat.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: "rgba(200,187,168,0.6)" }}>
                    {cat.parent?.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: "rgba(200,187,168,0.6)" }}>
                    {cat._count.products}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/categories/${cat.id}/edit`}
                        className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors"
                        style={{ backgroundColor: "rgba(201,201,201,0.1)", color: "#C9C9C9" }}
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <CategoryDeleteButton
                        id={cat.id}
                        name={cat.name}
                        productCount={cat._count.products}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
