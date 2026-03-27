import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCategoryBySlug, getProducts } from "@/actions/products";
import { ProductCard } from "@/components/products/product-card";
import type { ProductWithRelations } from "@/types";

export const dynamic = "force-dynamic";

const categoryImages: Record<string, string> = {
  relogios: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1200&q=90",
  perfumes: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200&q=90",
  bolsas:   "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=90",
  sapatos:  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=90",
};

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const { products } = await getProducts({ categoryId: category.id, take: 40 });
  const heroImg = categoryImages[categorySlug];

  return (
    <main>
      {/* Banner da categoria */}
      <div className="relative w-full pt-16 overflow-hidden" style={{ height: "70vh", minHeight: "480px" }}>
        {category.video ? (
          <iframe
            src={category.video}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="absolute pointer-events-none"
            style={{
              top: "50%", left: "50%",
              width: "177.78vh", height: "100vh",
              minWidth: "100%", minHeight: "56.25vw",
              transform: "translate(-50%, -50%) scale(1.05)",
              filter: "brightness(0.55)",
            }}
          />
        ) : heroImg ? (
          <Image src={heroImg} alt={category.name} fill className="object-cover" priority style={{ filter: "brightness(0.55)" }} />
        ) : null}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(13,11,11,0.75) 0%, rgba(13,11,11,0.15) 70%, transparent 100%)" }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="label-slc mb-3" style={{ color: "rgba(247,244,238,0.5)" }}>Coleção</p>
          <h1
            className="font-serif font-light text-white uppercase"
            style={{ fontSize: "clamp(2.5rem,6vw,5rem)", letterSpacing: "0.18em", textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}
          >
            {category.name.replace(" de Luxo", "")}
          </h1>
          <div style={{ width: "2.5rem", height: "1px", backgroundColor: "#B8963E", marginTop: "1.5rem" }} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Brand cards horizontais */}
        {category.brands.length > 0 && (
          <div className="mb-12">
            <p className="label-slc mb-6" style={{ color: "rgba(13,11,11,0.4)" }}>Maisons</p>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {category.brands.map(brand => (
                <Link
                  key={brand.id}
                  href={`/${categorySlug}/${brand.slug}`}
                  className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border transition-all hover:border-yellow-600 group"
                  style={{ borderColor: "rgba(13,11,11,0.12)" }}
                >
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="w-7 h-7 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <span className="font-serif text-xs" style={{ color: "#B8963E" }}>{brand.name.slice(0, 2)}</span>
                  )}
                  <span className="text-[10px] tracking-[0.3em] uppercase font-bold whitespace-nowrap" style={{ color: "#0D0B0B" }}>
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Grid de produtos */}
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
