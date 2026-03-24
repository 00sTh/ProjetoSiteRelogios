import Link from "next/link";
import { APP_FULL_NAME } from "@/lib/constants";

const categories = [
  { name: "Relógios de Luxo", href: "/relogios" },
  { name: "Perfumes", href: "/perfumes" },
  { name: "Bolsas de Luxo", href: "/bolsas" },
  { name: "Sapatos de Luxo", href: "/sapatos" },
];

const info = [
  { name: "Sobre a SLC", href: "/sobre" },
  { name: "Minha Conta", href: "/conta" },
  { name: "Wishlist", href: "/wishlist" },
  { name: "Meus Pedidos", href: "/conta" },
];

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#0D0B0B", color: "#F7F4EE" }}>
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <p className="font-serif text-2xl tracking-[0.4em] uppercase mb-3">SLC</p>
          <p className="label-slc" style={{ color: "rgba(247,244,238,0.4)" }}>{APP_FULL_NAME}</p>
          <p className="text-xs mt-4 leading-relaxed" style={{ color: "rgba(247,244,238,0.35)" }}>Objetos de Desejo.<br />Criados para Durar.</p>
        </div>
        <div>
          <p className="label-slc mb-4" style={{ color: "rgba(247,244,238,0.35)" }}>Coleções</p>
          <ul className="space-y-2">
            {categories.map(c => (
              <li key={c.href}><Link href={c.href} className="text-xs hover:opacity-100 opacity-60 transition-opacity" style={{ color: "#F7F4EE" }}>{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label-slc mb-4" style={{ color: "rgba(247,244,238,0.35)" }}>Informações</p>
          <ul className="space-y-2">
            {info.map(i => (
              <li key={i.href}><Link href={i.href} className="text-xs hover:opacity-100 opacity-60 transition-opacity" style={{ color: "#F7F4EE" }}>{i.name}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t mx-6" style={{ borderColor: "rgba(247,244,238,0.08)" }}>
        <div className="mx-auto max-w-7xl px-0 py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px]" style={{ color: "rgba(247,244,238,0.3)" }}>© {new Date().getFullYear()} SLC — S Luxury Collection. Todos os direitos reservados.</p>
          <div className="flex gap-3 items-center">
            {["VISA","MASTER","ELO","PIX"].map(b => (
              <span key={b} className="text-[8px] tracking-widest border px-2 py-0.5" style={{ color: "rgba(247,244,238,0.4)", borderColor: "rgba(247,244,238,0.15)" }}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
