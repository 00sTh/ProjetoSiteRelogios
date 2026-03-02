import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/constants";
import { Package, ShoppingCart, DollarSign, Users, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Dashboard" };

export default async function AdminDashboard() {
  const [totalProducts, totalOrders, totalRevenue, recentOrders, totalUsers] =
    await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
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
    ]);

  const revenue = totalRevenue._sum.price ?? 0;

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
          style={{ color: "#F5F0E6" }}
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
              backgroundColor: "#0F2E1E",
              border: "1px solid rgba(201,162,39,0.15)",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(201,162,39,0.1)" }}
              >
                <Icon className="h-5 w-5" style={{ color: "#C9A227" }} />
              </div>
              <ArrowRight
                className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "#C9A227" }}
              />
            </div>
            <p
              className="text-2xl font-bold font-serif"
              style={{ color: gold ? "#C9A227" : "#F5F0E6" }}
            >
              {value}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(200,187,168,0.6)" }}>
              {label}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(201,162,39,0.15)" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            backgroundColor: "#0F2E1E",
            borderColor: "rgba(201,162,39,0.1)",
          }}
        >
          <h2 className="font-semibold text-sm" style={{ color: "#F5F0E6" }}>
            Pedidos recentes
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-medium"
            style={{ color: "#C9A227" }}
          >
            Ver todos →
          </Link>
        </div>

        <div style={{ backgroundColor: "#0A2419" }}>
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
                <tr style={{ borderBottom: "1px solid rgba(201,162,39,0.08)" }}>
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
                    style={{ borderBottom: "1px solid rgba(201,162,39,0.06)" }}
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-xs hover:text-[#C9A227] transition-colors"
                        style={{ color: "rgba(200,187,168,0.7)" }}
                      >
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: "#C8BBA8" }}
                    >
                      {order.userProfile?.email ?? order.customerEmail ?? "Guest"}
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: "#C8BBA8" }}
                    >
                      {order.items.reduce((a, i) => a + i.quantity, 0)}
                    </td>
                    <td
                      className="px-6 py-4 font-semibold"
                      style={{ color: "#C9A227" }}
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
  const c = colors[status] ?? { bg: "rgba(200,187,168,0.1)", text: "#C8BBA8" };
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
