import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { User, Package, MessageCircle, CheckCircle, Clock, Truck, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerAuth, getServerUser } from "@/lib/auth";
import { getSiteSettings } from "@/actions/admin";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Minha conta",
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Aguardando pagamento", color: "#C9A227", icon: Clock },
  PAID: { label: "Pago", color: "#4ADE80", icon: CheckCircle },
  SHIPPED: { label: "Enviado", color: "#60A5FA", icon: Truck },
  DELIVERED: { label: "Entregue", color: "#4ADE80", icon: CheckCircle },
  CANCELLED: { label: "Cancelado", color: "#F87171", icon: XCircle },
};

export default async function AccountPage() {
  const { userId } = await getServerAuth();
  if (!userId) redirect("/sign-in");

  const [clerkUser, settings] = await Promise.all([
    getServerUser(),
    getSiteSettings(),
  ]);

  const profile = await prisma.userProfile.upsert({
    where: { clerkId: userId },
    update: {},
    create: {
      clerkId: userId,
      email: clerkUser?.emailAddresses[0]?.emailAddress ?? "",
      firstName: clerkUser?.firstName ?? null,
      lastName: clerkUser?.lastName ?? null,
      avatarUrl: clerkUser?.imageUrl ?? null,
    },
  });

  const orders = await prisma.order.findMany({
    where: { userProfileId: profile.id },
    include: {
      items: { include: { product: { select: { name: true, images: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
  const firstName = clerkUser?.firstName ?? "Cliente";

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "#0A3D2F" }}>
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div
          className="rounded-2xl p-6 mb-8 flex items-center gap-4"
          style={{ backgroundColor: "#0F4A37", border: "1px solid rgba(201,162,39,0.2)" }}
        >
          <div
            className="h-14 w-14 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(201,162,39,0.12)", border: "1px solid rgba(201,162,39,0.25)" }}
          >
            {clerkUser?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clerkUser.imageUrl}
                alt={firstName}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <User className="h-7 w-7" style={{ color: "#C9A227" }} />
            )}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold" style={{ color: "#F5F0E6" }}>
              Olá, {firstName}!
            </h1>
            <p className="text-sm" style={{ color: "rgba(200,187,168,0.6)" }}>
              {email}
            </p>
          </div>
        </div>

        {/* Orders */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Package className="h-5 w-5" style={{ color: "#C9A227" }} />
            <h2 className="font-serif text-xl font-semibold" style={{ color: "#F5F0E6" }}>
              Meus Pedidos
            </h2>
            <span
              className="ml-1 px-2 py-0.5 rounded-full text-xs"
              style={{ backgroundColor: "rgba(201,162,39,0.12)", color: "#C9A227" }}
            >
              {orders.length}
            </span>
          </div>

          {orders.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ backgroundColor: "#0F4A37", border: "1px solid rgba(201,162,39,0.15)" }}
            >
              <Package className="h-10 w-10 mx-auto mb-3" style={{ color: "rgba(201,162,39,0.3)" }} />
              <p className="font-medium" style={{ color: "#C8BBA8" }}>
                Você ainda não fez nenhum pedido.
              </p>
              <Link
                href="/products"
                className="inline-block mt-4 px-6 py-2.5 rounded-full text-sm font-semibold"
                style={{ backgroundColor: "#C9A227", color: "#0A3D2F" }}
              >
                Explorar produtos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const cfg = statusConfig[order.status] ?? statusConfig.PENDING;
                const StatusIcon = cfg.icon;
                const isPending = order.status === "PENDING";
                const isWhatsApp = order.paymentMethod === "WHATSAPP" || !order.paymentMethod;
                const orderTotal = order.items.reduce(
                  (acc, i) => acc + Number(i.price) * i.quantity,
                  0
                );

                // WhatsApp message for PENDING WhatsApp orders
                let whatsappUrl = "";
                if (isPending && isWhatsApp) {
                  const itemsList = order.items
                    .map((i) => `• ${i.product.name} × ${i.quantity}`)
                    .join("\n");
                  const msg = encodeURIComponent(
                    `Olá! Quero continuar meu pedido na Althéia.\n\n` +
                    `📦 Pedido: #${order.id.slice(0, 8).toUpperCase()}\n\n` +
                    `Itens:\n${itemsList}\n\n` +
                    `Total: ${formatPrice(orderTotal)}\n\n` +
                    `Poderia me ajudar a finalizar o pagamento?`
                  );
                  whatsappUrl = `https://wa.me/${settings?.whatsappNumber ?? ""}?text=${msg}`;
                }

                return (
                  <div
                    key={order.id}
                    className="rounded-2xl p-5 space-y-4"
                    style={{
                      backgroundColor: "#0F4A37",
                      border: "1px solid rgba(201,162,39,0.15)",
                    }}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs mb-1" style={{ color: "rgba(200,187,168,0.5)" }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs" style={{ color: "rgba(200,187,168,0.5)" }}>
                          {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
                            new Date(order.createdAt)
                          )}
                        </p>
                      </div>
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0"
                        style={{
                          backgroundColor: `${cfg.color}18`,
                          border: `1px solid ${cfg.color}40`,
                          color: cfg.color,
                        }}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </div>
                    </div>

                    {/* Products */}
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span style={{ color: "#C8BBA8" }}>
                            {item.product.name} × {item.quantity}
                          </span>
                          <span style={{ color: "#F5F0E6" }}>
                            {formatPrice(Number(item.price) * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total + CTA */}
                    <div
                      className="flex items-center justify-between pt-3"
                      style={{ borderTop: "1px solid rgba(201,162,39,0.1)" }}
                    >
                      <div>
                        <p className="text-xs" style={{ color: "rgba(200,187,168,0.5)" }}>Total</p>
                        <p className="font-bold" style={{ color: "#C9A227" }}>
                          {formatPrice(orderTotal)}
                        </p>
                      </div>

                      {isPending && isWhatsApp && whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: "#25D366", color: "#fff" }}
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          Finalizar via WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
