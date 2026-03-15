"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, Heart, LayoutDashboard, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileNav } from "./mobile-nav";
import { SignOutButton } from "@clerk/nextjs";
import { APP_NAME } from "@/lib/constants";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Collections" },
  { href: "/products?category=watches", label: "Watches" },
  { href: "/products?category=sunglasses", label: "Sunglasses" },
  { href: "/about", label: "About" },
];

interface NavbarClientProps {
  userId: string | null;
  isAdmin: boolean;
  cartCount: number;
  siteLogoUrl: string | null;
}

export function NavbarClient({ userId, isAdmin, cartCount, siteLogoUrl }: NavbarClientProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all duration-500"
      style={{
        backgroundColor: scrolled ? "rgba(10,10,10,0.97)" : "rgba(10,10,10,0.18)",
        backdropFilter: "blur(14px)",
        borderBottom: scrolled
          ? "1px solid rgba(201,201,201,0.25)"
          : "1px solid rgba(201,201,201,0.08)",
        boxShadow: "0 4px 30px rgba(201,201,201,0.08)",
      }}
    >
      <div className="relative container mx-auto flex h-20 items-center px-6 max-w-7xl">

        {/* Left — desktop nav links */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="relative text-base font-semibold tracking-wider uppercase transition-colors duration-200 group pb-0.5"
              style={{ color: "#9A9A9A", fontSize: "0.72rem", letterSpacing: "0.14em" }}
            >
              <span className="group-hover:text-[#C9C9C9] transition-colors duration-200">
                {label}
              </span>
              <span
                className="absolute bottom-0 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                style={{ backgroundColor: "#C9C9C9" }}
              />
            </Link>
          ))}
        </nav>

        {/* Center — logo (absolute) */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 select-none max-w-[40%] sm:max-w-[50%] md:max-w-none"
          aria-label="Go to home"
        >
          {siteLogoUrl ? (
            <Image
              src={siteLogoUrl}
              alt={APP_NAME}
              width={140}
              height={42}
              className="object-contain h-7 w-auto sm:h-8 md:h-10"
              priority
            />
          ) : (
            <span
              className="font-serif font-bold tracking-[0.3em] uppercase transition-colors duration-300 hover:text-[#C9C9C9]"
              style={{
                color: "#F5F5F5",
                fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
                textShadow: "0 0 30px rgba(201,201,201,0.15)",
              }}
            >
              {APP_NAME}
            </span>
          )}
        </Link>

        {/* Right — action icons */}
        <div className="ml-auto flex items-center gap-1">
          {/* Wishlist (logged in only, hidden on mobile — covered by MobileNav) */}
          {userId && (
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="group hidden sm:flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200"
              style={{ color: "#9A9A9A" }}
            >
              <Heart
                className="h-5 w-5 transition-all duration-200 group-hover:text-[#C9C9C9] group-hover:drop-shadow-[0_0_8px_rgba(201,201,201,0.6)]"
              />
            </Link>
          )}

          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="group relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200"
            style={{ color: "#9A9A9A" }}
          >
            <ShoppingCart
              className="h-5 w-5 transition-all duration-200 group-hover:text-[#C9C9C9] group-hover:drop-shadow-[0_0_8px_rgba(201,201,201,0.6)]"
            />
            {cartCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                style={{ backgroundColor: "#C9C9C9", color: "#0A0A0A" }}
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {/* Admin panel (admins only, desktop) */}
          {isAdmin && (
            <Link
              href="/admin"
              aria-label="Admin Panel"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 hover:shadow-[0_0_14px_rgba(201,201,201,0.35)]"
              style={{
                border: "1px solid rgba(201,201,201,0.5)",
                color: "#C9C9C9",
              }}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}

          {/* Account (desktop) */}
          <Link
            href={userId ? "/account" : "/sign-in"}
            aria-label="Account"
            className="group hidden md:flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200"
            style={{ color: "#9A9A9A" }}
          >
            <User
              className="h-5 w-5 transition-all duration-200 group-hover:text-[#C9C9C9] group-hover:drop-shadow-[0_0_8px_rgba(201,201,201,0.6)]"
            />
          </Link>

          {/* Logout */}
          {userId && (
            <SignOutButton>
              <button
                title="Sign out"
                className="flex items-center justify-center h-9 w-9 rounded-full transition-all"
                style={{
                  backgroundColor: "rgba(224,82,82,0.1)",
                  border: "1px solid rgba(224,82,82,0.2)",
                  color: "rgba(224,82,82,0.8)",
                }}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </SignOutButton>
          )}

          {/* Mobile hamburger */}
          <MobileNav userId={userId} isAdmin={isAdmin} cartCount={cartCount} />
        </div>
      </div>
    </header>
  );
}
