import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle, MessageCircle, Package, CreditCard, QrCode } from "lucide-react";
import { getOrder } from "@/actions/orders";
import { getSiteSettings } from "@/actions/admin";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order Confirmed!",
};

interface Props {
  searchParams: Promise<{ orderId?: string; paid?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { orderId, paid } = await searchParams;

  if (!orderId) redirect("/");

  const [order, settings] = await Promise.all([
    getOrder(orderId),
    getSiteSettings(),
  ]);

  if (!order) redirect("/");

  const isPaid = paid === "1" || order.status === "PAID";
  const isWhatsApp = order.paymentMethod === "WHATSAPP" || !order.paymentMethod;
  const isCard = order.paymentMethod === "CREDIT_CARD";
  const isPix = order.paymentMethod === "PIX";

  const total = order.items.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0
  );

  let address = "";
  try {
    const addr = JSON.parse(order.shippingAddress ?? "{}");
    address = `${addr.street}, ${addr.number}${addr.complement ? ` ${addr.complement}` : ""} — ${addr.city}/${addr.state} — CEP ${addr.zip}`;
  } catch {}

  // WhatsApp message
  const itemsList = order.items
    .map((i) => `• ${i.product.name} × ${i.quantity} = ${formatPrice(Number(i.price) * i.quantity)}`)
    .join("\n");

  const whatsappMessage = encodeURIComponent(
    `Hello! I placed an order at LuxImport.\n\n` +
    `📦 Order: #${order.id.slice(0, 8).toUpperCase()}\n\n` +
    `Items:\n${itemsList}\n\n` +
    `Total: ${formatPrice(total)}\n\n` +
    `Shipping address:\n${address}\n\n` +
    (order.notes ? `Notes: ${order.notes}\n\n` : "") +
    `I'd like to arrange payment and delivery. Thank you!`
  );

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div
      className="min-h-screen py-16 px-4 flex items-start justify-center"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{
              backgroundColor: isPaid ? "rgba(74,222,128,0.1)" : "rgba(201,201,201,0.1)",
              border: `1px solid ${isPaid ? "rgba(74,222,128,0.3)" : "rgba(201,201,201,0.3)"}`,
            }}
          >
            <CheckCircle
              className="h-10 w-10"
              style={{ color: isPaid ? "#4ADE80" : "#C9C9C9" }}
            />
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3" style={{ color: "#F5F5F5" }}>
            {isPaid ? "Payment Confirmed!" : "Order Registered!"}
          </h1>
          <p className="text-base" style={{ color: "#9A9A9A" }}>
            {isPaid && isCard && "Your card was approved. Thank you for your purchase!"}
            {isPaid && isPix && "PIX payment confirmed. Thank you for your purchase!"}
            {isWhatsApp && "Your order has been created. Complete payment via WhatsApp."}
          </p>
          <div
            className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-xs"
            style={{
              backgroundColor: "rgba(201,201,201,0.08)",
              border: "1px solid rgba(201,201,201,0.2)",
              color: "rgba(200,187,168,0.6)",
            }}
          >
            {isPaid ? <CreditCard className="h-3 w-3" /> : isWhatsApp ? <MessageCircle className="h-3 w-3" /> : <QrCode className="h-3 w-3" />}
            Order #{order.id.slice(0, 8).toUpperCase()}
          </div>
        </div>

        {/* Order summary */}
        <div
          className="rounded-2xl p-6 mb-6 space-y-4"
          style={{ backgroundColor: "#111111", border: "1px solid rgba(201,201,201,0.2)" }}
        >
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" style={{ color: "#C9C9C9" }} />
            <h2 className="font-semibold text-sm uppercase tracking-widest" style={{ color: "#C9C9C9" }}>
              Order Summary
            </h2>
          </div>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm" style={{ color: "#9A9A9A" }}>
              <span>{item.product.name} × {item.quantity}</span>
              <span style={{ color: "#F5F5F5" }}>
                {formatPrice(Number(item.price) * item.quantity)}
              </span>
            </div>
          ))}
          <div
            className="pt-3 flex justify-between font-bold"
            style={{ borderTop: "1px solid rgba(201,201,201,0.15)" }}
          >
            <span style={{ color: "#F5F5F5" }}>Total</span>
            <span style={{ color: "#C9C9C9" }}>{formatPrice(total)}</span>
          </div>
          {address && (
            <p className="text-xs pt-2" style={{ color: "rgba(200,187,168,0.6)", borderTop: "1px solid rgba(201,201,201,0.08)" }}>
              📍 {address}
            </p>
          )}
        </div>

        {/* WhatsApp CTA — shown when payment method is WhatsApp */}
        {isWhatsApp && (
          <>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 rounded-full text-sm font-semibold tracking-wider uppercase transition-all hover:opacity-90 mb-3"
              style={{ backgroundColor: "#25D366", color: "#fff" }}
            >
              <MessageCircle className="h-5 w-5" />
              Complete via WhatsApp
            </a>
            <p className="text-center text-xs mb-8" style={{ color: "rgba(200,187,168,0.5)" }}>
              Click to send order details and arrange payment with our team.
            </p>
          </>
        )}

        {isPaid && (
          <div
            className="rounded-2xl p-4 flex items-center gap-3 mb-6"
            style={{
              backgroundColor: "rgba(74,222,128,0.06)",
              border: "1px solid rgba(74,222,128,0.2)",
            }}
          >
            <CheckCircle className="h-5 w-5 shrink-0" style={{ color: "#4ADE80" }} />
            <p className="text-sm" style={{ color: "#9A9A9A" }}>
              You will receive shipping updates at{" "}
              <strong style={{ color: "#F5F5F5" }}>{order.customerEmail}</strong>.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/account"
            className="flex-1 flex items-center justify-center py-3 rounded-full text-sm font-medium"
            style={{ border: "1px solid rgba(201,201,201,0.3)", color: "#C9C9C9" }}
          >
            View My Orders
          </Link>
          <Link
            href="/products"
            className="flex-1 flex items-center justify-center py-3 rounded-full text-sm font-medium"
            style={{ border: "1px solid rgba(200,187,168,0.2)", color: "rgba(200,187,168,0.7)" }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
