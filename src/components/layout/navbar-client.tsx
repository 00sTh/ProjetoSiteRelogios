"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { APP_NAME } from "@/lib/constants";

interface NavbarClientProps {
  userId: string | null;
  isAdmin: boolean;
  cartCount: number;
  siteLogoUrl: string | null;
}

export function NavbarClient({ userId, isAdmin, cartCount, siteLogoUrl }: NavbarClientProps) {
  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: "#FAFAFA",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div className="relative flex h-16 items-center px-6 max-w-7xl mx-auto">

        {/* Logo — left */}
        <Link href="/" className="select-none" aria-label="Go to home">
          {siteLogoUrl ? (
            <Image
              src={siteLogoUrl}
              alt={APP_NAME}
              width={120}
              height={36}
              className="object-contain h-6 w-auto"
              priority
            />
          ) : (
            <span
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "0.875rem",
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                color: "#0A0A0A",
              }}
            >
              {APP_NAME}
            </span>
          )}
        </Link>

        {/* Right — cart + hamburger */}
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex items-center justify-center w-9 h-9 transition-colors duration-200 hover:text-[#0A0A0A]"
            style={{ color: "#6A6A6A" }}
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center text-[9px] font-bold"
                style={{ backgroundColor: "#0A0A0A", color: "#FAFAFA" }}
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          <MobileNav userId={userId} isAdmin={isAdmin} cartCount={cartCount} />
        </div>
      </div>
    </header>
  );
}
