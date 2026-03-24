"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { CategoryWithBrands } from "@/types";

const categoryImages: Record<string, string> = {
  relogios: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=90",
  perfumes: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=90",
  bolsas:   "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=90",
  sapatos:  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=90",
};

export function CategoryShowcase({ categories }: { categories: CategoryWithBrands[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <motion.p className="label-slc text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        Nossas Coleções
      </motion.p>
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {categories.map(cat => (
          <motion.div key={cat.id} variants={staggerItem}>
            <Link href={`/${cat.slug}`} className="group block overflow-hidden" style={{ aspectRatio: "3/4" }}>
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={categoryImages[cat.slug] ?? "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=90"}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 transition-all duration-500" style={{ background: "linear-gradient(to top, rgba(13,11,11,0.6) 0%, transparent 60%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white font-serif text-lg font-light">{cat.name.replace(" de Luxo", "")}</p>
                  <p className="cta-link text-white mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Explorar</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
