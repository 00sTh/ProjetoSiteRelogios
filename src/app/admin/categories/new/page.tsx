import { getAdminCategories } from "@/actions/admin";
import { CategoryForm } from "@/components/admin/category-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewCategoryPage() {
  const allCategories = await getAdminCategories();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/categories"
          className="flex items-center gap-1 text-sm"
          style={{ color: "rgba(200,187,168,0.6)" }}
        >
          <ChevronLeft className="h-4 w-4" />
          Categorias
        </Link>
        <span style={{ color: "rgba(200,187,168,0.3)" }}>/</span>
        <span className="text-sm" style={{ color: "#F5F5F5" }}>Nova categoria</span>
      </div>

      <h1 className="font-serif text-2xl font-semibold" style={{ color: "#F5F5F5" }}>
        Nova Categoria
      </h1>

      <CategoryForm
        allCategories={allCategories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
