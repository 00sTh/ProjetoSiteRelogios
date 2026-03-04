import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUser } from "@/actions/users";
import { UserRoleButton, UserDeleteButton } from "@/components/admin/user-actions";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/constants";
import { ArrowLeft, Mail, Calendar, ShoppingBag, DollarSign } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Detalhe do Usuário" };

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAdminUser(id);
  if (!user) notFound();

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";
  const totalSpent = user.orders.reduce((acc, o) => acc + Number(o.price), 0);
  const paidOrders = user.orders.filter((o) => o.status === "PAID" || o.status === "DELIVERED" || o.status === "SHIPPED");
  const isAdmin = (user as { role?: string }).role === "admin";

  const statusColors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: "rgba(234,179,8,0.15)", text: "#EAB308" },
    PAID: { bg: "rgba(59,130,246,0.15)", text: "#60A5FA" },
    SHIPPED: { bg: "rgba(168,85,247,0.15)", text: "#C084FC" },
    DELIVERED: { bg: "rgba(34,197,94,0.15)", text: "#4ADE80" },
    CANCELLED: { bg: "rgba(239,68,68,0.15)", text: "#F87171" },
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm mb-4 transition-colors"
          style={{ color: "rgba(200,187,168,0.5)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar aos usuários
        </Link>

        <div className="flex items-start gap-4">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center shrink-0 text-xl font-bold"
              style={{ backgroundColor: "rgba(212,175,55,0.15)", color: "#D4AF37" }}
            >
              {(user.firstName?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-serif text-3xl font-bold" style={{ color: "#F5F5F5" }}>
              {fullName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="h-3.5 w-3.5" style={{ color: "rgba(212,175,55,0.5)" }} />
              <span className="text-sm" style={{ color: "rgba(200,187,168,0.7)" }}>
                {user.email}
              </span>
              {isAdmin && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: "rgba(212,175,55,0.15)", color: "#D4AF37" }}
                >
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats + Actions */}
        <div className="flex flex-col gap-4">
          {/* Stats cards */}
          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: "#0F2E1E",
              border: "1px solid rgba(212,175,55,0.15)",
            }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "rgba(200,187,168,0.4)" }}>
              Resumo
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" style={{ color: "rgba(212,175,55,0.5)" }} />
                  <span className="text-sm" style={{ color: "rgba(200,187,168,0.7)" }}>Cadastro</span>
                </div>
                <span className="text-sm font-medium" style={{ color: "#F5F5F5" }}>
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" style={{ color: "rgba(212,175,55,0.5)" }} />
                  <span className="text-sm" style={{ color: "rgba(200,187,168,0.7)" }}>Total pedidos</span>
                </div>
                <span className="text-sm font-medium" style={{ color: "#F5F5F5" }}>
                  {user.orders.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" style={{ color: "rgba(212,175,55,0.5)" }} />
                  <span className="text-sm" style={{ color: "rgba(200,187,168,0.7)" }}>Total gasto</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: "#D4AF37" }}>
                  {totalSpent > 0 ? formatPrice(totalSpent) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "rgba(200,187,168,0.7)" }}>Pedidos pagos</span>
                <span className="text-sm font-medium" style={{ color: "#F5F5F5" }}>
                  {paidOrders.length}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: "#0F2E1E",
              border: "1px solid rgba(212,175,55,0.15)",
            }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "rgba(200,187,168,0.4)" }}>
              Ações
            </h2>
            <div className="flex flex-col gap-3">
              <UserRoleButton
                userId={user.id}
                clerkId={user.clerkId}
                isCurrentAdmin={isAdmin}
              />
              <UserDeleteButton userId={user.id} />
            </div>
          </div>
        </div>

        {/* Orders list */}
        <div className="lg:col-span-2">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(212,175,55,0.15)" }}
          >
            <div
              className="px-6 py-4 border-b"
              style={{ backgroundColor: "#0F2E1E", borderColor: "rgba(212,175,55,0.1)" }}
            >
              <h2 className="font-semibold text-sm" style={{ color: "#F5F5F5" }}>
                Histórico de pedidos
              </h2>
            </div>

            {user.orders.length === 0 ? (
              <div
                className="flex items-center justify-center py-12"
                style={{ backgroundColor: "#0A2419" }}
              >
                <p className="text-sm" style={{ color: "rgba(200,187,168,0.4)" }}>
                  Nenhum pedido ainda.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm" style={{ backgroundColor: "#0A2419" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                    {["Pedido", "Itens", "Total", "Status"].map((h) => (
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
                  {user.orders.map((order) => {
                    const c = statusColors[order.status] ?? { bg: "rgba(200,187,168,0.1)", text: "#9A9A9A" };
                    const label = ORDER_STATUS_LABEL[order.status as keyof typeof ORDER_STATUS_LABEL] ?? order.status;
                    const itemCount = order.items.reduce((a, i) => a + i.quantity, 0);
                    return (
                      <tr
                        key={order.id}
                        className="transition-colors"
                        style={{ borderBottom: "1px solid rgba(212,175,55,0.06)" }}
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-mono text-xs hover:text-[#D4AF37] transition-colors"
                            style={{ color: "rgba(200,187,168,0.7)" }}
                          >
                            #{order.id.slice(0, 8).toUpperCase()}
                          </Link>
                          <p className="text-xs mt-0.5" style={{ color: "rgba(200,187,168,0.4)" }}>
                            {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </td>
                        <td className="px-6 py-4" style={{ color: "#9A9A9A" }}>
                          {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </td>
                        <td className="px-6 py-4 font-semibold" style={{ color: "#D4AF37" }}>
                          {formatPrice(Number(order.price))}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: c.bg, color: c.text }}
                          >
                            {label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
