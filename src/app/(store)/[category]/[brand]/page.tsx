import { notFound } from "next/navigation";
import Image from "next/image";
import { getCategoryBySlug, getBrandBySlug, getProducts } from "@/actions/products";
import { ProductCard } from "@/components/products/product-card";
import { toBackgroundEmbedUrl } from "@/lib/video-utils";
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
    <main>
      {/* Hero cinematográfico — 60vh */}
      <div className="relative w-full overflow-hidden" style={{ height: "60vh", minHeight: "420px" }}>
        {brand.video ? (
          <iframe
            src={toBackgroundEmbedUrl(brand.video)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute pointer-events-none"
            style={{
              top: "50%", left: "50%",
              width: "200vw", height: "112.5vw",
              minWidth: "177.78vh", minHeight: "100vh",
              transform: "translate(-50%, -50%)",
              filter: "brightness(0.55)",
            }}
          />
        ) : brand.banner ? (
          <Image src={brand.banner} alt={brand.name} fill className="object-cover" priority style={{ filter: "brightness(0.55)" }} />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: "#0D0B0B" }} />
        )}

        {/* Overlay profundo */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(13,11,11,0.85) 0%, rgba(13,11,11,0.35) 60%, rgba(13,11,11,0.15) 100%)" }}
        />

        {/* Conteúdo centrado */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          {/* Logo da marca */}
          {brand.logo && (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-6 overflow-hidden"
              style={{ backgroundColor: "rgba(247,244,238,0.92)", border: "1px solid rgba(184,150,62,0.5)" }}
            >
              <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-contain" />
            </div>
          )}

          {/* Label categoria */}
          <p className="label-slc mb-4" style={{ color: "rgba(247,244,238,0.45)" }}>
            {category.name}
          </p>

          {/* Nome da marca */}
          <h1
            className="font-serif font-light text-white uppercase"
            style={{ fontSize: "clamp(2.5rem,6vw,5rem)", letterSpacing: "0.18em", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
          >
            {brand.name}
          </h1>

          {/* Linha dourada */}
          <div style={{ width: "2.5rem", height: "1px", backgroundColor: "#B8963E", margin: "1.5rem auto" }} />

          {/* Descrição */}
          {brand.description && (
            <p
              className="font-serif font-light leading-relaxed"
              style={{ color: "rgba(247,244,238,0.65)", maxWidth: "36rem", fontSize: "0.95rem" }}
            >
              {brand.description}
            </p>
          )}
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <span className="label-slc" style={{ color: "rgba(247,244,238,0.4)", fontSize: "0.55rem" }}>
            Ver Coleção
          </span>
          <span style={{ color: "rgba(184,150,62,0.6)", fontSize: "1rem" }}>↓</span>
        </div>
      </div>

      {/* Produtos */}
      <div className="mx-auto max-w-7xl px-6 py-14">
        <p className="label-slc mb-2" style={{ color: "rgba(13,11,11,0.4)" }}>Coleção {brand.name}</p>
        <p className="label-slc mb-10" style={{ color: "rgba(13,11,11,0.3)" }}>
          {(products as ProductWithRelations[]).length} peças
        </p>
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
