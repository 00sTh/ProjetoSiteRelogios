import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/actions/products";
import { ProductDetailClient } from "@/components/products/product-detail-client";
import { ProductCard } from "@/components/products/product-card";
import type { ProductWithRelations } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Produto", description: product?.description ?? undefined };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();
  const related = await getRelatedProducts(product.id, product.brandId, 4);

  return (
    <main className="pt-20">
      <ProductDetailClient product={product as ProductWithRelations} />

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <p className="label-slc mb-8">Mais de {product.brand.name}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {(related as ProductWithRelations[]).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </main>
  );
}
