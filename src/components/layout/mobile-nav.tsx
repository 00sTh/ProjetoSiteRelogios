"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, User, LayoutDashboard, Heart } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Collections" },
  { href: "/products?category=watches", label: "Watches" },
  { href: "/products?category=sunglasses", label: "Sunglasses" },
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
      {/* Hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center w-11 h-11 rounded-full transition-colors"
        style={{ color: "#C9C9C9" }}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50"
              style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-72 z-50 flex flex-col"
              style={{
                backgroundColor: "#141414",
                borderLeft: "1px solid rgba(201,201,201,0.2)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-5"
                style={{ borderBottom: "1px solid rgba(201,201,201,0.12)" }}
              >
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="font-serif font-bold tracking-[0.18em] uppercase text-lg"
                  style={{ color: "#F5F5F5" }}
                >
                  {APP_NAME}
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:text-[#C9C9C9]"
                  style={{ color: "#9A9A9A" }}
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 px-4 py-8">
                <ul className="space-y-1">
                  {navLinks.map(({ href, label }, i) => (
                    <motion.li
                      key={href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.06 }}
                    >
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        className="flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all duration-200 hover:text-[#C9C9C9] hover:bg-[rgba(201,201,201,0.06)]"
                        style={{ color: "#9A9A9A", fontSize: "0.7rem", letterSpacing: "0.14em" }}
                      >
                        {label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Footer actions */}
              <div
                className="px-4 pb-8 pt-4 space-y-3"
                style={{ borderTop: "1px solid rgba(201,201,201,0.12)" }}
              >
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
                  style={{
                    backgroundColor: "rgba(201,201,201,0.08)",
                    border: "1px solid rgba(201,201,201,0.2)",
                    color: "#F5F5F5",
                  }}
                >
                  <ShoppingCart className="h-4 w-4" style={{ color: "#C9C9C9" }} />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span
                      className="ml-auto text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
                      style={{ backgroundColor: "#C9C9C9", color: "#0A0A0A" }}
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>

                {/* Admin Panel (admins only) */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      border: "1px solid rgba(201,201,201,0.4)",
                      color: "#C9C9C9",
                      backgroundColor: "rgba(201,201,201,0.06)",
                    }}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {userId && (
                  <Link
                    href="/wishlist"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all hover:text-[#C9C9C9]"
                    style={{ color: "#9A9A9A" }}
                  >
                    <Heart className="h-4 w-4" style={{ color: "#C9C9C9" }} />
                    <span>Wishlist</span>
                  </Link>
                )}

                {userId ? (
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all hover:text-[#C9C9C9]"
                    style={{ color: "#9A9A9A" }}
                  >
                    <User className="h-4 w-4" style={{ color: "#C9C9C9" }} />
                    <span>My Account</span>
                  </Link>
                ) : (
                  <Link
                    href="/sign-in"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-semibold tracking-widest uppercase w-full transition-all hover:bg-[#E8E8E8]"
                    style={{ backgroundColor: "#C9C9C9", color: "#0A0A0A" }}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
