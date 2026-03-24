"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CategoryWithBrands } from "@/types";

export function BrandHighlights({ categories }: { categories: CategoryWithBrands[] }) {
  const allBrands = categories.flatMap(cat => cat.brands.map(b => ({ ...b, categorySlug: cat.slug })));

  return (
    <section className="py-16 overflow-hidden border-t border-b" style={{ borderColor: "rgba(13,11,11,0.06)" }}>
      <div className="mx-auto max-w-7xl px-6 mb-8">
        <p className="label-slc text-center">Marcas em Destaque</p>
      </div>
      <div className="relative">
        <motion.div
          className="flex gap-12 items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ width: "max-content" }}
        >
          {[...allBrands, ...allBrands].map((brand, i) => (
            <Link
              key={`${brand.id}-${i}`}
              href={`/${brand.categorySlug}/${brand.slug}`}
              className="whitespace-nowrap label-slc opacity-40 hover:opacity-100 transition-opacity"
              style={{ fontSize: "0.7rem", letterSpacing: "0.4em" }}
            >
              {brand.name}
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
