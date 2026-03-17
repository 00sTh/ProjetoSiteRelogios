import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/constants";
import { Package, ShoppingCart, DollarSign, Users, ArrowRight, CreditCard } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Dashboard" };

export default async function AdminDashboard() {
  const PAID_STATUSES = ["PAID", "SHIPPED", "DELIVERED"] as ("PAID" | "SHIPPED" | "DELIVERED")[];

  const [totalProducts, totalOrders, totalRevenue, recentOrders, totalUsers, cieloStats, redeStats] =
    await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: { in: PAID_STATUSES } },
        _sum: { price: true },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          userProfile: { select: { email: true } },
          items: { select: { quantity: true } },
        },
      }),
      prisma.userProfile.count(),
      // Receita Cielo (crédito + PIX + legado sem gateway definido)
      prisma.order.aggregate({
        where: {
          status: { in: PAID_STATUSES },
          OR: [{ gateway: "CIELO" }, { gateway: null }],
        },
        _sum: { price: true },
        _count: { _all: true },
      }),
      // Receita Rede (crédito via Rede)
      prisma.order.aggregate({
        where: { status: { in: PAID_STATUSES }, gateway: "REDE" },
        _sum: { price: true },
        _count: { _all: true },
      }),
    ]);

  const revenue = Number(totalRevenue._sum?.price ?? 0);
  const cieloRevenue = Number(cieloStats._sum?.price ?? 0);
  const redeRevenue = Number(redeStats._sum?.price ?? 0);
  const gatewayTotal = cieloRevenue + redeRevenue;
  const cieloPct = gatewayTotal > 0 ? Math.round((cieloRevenue / gatewayTotal) * 100) : 0;
  const redePct = gatewayTotal > 0 ? Math.round((redeRevenue / gatewayTotal) * 100) : 0;

  const metrics = [
    {
      label: "Produtos ativos",
      value: totalProducts,
      icon: Package,
      href: "/admin/products",
    },
    {
      label: "Total de pedidos",
      value: totalOrders,
      icon: ShoppingCart,
      href: "/admin/orders",
    },
    {
      label: "Receita confirmada",
      value: formatPrice(Number(revenue)),
      icon: DollarSign,
      gold: true,
      href: "/admin/orders",
    },
    {
      label: "Clientes cadastrados",
      value: totalUsers,
      icon: Users,
      href: "/admin/users",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1
          className="font-serif text-3xl font-bold"
          style={{ color: "#F5F5F5" }}
        >
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(200,187,168,0.6)" }}>
          Visão geral do seu e-commerce
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {metrics.map(({ label, value, icon: Icon, gold, href }) => (
          <Link
            key={label}
            href={href}
            className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: "#1A1A1A",
              border: "1px solid rgba(201,201,201,0.15)",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(201,201,201,0.1)" }}
              >
                <Icon className="h-5 w-5" style={{ color: "#C9C9C9" }} />
              </div>
              <ArrowRight
                className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "#C9C9C9" }}
              />
            </div>
            <p
              className="text-2xl font-bold font-serif"
              style={{ color: gold ? "#C9C9C9" : "#F5F5F5" }}
            >
              {value}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(200,187,168,0.6)" }}>
              {label}
            </p>
          </Link>
        ))}
      </div>

      {/* Gateway revenue split */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: "#1A1A1A", border: "1px solid rgba(201,201,201,0.15)" }}
      >
        <div className="flex items-center gap-2 mb-5">
          <CreditCard className="h-4 w-4" style={{ color: "#C9C9C9" }} />
          <h2 className="font-semibold text-sm" style={{ color: "#F5F5F5" }}>
            Receita por Gateway
          </h2>
          <span className="text-xs ml-auto" style={{ color: "rgba(200,187,168,0.4)" }}>
            pedidos confirmados
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Cielo */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: "#141414", border: "1px solid rgba(201,201,201,0.1)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(200,187,168,0.5)" }}>
              Cielo
            </p>
            <p className="text-xl font-bold font-serif" style={{ color: "#C9C9C9" }}>
              {formatPrice(cieloRevenue)}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(200,187,168,0.4)" }}>
              {cieloStats._count._all} pedido{cieloStats._count._all !== 1 ? "s" : ""} · {cieloPct}%
            </p>
          </div>

          {/* Rede */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: "#141414", border: "1px solid rgba(201,201,201,0.1)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(200,187,168,0.5)" }}>
              Rede
            </p>
            <p className="text-xl font-bold font-serif" style={{ color: "#C9C9C9" }}>
              {formatPrice(redeRevenue)}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(200,187,168,0.4)" }}>
              {redeStats._count._all} pedido{redeStats._count._all !== 1 ? "s" : ""} · {redePct}%
            </p>
          </div>
        </div>

        {/* Barra de proporção */}
        {gatewayTotal > 0 && (
          <div className="space-y-1.5">
            <div className="flex rounded-full overflow-hidden h-2" style={{ backgroundColor: "rgba(200,187,168,0.08)" }}>
              <div
                className="h-full transition-all"
                style={{ width: `${cieloPct}%`, backgroundColor: "#C9C9C9" }}
              />
              <div
                className="h-full transition-all"
                style={{ width: `${redePct}%`, backgroundColor: "rgba(201,201,201,0.35)" }}
              />
            </div>
            <div className="flex justify-between text-xs" style={{ color: "rgba(200,187,168,0.35)" }}>
              <span>■ Cielo</span>
              <span>■ Rede</span>
            </div>
          </div>
        )}

        {gatewayTotal === 0 && (
          <p className="text-xs text-center py-2" style={{ color: "rgba(200,187,168,0.3)" }}>
            Nenhum pedido confirmado ainda
          </p>
        )}
      </div>

      {/* Recent orders */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(201,201,201,0.15)" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            backgroundColor: "#1A1A1A",
            borderColor: "rgba(201,201,201,0.1)",
          }}
        >
          <h2 className="font-semibold text-sm" style={{ color: "#F5F5F5" }}>
            Pedidos recentes
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-medium"
            style={{ color: "#C9C9C9" }}
          >
            Ver todos →
          </Link>
        </div>

        <div style={{ backgroundColor: "#141414" }}>
          {recentOrders.length === 0 ? (
            <p
              className="text-center py-12 text-sm"
              style={{ color: "rgba(200,187,168,0.4)" }}
            >
              Nenhum pedido ainda.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(201,201,201,0.08)" }}>
                  {["ID", "Cliente", "Itens", "Total", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase"
                      style={{ color: "rgba(200,187,168,0.4)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid rgba(201,201,201,0.06)" }}
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-xs hover:text-[#C9C9C9] transition-colors"
                        style={{ color: "rgba(200,187,168,0.7)" }}
                      >
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: "#9A9A9A" }}
                    >
                      {order.userProfile?.email ?? order.customerEmail ?? "Guest"}
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: "#9A9A9A" }}
                    >
                      {order.items.reduce((a, i) => a + i.quantity, 0)}
                    </td>
                    <td
                      className="px-6 py-4 font-semibold"
                      style={{ color: "#C9C9C9" }}
                    >
                      {formatPrice(Number(order.price))}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: "rgba(234,179,8,0.15)", text: "#EAB308" },
    PAID: { bg: "rgba(59,130,246,0.15)", text: "#60A5FA" },
    SHIPPED: { bg: "rgba(168,85,247,0.15)", text: "#C084FC" },
    DELIVERED: { bg: "rgba(34,197,94,0.15)", text: "#4ADE80" },
    CANCELLED: { bg: "rgba(239,68,68,0.15)", text: "#F87171" },
  };
  const c = colors[status] ?? { bg: "rgba(200,187,168,0.1)", text: "#9A9A9A" };
  const label =
    ORDER_STATUS_LABEL[status as keyof typeof ORDER_STATUS_LABEL] ?? status;

  return (
    <span
      className="text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {label}
    </span>
  );
}
