import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/constants";
import { OrderStatusForm } from "@/components/admin/order-status-form";

export const metadata: Metadata = { title: "Admin — Pedido" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderPage({ params }: Props) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      userProfile: true,
      items: { include: { product: { select: { name: true, images: true, slug: true } } } },
    },
  });

  if (!order) notFound();

  const statusColors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: "rgba(234,179,8,0.15)", text: "#EAB308" },
    PAID: { bg: "rgba(59,130,246,0.15)", text: "#60A5FA" },
    SHIPPED: { bg: "rgba(168,85,247,0.15)", text: "#C084FC" },
    DELIVERED: { bg: "rgba(34,197,94,0.15)", text: "#4ADE80" },
    CANCELLED: { bg: "rgba(239,68,68,0.15)", text: "#F87171" },
  };
  const c = statusColors[order.status] ?? { bg: "rgba(200,187,168,0.1)", text: "#C8BBA8" };
  const label = ORDER_STATUS_LABEL[order.status as keyof typeof ORDER_STATUS_LABEL] ?? order.status;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs mb-4" style={{ color: "rgba(200,187,168,0.5)" }}>
          <Link href="/admin/orders" className="hover:text-[#C9A227] transition-colors">
            Pedidos
          </Link>
          <span>/</span>
          <span style={{ color: "#C9A227" }}>#{order.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-3xl font-bold" style={{ color: "#F5F0E6" }}>
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <span
            className="text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ backgroundColor: c.bg, color: c.text }}
          >
            {label}
          </span>
        </div>
        <p className="text-sm mt-1" style={{ color: "rgba(200,187,168,0.5)" }}>
          {new Date(order.createdAt).toLocaleDateString("pt-BR", {
            year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(201,162,39,0.15)" }}
          >
            <div
              className="px-5 py-4 border-b"
              style={{ backgroundColor: "#0F2E1E", borderColor: "rgba(201,162,39,0.1)" }}
            >
              <h2 className="font-semibold text-sm" style={{ color: "#F5F0E6" }}>
                Itens do pedido
              </h2>
            </div>
            <div style={{ backgroundColor: "#0A2419" }}>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-5 py-4"
                  style={{ borderBottom: "1px solid rgba(201,162,39,0.06)" }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: "#F5F0E6" }}>
                      {item.product.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(200,187,168,0.5)" }}>
                      Qtd: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: "#C9A227" }}>
                      {formatPrice(Number(item.price) * item.quantity)}
                    </p>
                    <p className="text-xs" style={{ color: "rgba(200,187,168,0.5)" }}>
                      {formatPrice(Number(item.price))} cada
                    </p>
                  </div>
                </div>
              ))}
              <div
                className="px-5 py-4 flex justify-between items-center"
                style={{ borderTop: "1px solid rgba(201,162,39,0.15)" }}
              >
                <span className="text-sm font-semibold" style={{ color: "#C8BBA8" }}>Total</span>
                <span className="text-xl font-bold font-serif" style={{ color: "#C9A227" }}>
                  {formatPrice(Number(order.price))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Customer info */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: "#0A2419", border: "1px solid rgba(201,162,39,0.15)" }}
          >
            <h2 className="font-semibold text-sm mb-4" style={{ color: "#F5F0E6" }}>
              Cliente
            </h2>
            <div className="space-y-2 text-sm" style={{ color: "#C8BBA8" }}>
              <p>
                {order.userProfile?.firstName ?? order.customerName ?? "—"}{" "}
                {order.userProfile?.lastName ?? ""}
              </p>
              <p className="text-xs" style={{ color: "rgba(200,187,168,0.6)" }}>
                {order.userProfile?.email ?? order.customerEmail ?? "Guest"}
              </p>
            </div>
          </div>

          {/* Payment */}
          {(order.cieloPaymentId || order.redePaymentId || order.gateway) && (
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#0A2419", border: "1px solid rgba(201,162,39,0.15)" }}
            >
              <h2 className="font-semibold text-sm mb-4" style={{ color: "#F5F0E6" }}>
                Pagamento{order.gateway ? ` — ${order.gateway}` : ""}
              </h2>
              <div className="space-y-2 text-xs" style={{ color: "rgba(200,187,168,0.6)" }}>
                {order.cieloPaymentId && (
                  <div>
                    <p className="uppercase tracking-wider mb-0.5" style={{ color: "rgba(200,187,168,0.4)", fontSize: "10px" }}>Cielo PaymentId</p>
                    <p className="font-mono truncate">{order.cieloPaymentId}</p>
                  </div>
                )}
                {order.redePaymentId && (
                  <div>
                    <p className="uppercase tracking-wider mb-0.5" style={{ color: "rgba(200,187,168,0.4)", fontSize: "10px" }}>Rede TID</p>
                    <p className="font-mono truncate">{order.redePaymentId}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status update */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: "#0A2419", border: "1px solid rgba(201,162,39,0.15)" }}
          >
            <h2 className="font-semibold text-sm mb-4" style={{ color: "#F5F0E6" }}>
              Atualizar status
            </h2>
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
