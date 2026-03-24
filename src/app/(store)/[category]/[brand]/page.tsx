import { notFound } from "next/navigation";
import Image from "next/image";
import { getCategoryBySlug, getBrandBySlug, getProducts } from "@/actions/products";
import { ProductCard } from "@/components/products/product-card";
import type { ProductWithRelations } from "@/types";

export const dynamic = "force-dynamic";

export default async function BrandPage({ params }: { params: Promise<{ category: string; brand: string }> }) {
  const { category: categorySlug, brand: brandSlug } = await params;
  const [category, brand] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getBrandBySlug(brandSlug),
  ]);
  if (!category || !brand) notFound();

  const { products } = await getProducts({ brandId: brand.id, take: 40 });

  return (
    <main className="pt-16">
      {/* Brand banner */}
      <div className="relative w-full" style={{ height: "320px" }}>
        {brand.banner ? (
          <Image src={brand.banner} alt={brand.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#1C1917" }} />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "rgba(13,11,11,0.45)" }}>
          <p className="label-slc mb-3" style={{ color: "rgba(247,244,238,0.5)" }}>{category.name}</p>
          <h1 className="font-serif text-5xl font-light text-white tracking-widest uppercase">{brand.name}</h1>
          {brand.description && <p className="text-white text-sm max-w-lg text-center mt-4 opacity-70 leading-relaxed">{brand.description}</p>}
        </div>
      </div>

      {/* Products */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="label-slc mb-8">{(products as ProductWithRelations[]).length} produtos</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {(products as ProductWithRelations[]).map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {!products.length && (
          <div className="py-20 text-center">
            <p className="label-slc">Nenhum produto cadastrado para esta marca ainda.</p>
          </div>
        )}
      </div>
    </main>
  );
}
