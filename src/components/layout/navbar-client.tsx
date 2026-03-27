"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCartCount } from "@/hooks/use-guest-cart";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import type { CategoryWithBrands } from "@/types";

export function NavbarClient({ categories }: { categories: CategoryWithBrands[] }) {
  const count = useCartCount();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ backgroundColor: "#0D0B0B", borderColor: "rgba(184,150,62,0.25)" }}
      >
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">

          {/* Esquerda: categorias */}
          <nav className="hidden lg:flex items-center gap-8">
            {categories.map(cat => (
              <div
                key={cat.slug}
                className="relative"
                onMouseEnter={() => setActiveSlug(cat.slug)}
                onMouseLeave={() => setActiveSlug(null)}
              >
                <Link
                  href={`/${cat.slug}`}
                  className="text-[11px] tracking-[0.3em] uppercase font-bold transition-colors"
                  style={{ color: activeSlug === cat.slug ? "#B8963E" : "#F7F4EE" }}
                >
                  {cat.name.replace(" de Luxo", "")}
                </Link>
              </div>
            ))}
          </nav>

          {/* Centro: Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="font-serif text-lg tracking-[0.5em] uppercase font-bold" style={{ color: "#B8963E" }}>
              SLC
            </span>
          </Link>

          {/* Direita: ícones */}
          <div className="flex items-center gap-4">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-[11px] tracking-[0.3em] uppercase font-bold transition-colors hidden sm:block"
                style={{ color: "#F7F4EE" }}
              >
                Entrar
              </Link>
            </SignedOut>
            <Link href="/carrinho" className="relative" style={{ color: "#F7F4EE" }}>
              <ShoppingBag size={18} strokeWidth={1.5} />
              {count > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: "#B8963E" }}
                >
                  {count}
                </span>
              )}
            </Link>
            <button className="lg:hidden" style={{ color: "#F7F4EE" }} onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Mega-menu desktop — marcas com logo */}
        <AnimatePresence>
          {activeSlug && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 right-0 top-full border-b"
              style={{ backgroundColor: "#0D0B0B", borderColor: "rgba(184,150,62,0.25)" }}
              onMouseEnter={() => setActiveSlug(activeSlug)}
              onMouseLeave={() => setActiveSlug(null)}
            >
              <div className="mx-auto max-w-7xl px-6 py-6">
                {categories.filter(c => c.slug === activeSlug).map(cat => (
                  <div key={cat.id}>
                    <p className="label-slc mb-5" style={{ color: "rgba(184,150,62,0.7)" }}>
                      {cat.name}
                    </p>
                    <div className="flex flex-wrap gap-6">
                      {cat.brands.map(brand => (
                        <Link
                          key={brand.id}
                          href={`/${cat.slug}/${brand.slug}`}
                          className="group flex flex-col items-center gap-2"
                          style={{ minWidth: "72px" }}
                        >
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border transition-colors"
                            style={{ borderColor: "rgba(184,150,62,0.2)", backgroundColor: "rgba(247,244,238,0.05)" }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = "#B8963E")}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(184,150,62,0.2)")}
                          >
                            {brand.logo ? (
                              <img src={brand.logo} alt={brand.name} className="w-9 h-9 object-contain" />
                            ) : (
                              <span className="font-serif text-[10px] tracking-wider text-center" style={{ color: "#B8963E" }}>
                                {brand.name.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span
                            className="text-[9px] tracking-[0.35em] uppercase text-center transition-colors"
                            style={{ color: "rgba(247,244,238,0.5)" }}
                            onMouseEnter={e => (e.currentTarget.style.color = "#B8963E")}
                            onMouseLeave={e => (e.currentTarget.style.color = "rgba(247,244,238,0.5)")}
                          >
                            {brand.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-40 lg:hidden overflow-y-auto"
            style={{ backgroundColor: "#0D0B0B" }}
          >
            <div className="p-6 pt-20">
              {categories.map(cat => (
                <div key={cat.id} className="mb-4 border-b" style={{ borderColor: "rgba(184,150,62,0.12)" }}>
                  <button
                    className="w-full flex items-center justify-between py-4 text-[11px] tracking-[0.3em] uppercase font-bold"
                    style={{ color: mobileExpanded === cat.slug ? "#B8963E" : "#F7F4EE" }}
                    onClick={() => setMobileExpanded(v => v === cat.slug ? null : cat.slug)}
                  >
                    {cat.name.replace(" de Luxo", "")}
                    <span style={{ fontSize: "0.7rem" }}>{mobileExpanded === cat.slug ? "−" : "+"}</span>
                  </button>
                  <AnimatePresence>
                    {mobileExpanded === cat.slug && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4 grid grid-cols-3 gap-4">
                          {cat.brands.map(brand => (
                            <Link
                              key={brand.id}
                              href={`/${cat.slug}/${brand.slug}`}
                              className="flex flex-col items-center gap-2"
                              onClick={() => setMobileOpen(false)}
                            >
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border"
                                style={{ borderColor: "rgba(184,150,62,0.3)", backgroundColor: "rgba(247,244,238,0.05)" }}
                              >
                                {brand.logo ? (
                                  <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" />
                                ) : (
                                  <span className="font-serif text-[9px]" style={{ color: "#B8963E" }}>
                                    {brand.name.slice(0, 2).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] tracking-wider uppercase text-center" style={{ color: "rgba(247,244,238,0.6)" }}>
                                {brand.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
