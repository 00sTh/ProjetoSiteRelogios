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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ backgroundColor: "rgba(247,244,238,0.96)", backdropFilter: "blur(12px)", borderColor: "rgba(13,11,11,0.07)" }}
      >
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          {/* Left: categories */}
          <nav className="hidden lg:flex items-center gap-8">
            {categories.map(cat => (
              <div key={cat.id} className="relative" onMouseEnter={() => setActiveCategory(cat.slug)} onMouseLeave={() => setActiveCategory(null)}>
                <Link href={`/${cat.slug}`} className="label-slc hover:opacity-70 transition-opacity">
                  {cat.name.replace(" de Luxo", "")}
                </Link>
              </div>
            ))}
          </nav>

          {/* Center: Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="font-serif text-lg tracking-[0.5em] uppercase" style={{ color: "#0D0B0B" }}>SLC</span>
          </Link>

          {/* Right: icons */}
          <div className="flex items-center gap-4">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in" className="label-slc hover:opacity-70 transition-opacity hidden sm:block">Entrar</Link>
            </SignedOut>
            <Link href="/carrinho" className="relative">
              <ShoppingBag size={18} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center text-white font-medium" style={{ backgroundColor: "#6B1A2A" }}>{count}</span>
              )}
            </Link>
            <button className="lg:hidden" onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Mega-menu */}
        <AnimatePresence>
          {activeCategory && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-full border-b shadow-sm"
              style={{ backgroundColor: "#F7F4EE", borderColor: "rgba(184,150,62,0.2)" }}
              onMouseEnter={() => setActiveCategory(activeCategory)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <div className="mx-auto max-w-7xl px-6 py-6">
                {categories.filter(c => c.slug === activeCategory).map(cat => (
                  <div key={cat.id}>
                    <p className="label-slc mb-4">{cat.name}</p>
                    <div className="flex flex-wrap gap-6">
                      {cat.brands.map(brand => (
                        <Link key={brand.id} href={`/${cat.slug}/${brand.slug}`} className="group flex flex-col items-center gap-1.5 min-w-[80px]">
                          <div className="w-12 h-12 rounded-full border flex items-center justify-center overflow-hidden group-hover:border-yellow-600 transition-colors" style={{ borderColor: "rgba(13,11,11,0.1)" }}>
                            {brand.logo ? (
                              <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-contain" />
                            ) : (
                              <span className="text-[8px] tracking-widest uppercase text-center px-1 leading-tight" style={{ color: "#0D0B0B" }}>{brand.name.slice(0, 2)}</span>
                            )}
                          </div>
                          <span className="label-slc group-hover:opacity-100 opacity-60 transition-opacity text-center">{brand.name}</span>
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
            className="fixed inset-0 z-40 lg:hidden"
            style={{ backgroundColor: "#F7F4EE" }}
          >
            <div className="p-6 pt-20 overflow-y-auto h-full">
              {categories.map(cat => (
                <div key={cat.id} className="mb-6">
                  <Link href={`/${cat.slug}`} className="label-slc block mb-3" onClick={() => setMobileOpen(false)}>{cat.name}</Link>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.brands.map(brand => (
                      <Link key={brand.id} href={`/${cat.slug}/${brand.slug}`} className="text-sm py-1.5 opacity-60 hover:opacity-100 transition-opacity" onClick={() => setMobileOpen(false)}>{brand.name}</Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
