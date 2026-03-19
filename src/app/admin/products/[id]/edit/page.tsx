import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Admin — Editar Produto" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { category: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  // Serialize to plain objects — Prisma instances have symbol properties
  // that cannot be passed to Client Components.
  const plainProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    images: parseImages(product.images as string | string[]),
    featured: product.featured,
    active: product.active,
    ingredients: product.ingredients,
    usage: product.usage,
    categoryId: product.categoryId,
    brand: product.brand,
  };
  const plainCategories = categories.map(({ id, name }) => ({ id, name }));

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs mb-4" style={{ color: "rgba(200,187,168,0.5)" }}>
          <Link href="/admin/products" className="hover:text-[#C9C9C9] transition-colors">
            Produtos
          </Link>
          <span>/</span>
          <span style={{ color: "#C9C9C9" }}>Editar</span>
        </div>
        <h1 className="font-serif text-3xl font-bold" style={{ color: "#F5F5F5" }}>
          Editar: {product.name}
        </h1>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: "#141414", border: "1px solid rgba(201,201,201,0.15)" }}
      >
        <ProductForm product={plainProduct} categories={plainCategories} />
      </div>
    </div>
  );
}
