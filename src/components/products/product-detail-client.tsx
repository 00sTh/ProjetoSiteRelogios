"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useGuestCart } from "@/hooks/use-guest-cart";
import { fadeInUp } from "@/lib/animations";
import type { ProductWithRelations } from "@/types";

export function ProductDetailClient({ product }: { product: ProductWithRelations }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors.length > 0 ? product.colors[0] : undefined
  );
  const { addItem } = useGuestCart();

  const attrs = product.attributes as Record<string, string> | null;

  function handleAdd() {
    addItem(product.id, qty, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Image gallery */}
        <div className="lg:w-[55%] lg:sticky" style={{ top: "80px", alignSelf: "flex-start" }}>
          <div className="relative bg-white overflow-hidden" style={{ aspectRatio: "4/5" }}>
            {product.images[selectedImage] ? (
              <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover" priority />
            ) : (
              <div className="w-full h-full" style={{ backgroundColor: "#EDE9E0" }} />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className="relative flex-shrink-0 overflow-hidden border-2 transition-all" style={{ width: 60, height: 72, borderColor: i === selectedImage ? "#B8963E" : "transparent" }}>
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <motion.div className="lg:w-[45%]" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>
          {/* Superclone badge */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 border" style={{ borderColor: "rgba(184,150,62,0.4)", backgroundColor: "rgba(184,150,62,0.06)" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#B8963E", display: "inline-block" }} />
            <span className="text-[9px] tracking-[0.45em] uppercase font-bold" style={{ color: "#B8963E" }}>Superclone</span>
          </motion.div>

          {/* Breadcrumb */}
          <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-6">
            <Link href={`/${product.category.slug}`} className="label-slc hover:opacity-100 opacity-50 transition-opacity">{product.category.name}</Link>
            <span className="opacity-30 text-xs">›</span>
            <Link href={`/${product.category.slug}/${product.brand.slug}`} className="label-slc hover:opacity-100 opacity-50 transition-opacity">{product.brand.name}</Link>
          </motion.div>

          <motion.p variants={fadeInUp} className="label-slc mb-1" style={{ color: "#B8963E" }}>{product.brand.name}</motion.p>
          <motion.h1 variants={fadeInUp} className="font-serif text-3xl font-light leading-tight mb-1">{product.name}</motion.h1>
          {product.sku && <motion.p variants={fadeInUp} className="font-mono text-xs mb-4" style={{ color: "rgba(13,11,11,0.35)" }}>REF: {product.sku}</motion.p>}

          <motion.div variants={fadeInUp} className="flex items-baseline gap-3 mb-6">
            <span className="font-mono text-2xl font-medium">{formatPrice(product.price)}</span>
            {product.comparePrice && <span className="font-mono text-sm line-through" style={{ color: "rgba(13,11,11,0.4)" }}>{formatPrice(product.comparePrice)}</span>}
          </motion.div>

          {/* Color selector */}
          {product.colors.length > 0 && (
            <motion.div variants={fadeInUp} className="mb-6">
              <p className="label-slc mb-3">
                Cor: <span style={{ color: "#0D0B0B", fontWeight: 500 }}>{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="px-4 py-1.5 text-xs border transition-all"
                    style={{
                      borderColor: selectedColor === color ? "#B8963E" : "rgba(13,11,11,0.15)",
                      color: selectedColor === color ? "#B8963E" : "#0D0B0B",
                      backgroundColor: selectedColor === color ? "rgba(184,150,62,0.05)" : "transparent",
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Attributes */}
          {attrs && Object.keys(attrs).length > 0 && (
            <motion.div variants={fadeInUp} className="mb-6 border-t border-b py-4" style={{ borderColor: "rgba(13,11,11,0.08)" }}>
              <table className="w-full text-xs">
                <tbody>
                  {Object.entries(attrs).map(([k, v]) => (
                    <tr key={k} className="border-b last:border-0" style={{ borderColor: "rgba(13,11,11,0.05)" }}>
                      <td className="py-1.5 pr-4 label-slc w-1/2">{k.replace(/_/g, " ")}</td>
                      <td className="py-1.5">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* Description */}
          {product.description && (
            <motion.p variants={fadeInUp} className="text-sm leading-relaxed mb-6" style={{ color: "rgba(13,11,11,0.65)" }}>{product.description}</motion.p>
          )}

          {/* Qty + Add to cart */}
          <motion.div variants={fadeInUp} className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center border" style={{ borderColor: "rgba(13,11,11,0.15)" }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-lg" style={{ color: "#0D0B0B" }}>−</button>
                <span className="px-4 py-2 font-mono text-sm min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 text-lg" style={{ color: "#0D0B0B" }}>+</button>
              </div>
              <span className="label-slc" style={{ color: product.stock < 3 ? "#6B1A2A" : "rgba(13,11,11,0.4)" }}>
                {product.stock === 0 ? "Esgotado" : product.stock < 3 ? `Apenas ${product.stock} em estoque` : "Em estoque"}
              </span>
            </div>

            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="w-full py-4 text-[10px] tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: added ? "#6B1A2A" : "#0D0B0B", color: "#F7F4EE" }}
            >
              <ShoppingBag size={14} strokeWidth={1.5} />
              {added ? "Adicionado!" : "Adicionar ao Carrinho"}
            </button>

            <Link href="/carrinho" className="w-full py-3.5 text-[10px] tracking-[0.4em] uppercase border text-center block transition-colors hover:bg-ink hover:text-ivory" style={{ borderColor: "rgba(13,11,11,0.2)", color: "#0D0B0B" }}>
              Ver Carrinho
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
