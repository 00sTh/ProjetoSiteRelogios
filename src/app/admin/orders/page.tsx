import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Admin — Pedidos" };

interface Props {
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 20;

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      take: PAGE_SIZE,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        userProfile: { select: { email: true, firstName: true } },
        items: { select: { quantity: true } },
      },
    }),
    prisma.order.count(),
  ]);

  const pages = Math.ceil(total / PAGE_SIZE);

  const statusColors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: "rgba(234,179,8,0.15)", text: "#EAB308" },
    PAID: { bg: "rgba(59,130,246,0.15)", text: "#60A5FA" },
    SHIPPED: { bg: "rgba(168,85,247,0.15)", text: "#C084FC" },
    DELIVERED: { bg: "rgba(34,197,94,0.15)", text: "#4ADE80" },
    CANCELLED: { bg: "rgba(239,68,68,0.15)", text: "#F87171" },
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold" style={{ color: "#F5F0E6" }}>
          Pedidos
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(200,187,168,0.6)" }}>
          {total} pedido{total !== 1 ? "s" : ""} no total
        </p>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(201,162,39,0.15)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                backgroundColor: "#0F2E1E",
                borderBottom: "1px solid rgba(201,162,39,0.1)",
              }}
            >
              {["Pedido", "Cliente", "Gateway", "Itens", "Total", "Status", "Data", ""].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold tracking-wider uppercase"
                  style={{ color: "rgba(200,187,168,0.4)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: "#0A2419" }}>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-12 text-center text-sm"
                  style={{ color: "rgba(200,187,168,0.4)" }}
                >
                  Nenhum pedido ainda.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const c =
                  statusColors[order.status] ?? {
                    bg: "rgba(200,187,168,0.1)",
                    text: "#C8BBA8",
                  };
                const label =
                  ORDER_STATUS_LABEL[
                    order.status as keyof typeof ORDER_STATUS_LABEL
                  ] ?? order.status;
                const totalItems = order.items.reduce(
                  (a, i) => a + i.quantity,
                  0
                );
                return (
                  <tr
                    key={order.id}
                    style={{ borderBottom: "1px solid rgba(201,162,39,0.06)" }}
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-xs hover:text-[#C9A227] transition-colors"
                        style={{ color: "rgba(200,187,168,0.7)" }}
                      >
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-5 py-4" style={{ color: "#C8BBA8" }}>
                      <div>
                        <p className="text-sm">
                          {order.userProfile?.email ?? order.customerEmail ?? "Guest"}
                        </p>
                        {(order.userProfile?.firstName ?? order.customerName) && (
                          <p className="text-xs" style={{ color: "rgba(200,187,168,0.5)" }}>
                            {order.userProfile?.firstName ?? order.customerName}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {order.gateway ? (
                        <span
                          className="text-xs font-mono px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: order.gateway === "REDE" ? "rgba(249,115,22,0.15)" : "rgba(59,130,246,0.15)",
                            color: order.gateway === "REDE" ? "#FB923C" : "#60A5FA",
                          }}
                        >
                          {order.gateway}
                        </span>
                      ) : (
                        <span style={{ color: "rgba(200,187,168,0.3)" }}>—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "#C8BBA8" }}>
                      {totalItems}
                    </td>
                    <td className="px-5 py-4 font-semibold" style={{ color: "#C9A227" }}>
                      {formatPrice(Number(order.price))}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: c.bg, color: c.text }}
                      >
                        {label}
                      </span>
                    </td>
                    <td
                      className="px-5 py-4 text-xs"
                      style={{ color: "rgba(200,187,168,0.5)" }}
                    >
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-xs font-medium transition-colors hover:text-[#C9A227]"
                        style={{ color: "rgba(200,187,168,0.6)" }}
                      >
                        Detalhes →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/orders?page=${p}`}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all"
              style={
                p === page
                  ? { backgroundColor: "#C9A227", color: "#0A3D2F" }
                  : {
                      backgroundColor: "rgba(201,162,39,0.1)",
                      color: "#C8BBA8",
                      border: "1px solid rgba(201,162,39,0.2)",
                    }
              }
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
