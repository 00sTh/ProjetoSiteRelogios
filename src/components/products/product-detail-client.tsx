"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useGuestCart } from "@/hooks/use-guest-cart";
import { fadeInUp } from "@/lib/animations";
import { toEmbedUrl, IFRAME_ALLOW } from "@/lib/video-utils";
import type { ProductWithRelations } from "@/types";

export function ProductDetailClient({ product }: { product: ProductWithRelations }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [specsOpen, setSpecsOpen] = useState(true);
  const { addItem } = useGuestCart();

  const attrs = product.attributes as Record<string, string> | null;
  const attrEntries = attrs ? Object.entries(attrs) : [];
  const cleanDescription = product.description?.replace(/ superclone replica alta qualidade superclone$/, "");
  const isShorts = product.video?.includes("shorts") || false;

  function handleAdd() {
    addItem(product.id, qty, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <>
      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 pt-8 pb-5">
        <div className="flex items-center gap-2">
          <Link href={`/${product.category.slug}`} className="label-slc opacity-40 hover:opacity-80 transition-opacity">{product.category.name}</Link>
          <span className="opacity-20 text-xs">›</span>
          <Link href={`/${product.category.slug}/${product.brand.slug}`} className="label-slc opacity-40 hover:opacity-80 transition-opacity">{product.brand.name}</Link>
        </div>
      </div>

      {/* ── Two-column: Image + Info ────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 pb-0">
        <div className="flex flex-col lg:flex-row lg:gap-20">

          {/* LEFT: Image gallery */}
          <div className="lg:w-[58%]">
            {/* Main image — square */}
            <div className="relative overflow-hidden bg-white" style={{ aspectRatio: "1/1" }}>
              {product.images[selectedImage] ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-[1.04]"
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
              ) : (
                <div className="w-full h-full" style={{ backgroundColor: "#EDE9E0" }} />
              )}
            </div>
            {/* Thumbnail strip */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className="relative flex-shrink-0 overflow-hidden bg-white transition-all"
                    style={{
                      width: 72, height: 72,
                      outline: i === selectedImage ? "2px solid #B8963E" : "2px solid transparent",
                      outlineOffset: "2px",
                    }}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="72px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product info — sticky */}
          <motion.div
            className="lg:w-[42%] pt-10 lg:pt-0 lg:sticky"
            style={{ alignSelf: "flex-start", top: "100px" }}
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {/* Brand */}
            <motion.p variants={fadeInUp} className="label-slc mb-3" style={{ color: "#B8963E", letterSpacing: "0.22em" }}>
              {product.brand.name}
            </motion.p>

            {/* Title */}
            <motion.h1 variants={fadeInUp} className="font-serif font-light leading-tight mb-3" style={{ fontSize: "clamp(1.75rem, 2.5vw, 2.5rem)" }}>
              {product.name}
            </motion.h1>

            {/* REF */}
            {product.sku && (
              <motion.p variants={fadeInUp} className="font-mono text-xs mb-5" style={{ color: "rgba(13,11,11,0.3)" }}>
                REF. {product.sku}
              </motion.p>
            )}

            {/* Divider */}
            <motion.div variants={fadeInUp} className="mb-6" style={{ height: "1px", backgroundColor: "rgba(13,11,11,0.1)" }} />

            {/* Price */}
            <motion.div variants={fadeInUp} className="flex items-baseline gap-3 mb-5">
              <span className="font-mono text-2xl font-medium">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <span className="font-mono text-sm line-through" style={{ color: "rgba(13,11,11,0.3)" }}>
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </motion.div>

            {/* Color selector */}
            {product.colors.length > 0 && (
              <motion.div variants={fadeInUp} className="mb-5">
                <p className="label-slc mb-3 text-[10px]">
                  Cor: <span className="font-medium" style={{ color: "#0D0B0B" }}>{selectedColor}</span>
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
                        color: selectedColor === color ? "#B8963E" : "rgba(13,11,11,0.7)",
                        backgroundColor: selectedColor === color ? "rgba(184,150,62,0.04)" : "transparent",
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Stock status */}
            <motion.p variants={fadeInUp} className="label-slc text-[10px] mb-4" style={{
              color: product.stock === 0 ? "#6B1A2A" : product.stock < 3 ? "#B8963E" : "rgba(13,11,11,0.35)",
            }}>
              {product.stock === 0 ? "Esgotado" : product.stock < 3 ? `Apenas ${product.stock} unidades disponíveis` : "Em estoque"}
            </motion.p>

            {/* Qty + CTA */}
            <motion.div variants={fadeInUp} className="space-y-3 mb-7">
              <div className="flex gap-3 items-center">
                <div className="flex items-center border" style={{ borderColor: "rgba(13,11,11,0.15)" }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center text-lg select-none" style={{ color: "#0D0B0B" }}>−</button>
                  <span className="w-10 h-11 flex items-center justify-center font-mono text-sm">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-10 h-11 flex items-center justify-center text-lg select-none" style={{ color: "#0D0B0B" }}>+</button>
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={product.stock === 0}
                className="w-full py-[14px] text-[10px] tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                style={{ backgroundColor: added ? "#6B1A2A" : "#0D0B0B", color: "#F7F4EE" }}
              >
                <ShoppingBag size={13} strokeWidth={1.5} />
                {added ? "Adicionado ao Carrinho" : "Adicionar ao Carrinho"}
              </button>

              <Link
                href="/carrinho"
                className="w-full py-3.5 text-[10px] tracking-[0.4em] uppercase border text-center block transition-all"
                style={{ borderColor: "rgba(13,11,11,0.2)", color: "#0D0B0B" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#0D0B0B"; (e.currentTarget as HTMLElement).style.color = "#F7F4EE"; (e.currentTarget as HTMLElement).style.borderColor = "#0D0B0B"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "#0D0B0B"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(13,11,11,0.2)"; }}
              >
                Ver Carrinho
              </Link>
            </motion.div>

            {/* Key specs preview — first 3 attributes */}
            {attrEntries.length > 0 && (
              <motion.div variants={fadeInUp} className="border-t pt-5" style={{ borderColor: "rgba(13,11,11,0.08)" }}>
                <div className="space-y-3">
                  {attrEntries.slice(0, 3).map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between">
                      <span className="label-slc opacity-40 text-[9px] tracking-[0.18em]">{k.replace(/_/g, " ").toUpperCase()}</span>
                      <span className="text-xs text-right max-w-[58%] font-medium">{v}</span>
                    </div>
                  ))}
                  {attrEntries.length > 3 && (
                    <button
                      type="button"
                      onClick={() => document.getElementById("slc-specs")?.scrollIntoView({ behavior: "smooth" })}
                      className="label-slc text-[9px] opacity-40 hover:opacity-80 transition-opacity mt-1"
                    >
                      + {attrEntries.length - 3} especificações ↓
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── ESPECIFICAÇÕES — full-width accordion ──────────────────────── */}
      {attrEntries.length > 0 && (
        <div id="slc-specs" className="mx-auto max-w-7xl px-6 mt-16">
          <div className="border-t" style={{ borderColor: "rgba(13,11,11,0.1)" }}>
            <button
              className="w-full flex items-center justify-between py-5"
              onClick={() => setSpecsOpen(o => !o)}
            >
              <span className="label-slc tracking-[0.28em]">Especificações</span>
              <span className="font-light text-xl" style={{ color: "rgba(13,11,11,0.35)" }}>{specsOpen ? "−" : "+"}</span>
            </button>
            <AnimatePresence initial={false}>
              {specsOpen && (
                <motion.div
                  key="specs"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="overflow-hidden"
                >
                  <div className="grid sm:grid-cols-2 gap-x-20 pb-12">
                    {attrEntries.map(([k, v]) => (
                      <div key={k} className="flex items-baseline justify-between border-b py-3.5" style={{ borderColor: "rgba(13,11,11,0.06)" }}>
                        <span className="label-slc opacity-45 text-[10px] tracking-widest w-2/5 flex-shrink-0">{k.replace(/_/g, " ").toUpperCase()}</span>
                        <span className="text-sm text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── DESCRIÇÃO — editorial, full-width centered ─────────────────── */}
      {cleanDescription && (
        <div className="border-t mt-0" style={{ borderColor: "rgba(13,11,11,0.08)" }}>
          <div className="mx-auto max-w-2xl px-6 py-16 text-center">
            <p className="label-slc opacity-30 mb-8 tracking-[0.3em]">Sobre este produto</p>
            <div className="space-y-5">
              {cleanDescription.split(/\n\n+/).map((para, i) => (
                <p key={i} className="font-serif text-[1.05rem] font-light leading-[1.95]" style={{ color: "rgba(13,11,11,0.7)" }}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── VÍDEO ──────────────────────────────────────────────────────── */}
      {product.video && (
        <div className="border-t" style={{ borderColor: "rgba(13,11,11,0.08)" }}>
          <div className="mx-auto max-w-7xl px-6 py-16">
            <p className="label-slc text-center mb-10 tracking-[0.28em] opacity-30">Em Detalhe</p>
            <div
              className="relative overflow-hidden mx-auto"
              style={isShorts
                ? { width: "min(380px, 100%)", aspectRatio: "9/16" }
                : { width: "100%", aspectRatio: "16/9", maxWidth: "1000px" }
              }
            >
              <iframe
                src={toEmbedUrl(product.video)}
                allow={IFRAME_ALLOW}
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                style={{
                  position: "absolute", top: "50%", left: "50%",
                  width: isShorts ? "120%" : "110%",
                  height: isShorts ? "120%" : "110%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hidden SEO */}
      <span aria-hidden="true" style={{ position: "absolute", fontSize: "1px", color: "transparent", userSelect: "none", pointerEvents: "none" }}>superclone replica alta qualidade</span>
    </>
  );
}
