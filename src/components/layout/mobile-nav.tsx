"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ShoppingCart, User, LayoutDashboard } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const navLinks = [
  { href: "/products", label: "Toda a Coleção" },
  { href: "/products?category=relogios", label: "Relógios" },
  { href: "/products?category=bolsas", label: "Bolsas" },
  { href: "/products?category=sapatos", label: "Sapatos" },
  { href: "/products?category=oculos", label: "Óculos" },
  { href: "/products?category=perfumes", label: "Perfumes" },
  { href: "/products?category=acessorios", label: "Acessórios" },
  { href: "/about", label: "About" },
];

interface MobileNavProps {
  userId: string | null;
  isAdmin: boolean;
  cartCount: number;
}

export function MobileNav({ userId, isAdmin, cartCount }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-9 h-9 transition-colors duration-200 hover:text-[#0A0A0A]"
        style={{ color: "#6A6A6A" }}
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50"
              style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
              onClick={() => setOpen(false)}
            />

            {/* Drawer — wrapper clips the slide animation to prevent fixed-element overflow in Safari */}
            <div className="fixed top-0 right-0 h-full w-64 max-w-[80vw] z-50 overflow-hidden">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 240 }}
              className="h-full w-full flex flex-col"
              style={{
                backgroundColor: "#FAFAFA",
                borderLeft: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
              >
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "0.75rem",
                    letterSpacing: "0.4em",
                    textTransform: "uppercase",
                    color: "#0A0A0A",
                    textDecoration: "none",
                  }}
                >
                  {APP_NAME}
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 flex items-center justify-center transition-colors hover:text-[#0A0A0A]"
                  style={{ color: "#8A8A8A" }}
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1">
                <ul>
                  {navLinks.map(({ href, label }) => (
                    <li key={href} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        className="flex items-center transition-colors duration-200 hover:text-[#0A0A0A]"
                        style={{
                          padding: "1rem 1.5rem",
                          color: "#6A6A6A",
                          fontSize: "10px",
                          letterSpacing: "0.3em",
                          textTransform: "uppercase",
                          textDecoration: "none",
                        }}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Footer actions */}
              <div
                className="px-6 py-6 space-y-4"
                style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
              >
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 transition-colors duration-200 hover:text-[#0A0A0A]"
                  style={{ color: "#6A6A6A", textDecoration: "none" }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                    Cart
                  </span>
                  {cartCount > 0 && (
                    <span
                      className="ml-auto text-xs font-bold w-5 h-5 flex items-center justify-center"
                      style={{ backgroundColor: "#0A0A0A", color: "#FAFAFA" }}
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 transition-colors duration-200 hover:text-[#0A0A0A]"
                    style={{ color: "#6A6A6A", textDecoration: "none" }}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                      Admin
                    </span>
                  </Link>
                )}

                {userId ? (
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 transition-colors duration-200 hover:text-[#0A0A0A]"
                    style={{ color: "#6A6A6A", textDecoration: "none" }}
                  >
                    <User className="h-4 w-4" />
                    <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                      Account
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/sign-in"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 transition-colors duration-200 hover:text-[#0A0A0A]"
                    style={{ color: "#6A6A6A", textDecoration: "none" }}
                  >
                    <User className="h-4 w-4" />
                    <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                      Sign In
                    </span>
                  </Link>
                )}
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
