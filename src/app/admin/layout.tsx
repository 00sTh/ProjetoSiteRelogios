import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Mail,
  Image,
  Tag,
  ChevronRight,
  AlertTriangle,
  Users,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produtos", icon: Package },
  { href: "/admin/categories", label: "Categorias", icon: Tag },
  { href: "/admin/media", label: "Mídia", icon: Image },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/settings", label: "Configurações", icon: Settings },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/logs", label: "Logs de Erro", icon: AlertTriangle },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await getServerAuth();
  if (!userId) redirect("/sign-in?redirect_url=/admin");
  const role = sessionClaims?.metadata?.role;
  if (role !== "admin") redirect("/acesso-negado");

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "#061A12" }}
    >
      {/* Sidebar */}
      <aside
        className="w-60 shrink-0 flex flex-col border-r py-8 px-4"
        style={{
          backgroundColor: "#0A2419",
          borderColor: "rgba(201,162,39,0.15)",
        }}
      >
        {/* Logo */}
        <div className="mb-8 px-2">
          <Link href="/" className="flex flex-col">
            <span
              className="font-serif text-xl font-bold tracking-[0.12em] uppercase"
              style={{ color: "#C9A227" }}
            >
              {APP_NAME}
            </span>
            <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(200,187,168,0.5)" }}>
              Admin Panel
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
              style={{ color: "#C8BBA8" }}
            >
              <Icon
                className="h-4 w-4 shrink-0 transition-colors"
                style={{ color: "rgba(201,162,39,0.6)" }}
              />
              <span className="group-hover:text-[#C9A227] transition-colors">
                {label}
              </span>
              <ChevronRight
                className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "#C9A227" }}
              />
            </Link>
          ))}
        </nav>

        {/* Bottom link */}
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs mt-4 rounded-lg"
          style={{ color: "rgba(200,187,168,0.5)" }}
        >
          ← Ver site
        </Link>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
