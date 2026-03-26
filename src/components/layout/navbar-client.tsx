"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCartCount } from "@/hooks/use-guest-cart";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import type { CategoryWithBrands } from "@/types";

const NAV_ITEMS = [
  {
    key: "feminina",
    label: "Moda Feminina",
    subcategories: [
      { label: "Relógios Femininos", href: "/relogios" },
      { label: "Bolsas Femininas", href: "/bolsas" },
      { label: "Perfumes Femininos", href: "/perfumes" },
    ],
  },
  {
    key: "masculina",
    label: "Moda Masculina",
    subcategories: [
      { label: "Relógios Masculinos", href: "/relogios" },
      { label: "Perfumes Masculinos", href: "/perfumes" },
    ],
  },
];

export function NavbarClient({ categories: _ }: { categories: CategoryWithBrands[] }) {
  const count = useCartCount();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ backgroundColor: "#0D0B0B", borderColor: "rgba(184,150,62,0.25)" }}
      >
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          {/* Left: nav items */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map(item => (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => setActiveKey(item.key)}
                onMouseLeave={() => setActiveKey(null)}
              >
                <button
                  className="text-[11px] tracking-[0.3em] uppercase font-bold transition-colors"
                  style={{ color: activeKey === item.key ? "#B8963E" : "#F7F4EE" }}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </nav>

          {/* Center: Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="font-serif text-lg tracking-[0.5em] uppercase font-bold" style={{ color: "#B8963E" }}>SLC</span>
          </Link>

          {/* Right: icons */}
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
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center text-white font-medium" style={{ backgroundColor: "#B8963E" }}>{count}</span>
              )}
            </Link>
            <button className="lg:hidden" style={{ color: "#F7F4EE" }} onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {activeKey && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 right-0 top-full border-b"
              style={{ backgroundColor: "#0D0B0B", borderColor: "rgba(184,150,62,0.25)" }}
              onMouseEnter={() => setActiveKey(activeKey)}
              onMouseLeave={() => setActiveKey(null)}
            >
              <div className="mx-auto max-w-7xl px-6 py-5 flex gap-8">
                {NAV_ITEMS.find(i => i.key === activeKey)?.subcategories.map(sub => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className="text-[11px] tracking-[0.3em] uppercase font-bold transition-colors"
                    style={{ color: "rgba(247,244,238,0.7)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#B8963E")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(247,244,238,0.7)")}
                  >
                    {sub.label}
                  </Link>
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
            style={{ backgroundColor: "#0D0B0B" }}
          >
            <div className="p-6 pt-20 overflow-y-auto h-full">
              {NAV_ITEMS.map(item => (
                <div key={item.key} className="mb-8">
                  <p className="text-[11px] tracking-[0.3em] uppercase font-bold mb-4" style={{ color: "#B8963E" }}>
                    {item.label}
                  </p>
                  <div className="flex flex-col gap-3">
                    {item.subcategories.map(sub => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="text-sm font-bold tracking-wider uppercase transition-opacity opacity-70 hover:opacity-100"
                        style={{ color: "#F7F4EE" }}
                        onClick={() => setMobileOpen(false)}
                      >
                        {sub.label}
                      </Link>
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
