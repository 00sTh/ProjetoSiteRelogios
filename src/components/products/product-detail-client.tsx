"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useGuestCart } from "@/hooks/use-guest-cart";
import { fadeInUp } from "@/lib/animations";
import { toEmbedUrl, IFRAME_ALLOW } from "@/lib/video-utils";
import type { ProductWithRelations } from "@/types";

const TRUST_BADGES = [
  { label: "Frete Grátis e Devoluções" },
  { label: "Pagamento Seguro" },
  { label: "Garantia de 1 Ano" },
  { label: "Produto Autêntico" },
];

export function ProductDetailClient({ product }: { product: ProductWithRelations }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [showSticky, setShowSticky] = useState(false);
  const { addItem } = useGuestCart();

  const attrs = product.attributes as Record<string, string> | null;
  const attrEntries = attrs ? Object.entries(attrs) : [];
  const cleanDescription = product.description?.replace(/ superclone replica alta qualidade superclone$/, "");
  const isShorts = product.video?.includes("shorts") || false;

  // Build available tabs
  const tabs = [
    ...(cleanDescription ? [{ id: "descricao", label: "DESCRIÇÃO" }] : []),
    ...(attrEntries.length > 0 ? [{ id: "especificacoes", label: "ESPECIFICAÇÕES" }] : []),
    ...(product.video ? [{ id: "video", label: "VÍDEO" }] : []),
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleAdd() {
    addItem(product.id, qty, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <>
      {/* ── Sticky bar ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            key="sticky"
            initial={{ y: -64 }}
            animate={{ y: 0 }}
            exit={{ y: -64 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-0 left-0 right-0 z-50 border-b"
            style={{ backgroundColor: "#F7F4EE", borderColor: "rgba(13,11,11,0.1)" }}
          >
            <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0">
                {product.images[0] && (
                  <div className="relative flex-shrink-0 overflow-hidden" style={{ width: 44, height: 44 }}>
                    <Image src={product.images[0]} alt="" fill className="object-cover" sizes="44px" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="label-slc truncate" style={{ color: "#B8963E" }}>{product.brand.name}</p>
                  <p className="text-xs font-medium truncate leading-tight mt-0.5" style={{ color: "#0D0B0B" }}>{product.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 flex-shrink-0">
                <span className="font-mono text-sm font-medium hidden sm:block">{formatPrice(product.price)}</span>
                <button
                  onClick={handleAdd}
                  disabled={product.stock === 0}
                  className="py-2.5 px-5 text-[9px] tracking-[0.35em] uppercase transition-all flex items-center gap-2 disabled:opacity-30"
                  style={{ backgroundColor: added ? "#6B1A2A" : "#0D0B0B", color: "#F7F4EE" }}
                >
                  <ShoppingBag size={11} strokeWidth={1.5} />
                  {added ? "Adicionado" : "Adicionar"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

          {/* LEFT: Galeria estilo Omega */}
          <div className="lg:w-[58%]">

            {/* ── Mobile: imagem selecionada + strip ─────────────────── */}
            <div className="lg:hidden">
              <div className="relative overflow-hidden" style={{ aspectRatio: "1/1", backgroundColor: "#F2F2F2" }}>
                {product.images[selectedImage] && (
                  <Image src={product.images[selectedImage]} alt={product.name} fill
                    className="object-contain p-6" priority sizes="100vw" />
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)}
                      className="relative flex-shrink-0 overflow-hidden transition-all"
                      style={{ width: 58, height: 58, backgroundColor: "#F2F2F2",
                        outline: i === selectedImage ? "1.5px solid #B8963E" : "1.5px solid transparent",
                        outlineOffset: "2px" }}>
                      <Image src={img} alt="" fill className="object-contain p-1" sizes="58px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Desktop: hero + grade 2 colunas ────────────────────── */}
            <div className="hidden lg:block">
              {/* Imagem 1 — hero full-width */}
              <motion.div className="relative w-full overflow-hidden"
                style={{ aspectRatio: "1/1", backgroundColor: "#F2F2F2" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}>
                {product.images[0] && (
                  <Image src={product.images[0]} alt={product.name} fill
                    className="object-contain p-10 hover:scale-[1.03] transition-transform duration-700"
                    priority sizes="58vw" />
                )}
              </motion.div>

              {/* Imagens 2+ em grade 2 colunas */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  {product.images.slice(1).map((img, i) => (
                    <motion.div key={i + 1} className="relative overflow-hidden"
                      style={{ aspectRatio: "1/1", backgroundColor: "#F2F2F2" }}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 + i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}>
                      <Image src={img}
                        alt={`${product.name} — ângulo ${i + 2}`}
                        fill
                        className="object-contain p-6 hover:scale-[1.04] transition-transform duration-700"
                        sizes="29vw" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
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
            <motion.div variants={fadeInUp} className="space-y-3 mb-6">
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

            {/* Trust badges */}
            <motion.div variants={fadeInUp} className="border-t pt-5" style={{ borderColor: "rgba(13,11,11,0.08)" }}>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {TRUST_BADGES.map((b) => (
                  <div key={b.label} className="flex items-start gap-2">
                    <span className="text-[10px] mt-px flex-shrink-0" style={{ color: "#B8963E" }}>✓</span>
                    <span className="label-slc text-[9px] leading-snug opacity-50">{b.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      {tabs.length > 0 && (
        <div className="mt-16">
          {/* Tab bar */}
          <div className="border-b" style={{ borderColor: "rgba(13,11,11,0.1)" }}>
            <div className="mx-auto max-w-7xl px-6">
              <div className="flex gap-10">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative py-4 label-slc text-[10px] transition-all"
                    style={{
                      color: activeTab === tab.id ? "#0D0B0B" : undefined,
                      opacity: activeTab === tab.id ? 1 : undefined,
                    }}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="tab-underline"
                        className="absolute bottom-0 left-0 right-0"
                        style={{ height: 2, backgroundColor: "#B8963E" }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {activeTab === "descricao" && cleanDescription && (
              <motion.div
                key="descricao"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
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
              </motion.div>
            )}

            {activeTab === "especificacoes" && attrEntries.length > 0 && (
              <motion.div
                key="especificacoes"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="mx-auto max-w-7xl px-6 py-12">
                  <div className="grid sm:grid-cols-2 gap-x-20">
                    {attrEntries.map(([k, v]) => (
                      <div key={k} className="flex items-baseline justify-between border-b py-3.5" style={{ borderColor: "rgba(13,11,11,0.06)" }}>
                        <span className="label-slc opacity-45 text-[10px] tracking-widest w-2/5 flex-shrink-0">{k.replace(/_/g, " ").toUpperCase()}</span>
                        <span className="text-sm text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "video" && product.video && (
              <motion.div
                key="video"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Hidden SEO */}
      <span aria-hidden="true" style={{ position: "absolute", fontSize: "1px", color: "transparent", userSelect: "none", pointerEvents: "none" }}>superclone replica alta qualidade</span>
    </>
  );
}
