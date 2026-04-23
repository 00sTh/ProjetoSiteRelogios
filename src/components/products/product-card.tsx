"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import type { ProductWithRelations } from "@/types";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const image = product.images[0];
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={`/produto/${product.slug}`} className="group block">
        <div className="relative overflow-hidden bg-white" style={{ aspectRatio: "3/4" }}>
          {image ? (
            <Image src={image} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#EDE9E0" }}>
              <span className="label-slc">SLC</span>
            </div>
          )}
          <div className="absolute inset-0 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(to top, rgba(13,11,11,0.5) 0%, transparent 60%)" }}>
            <span className="text-white cta-link">Ver Produto</span>
          </div>
          {product.comparePrice && (
            <span className="absolute top-3 left-3 text-[9px] tracking-widest uppercase px-2 py-1 text-white" style={{ backgroundColor: "#6B1A2A" }}>Oferta</span>
          )}
        </div>
        <div className="pt-3 pb-1">
          <p className="label-slc mb-0.5" style={{ color: "#B8963E" }}>{product.brand.name}</p>
          <p className="font-serif italic text-sm leading-snug" style={{ color: "#0D0B0B" }}>{product.name}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-mono text-sm font-medium" style={{ color: "#0D0B0B" }}>{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="font-mono text-xs line-through" style={{ color: "rgba(13,11,11,0.4)" }}>{formatPrice(product.comparePrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
