import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/marcas", label: "Marcas" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/pedidos", label: "Pedidos" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminId = await requireAdmin();
  if (!adminId) redirect("/sign-in");
  return (
    <div className="flex min-h-screen">
      <aside className="w-52 flex-shrink-0 p-6 flex flex-col gap-1" style={{ backgroundColor: "#0D0B0B" }}>
        <p className="font-serif text-lg tracking-widest text-white mb-6">SLC<span className="text-xs ml-2 opacity-40">admin</span></p>
        {nav.map(n => <Link key={n.href} href={n.href} className="label-slc py-2 px-3 rounded hover:bg-white/10 transition-colors" style={{ color: "rgba(247,244,238,0.6)" }}>{n.label}</Link>)}
      </aside>
      <main className="flex-1 p-8" style={{ backgroundColor: "#F7F4EE" }}>{children}</main>
    </div>
  );
}
