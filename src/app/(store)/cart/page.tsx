import Link from "next/link";
import type { Metadata } from "next";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { CartItemCard } from "@/components/cart/cart-item";
import { ShippingCalculator } from "@/components/cart/shipping-calculator";
import { GuestCartView } from "@/components/cart/guest-cart-view";
import { getCart } from "@/actions/cart";
import { getSiteSettings } from "@/actions/admin";
import { getServerAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Meu Carrinho",
};

export default async function CartPage() {
  const { userId } = await getServerAuth();
  if (!userId) return <GuestCartView />;

  const [cart, settings] = await Promise.all([getCart(), getSiteSettings()]);
  const items = cart?.items ?? [];
  const threshold = Number(settings.shippingFreeThreshold);

  const subtotal = items.reduce(
    (acc, item) => acc + Number(item.product.price) * item.quantity,
    0
  );
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const freeShipping = subtotal >= threshold;

  if (items.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-center gap-6 px-4 py-20"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.05)",
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <ShoppingCart className="h-10 w-10" style={{ color: "rgba(0,0,0,0.2)" }} />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: "#0A0A0A" }}>
            Seu Carrinho está Vazio
          </h1>
          <p className="text-base" style={{ color: "#6A6A6A" }}>
            Você ainda não adicionou nenhum produto.
          </p>
        </div>
        <Link
          href="/products"
          className="px-8 py-3 rounded-full text-sm font-semibold tracking-widest uppercase transition-all hover:bg-[#E8E8E8] hover:shadow-[0_0_20px_rgba(201,201,201,0.4)]"
          style={{ backgroundColor: "#C9C9C9", color: "#0A0A0A" }}
        >
          Ver Produtos
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{ backgroundColor: "#FAFAFA" }}
    >
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="label-luxury mb-2" style={{ color: "#6A6A6A" }}>
            Meu Carrinho
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "#0A0A0A" }}>
            {itemCount} {itemCount === 1 ? "item" : "itens"}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: "#F2F2F2",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <CartItemCard item={item} />
              </div>
            ))}
          </div>

          {/* Summary */}
          <div
            className="h-fit rounded-2xl p-6 space-y-5 sticky top-24"
            style={{
              backgroundColor: "#F2F2F2",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <h2
              className="font-serif text-xl font-bold"
              style={{ color: "#0A0A0A" }}
            >
              Resumo do Pedido
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between" style={{ color: "#6A6A6A" }}>
                <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "itens"})</span>
                <span style={{ color: "#0A0A0A" }}>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between" style={{ color: "#6A6A6A" }}>
                <span>Frete</span>
                <span
                  className="font-medium"
                  style={{ color: freeShipping ? "#4ade80" : "#9A9A9A" }}
                >
                  {freeShipping ? "Grátis" : "Calculado no checkout"}
                </span>
              </div>
              {!freeShipping && (
                <p className="text-xs" style={{ color: "#6A6A6A" }}>
                  Adicione mais {formatPrice(threshold - subtotal)} para frete grátis
                </p>
              )}
            </div>

            {!freeShipping && (
              <div
                className="pt-4"
                style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
              >
                <ShippingCalculator itemCount={itemCount} />
              </div>
            )}

            <div
              className="pt-4"
              style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
            >
              <div className="flex justify-between font-bold text-xl">
                <span style={{ color: "#0A0A0A" }}>Total</span>
                <span style={{ color: "#0A0A0A" }}>{formatPrice(subtotal)}</span>
              </div>
              {!freeShipping && (
                <p className="mt-1 text-xs" style={{ color: "#9A9A9A" }}>
                  * Frete calculado no checkout
                </p>
              )}
            </div>

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-sm font-semibold tracking-widest uppercase transition-all hover:bg-[#E8E8E8] hover:shadow-[0_0_20px_rgba(201,201,201,0.4)]"
              style={{ backgroundColor: "#C9C9C9", color: "#0A0A0A" }}
            >
              Finalizar Pedido <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/products"
              className="flex items-center justify-center w-full py-3 rounded-full text-sm font-medium"
              style={{
                border: "1px solid rgba(0,0,0,0.15)",
                color: "#6A6A6A",
              }}
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
