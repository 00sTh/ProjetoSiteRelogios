import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

const navLinks = [
  { href: "/products", label: "Collections" },
  { href: "/products?category=relogios", label: "Watches" },
  { href: "/products?category=oculos", label: "Sunglasses" },
  { href: "/products?category=bolsas", label: "Bags" },
  { href: "/sobre-nos", label: "About" },
  { href: "/politica-de-privacidade", label: "Privacy" },
];

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(0,0,0,0.08)",
        padding: "3rem 1.5rem",
        backgroundColor: "#FAFAFA",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">

        {/* Left */}
        <div>
          <Link
            href="/"
            style={{
              display: "block",
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "0.875rem",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: "#0A0A0A",
              textDecoration: "none",
            }}
          >
            {APP_NAME}
          </Link>
          <p
            style={{
              fontSize: "9px",
              color: "#ABABAB",
              marginTop: "0.5rem",
              letterSpacing: "0.04em",
            }}
          >
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>

        {/* Right — nav */}
        <nav className="flex flex-wrap gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition-colors duration-200 hover:text-[#0A0A0A]"
              style={{
                fontSize: "9px",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "#ABABAB",
                textDecoration: "none",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
