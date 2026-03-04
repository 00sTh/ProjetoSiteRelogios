import { notFound } from "next/navigation";
import { getAdminCategory, getAdminCategories } from "@/actions/admin";
import { CategoryForm } from "@/components/admin/category-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const [category, allCategories] = await Promise.all([
    getAdminCategory(id),
    getAdminCategories(),
  ]);

  if (!category) notFound();

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
        <span className="text-sm" style={{ color: "#F5F5F5" }}>Editar</span>
      </div>

      <h1 className="font-serif text-2xl font-semibold" style={{ color: "#F5F5F5" }}>
        Editar: {category.name}
      </h1>

      <CategoryForm
        category={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          imageUrl: category.imageUrl ?? null,
          parentId: category.parentId ?? null,
        }}
        allCategories={allCategories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
