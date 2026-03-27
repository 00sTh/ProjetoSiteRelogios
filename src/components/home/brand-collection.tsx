"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { CategoryWithBrands } from "@/types";

// Fallback images por categoria quando a marca não tem banner
const categoryFallbacks: Record<string, string> = {
  relogios: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=90",
  perfumes: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=90",
  bolsas:   "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=90",
  sapatos:  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=90",
};

export function BrandCollection({ categories }: { categories: CategoryWithBrands[] }) {
  const brands = categories.flatMap(cat =>
    cat.brands.map(b => ({ ...b, categorySlug: cat.slug, categoryName: cat.name }))
  );

  if (!brands.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <motion.p
        className="label-slc text-center mb-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Nossas Maisons
      </motion.p>
      <motion.p
        className="font-serif text-center font-light mb-14"
        style={{ fontSize: "clamp(1.5rem,2.5vw,2.2rem)", color: "#0D0B0B" }}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        As Marcas da Coleção
      </motion.p>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {brands.map(brand => {
          const imgSrc = brand.banner ?? categoryFallbacks[brand.categorySlug] ?? categoryFallbacks.relogios;
          return (
            <motion.div key={brand.id} variants={staggerItem}>
              <Link
                href={`/${brand.categorySlug}/${brand.slug}`}
                className="group block overflow-hidden relative"
                style={{ aspectRatio: "3/4" }}
              >
                {/* Imagem de fundo */}
                <Image
                  src={imgSrc}
                  alt={brand.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />

                {/* Overlay padrão */}
                <div
                  className="absolute inset-0 transition-all duration-500"
                  style={{ background: "linear-gradient(to top, rgba(13,11,11,0.75) 0%, rgba(13,11,11,0.1) 55%, transparent 100%)" }}
                />

                {/* Overlay mais escuro no hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "rgba(13,11,11,0.25)" }}
                />

                {/* Logo da marca (centro) — aparece no hover */}
                {brand.logo && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "rgba(247,244,238,0.12)", backdropFilter: "blur(4px)", border: "1px solid rgba(184,150,62,0.4)" }}
                    >
                      <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-contain" />
                    </div>
                  </div>
                )}

                {/* Conteúdo no rodapé do card */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  {/* Linha dourada */}
                  <div className="mb-3" style={{ width: "1.5rem", height: "1px", backgroundColor: "#B8963E" }} />

                  <p className="label-slc mb-1" style={{ color: "rgba(247,244,238,0.5)" }}>
                    {brand.categoryName.replace(" de Luxo", "")}
                  </p>
                  <p className="font-serif font-light text-white" style={{ fontSize: "1.15rem", letterSpacing: "0.05em" }}>
                    {brand.name}
                  </p>

                  {/* CTA — aparece no hover */}
                  <p
                    className="cta-link mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ color: "#B8963E" }}
                  >
                    Descobrir →
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
