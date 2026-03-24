"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { ProductWithRelations } from "@/types";

export function EditorialGrid({ products }: { products: ProductWithRelations[] }) {
  if (!products.length) return null;
  const [hero, ...rest] = products;

  return (
    <section style={{ backgroundColor: "#EDE9E0" }} className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.p className="label-slc text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Destaques da Coleção
        </motion.p>
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {/* Hero product */}
          <motion.div variants={staggerItem} className="lg:col-span-2 lg:row-span-2">
            <Link href={`/produto/${hero.slug}`} className="group block relative overflow-hidden" style={{ height: "520px" }}>
              {hero.images[0] && <Image src={hero.images[0]} alt={hero.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6" style={{ background: "linear-gradient(to top, rgba(13,11,11,0.7) 0%, transparent 60%)" }}>
                <div>
                  <p className="label-slc mb-1" style={{ color: "#B8963E" }}>{hero.brand.name}</p>
                  <p className="font-serif text-xl italic text-white">{hero.name}</p>
                  <p className="text-white font-mono text-sm mt-1">{formatPrice(hero.price)}</p>
                </div>
              </div>
            </Link>
          </motion.div>
          {/* Rest */}
          {rest.slice(0, 4).map(p => (
            <motion.div key={p.id} variants={staggerItem}>
              <Link href={`/produto/${p.slug}`} className="group block relative overflow-hidden" style={{ height: "252px" }}>
                {p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4" style={{ background: "linear-gradient(to top, rgba(13,11,11,0.6) 0%, transparent 60%)" }}>
                  <div>
                    <p className="label-slc mb-0.5" style={{ color: "#B8963E" }}>{p.brand.name}</p>
                    <p className="font-serif text-sm italic text-white">{p.name}</p>
                    <p className="text-white font-mono text-xs mt-0.5">{formatPrice(p.price)}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
