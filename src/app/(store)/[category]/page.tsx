import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts } from "@/actions/products";
import { ProductCard } from "@/components/products/product-card";
import type { ProductWithRelations } from "@/types";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const { products } = await getProducts({ categoryId: category.id, take: 40 });

  return (
    <main className="pt-20">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="label-slc mb-2">{category.name}</p>
        <h1 className="font-serif text-4xl font-light mb-8">{category.name}</h1>

        {/* Brand filter pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {category.brands.map(brand => (
            <a key={brand.id} href={`/${categorySlug}/${brand.slug}`}
              className="px-4 py-1.5 border text-xs tracking-wider transition-colors hover:border-yellow-600"
              style={{ borderColor: "rgba(13,11,11,0.15)", color: "#0D0B0B" }}>
              {brand.name}
            </a>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {(products as ProductWithRelations[]).map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {!products.length && (
          <div className="py-20 text-center">
            <p className="label-slc">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </main>
  );
}
