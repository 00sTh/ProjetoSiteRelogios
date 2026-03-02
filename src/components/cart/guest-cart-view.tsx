"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, UserPlus, LogIn, X } from "lucide-react";
import { getProductsByIds } from "@/actions/products";
import {
  getGuestCart,
  updateGuestCartItem,
  removeGuestCartItem,
  type GuestCartItem,
} from "@/hooks/use-guest-cart";
import { formatPrice, parseImages } from "@/lib/utils";
import { ProductImage } from "@/components/ui/product-image";

type ProductData = {
  id: string;
  name: string;
  price: { toString(): string };
  images: string[];
  stock: number;
  slug: string;
};

type EnrichedItem = GuestCartItem & { product: ProductData };

// ─── Account Prompt Modal ─────────────────────────────────────────────────────

function AccountPromptModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl p-8 text-center"
        style={{
          backgroundColor: "#0F4A37",
          border: "1px solid rgba(201,162,39,0.35)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full transition-colors"
          style={{ color: "rgba(200,187,168,0.5)" }}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div
          className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "rgba(201,162,39,0.12)",
            border: "1px solid rgba(201,162,39,0.3)",
          }}
        >
          <ShoppingCart className="h-7 w-7" style={{ color: "#C9A227" }} />
        </div>

        <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: "#F5F0E6" }}>
          Quase lá!
        </h2>
        <p className="text-sm mb-6" style={{ color: "rgba(200,187,168,0.75)" }}>
          Crie uma conta gratuita para finalizar sua compra. Seus itens ficam salvos!
        </p>

        <div className="space-y-3">
          <Link
            href="/sign-up?redirect_url=%2Fcheckout"
            className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-full text-sm font-semibold tracking-widest uppercase transition-all hover:bg-[#E8C84A] hover:shadow-[0_0_20px_rgba(201,162,39,0.4)]"
            style={{ backgroundColor: "#C9A227", color: "#0A3D2F" }}
          >
            <UserPlus className="h-4 w-4" />
            Criar conta gratuita
          </Link>

          <Link
            href="/sign-in?redirect_url=%2Fcheckout"
            className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-full text-sm font-medium transition-all"
            style={{
              border: "1px solid rgba(201,162,39,0.4)",
              color: "#C9A227",
            }}
          >
            <LogIn className="h-4 w-4" />
            Já tenho conta — Entrar
          </Link>
        </div>

        <p className="mt-4 text-xs" style={{ color: "rgba(200,187,168,0.4)" }}>
          Cadastro rápido · Sem spam · Seus dados protegidos
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GuestCartView() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<GuestCartItem[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const cart = getGuestCart();
    setItems(cart);
    setMounted(true);
    if (cart.length > 0) {
      getProductsByIds(cart.map((i) => i.productId))
        .then((p) => setProducts(p as ProductData[]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function handleUpdate(productId: string, qty: number) {
    updateGuestCartItem(productId, qty);
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
    );
  }

  function handleRemove(productId: string) {
    removeGuestCartItem(productId);
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "#0A3D2F" }}>
        <div className="container mx-auto max-w-7xl space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl animate-pulse"
              style={{ backgroundColor: "#0F4A37" }}
            />
          ))}
        </div>
      </div>
    );
  }

  const enriched: EnrichedItem[] = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return { ...item, product };
    })
    .filter(Boolean) as EnrichedItem[];

  const subtotal = enriched.reduce(
    (acc, item) => acc + Number(item.product.price) * item.quantity,
    0
  );
  const itemCount = enriched.reduce((acc, item) => acc + item.quantity, 0);

  if (enriched.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-center gap-6 px-4 py-20"
        style={{ backgroundColor: "#0A3D2F" }}
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "rgba(201,162,39,0.08)",
            border: "1px solid rgba(201,162,39,0.2)",
          }}
        >
          <ShoppingCart className="h-10 w-10" style={{ color: "rgba(201,162,39,0.4)" }} />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: "#F5F0E6" }}>
            Carrinho vazio
          </h1>
          <p className="text-base" style={{ color: "#C8BBA8" }}>
            Você ainda não adicionou nenhum produto.
          </p>
        </div>
        <Link
          href="/products"
          className="px-8 py-3 rounded-full text-sm font-semibold tracking-widest uppercase transition-all hover:bg-[#E8C84A]"
          style={{ backgroundColor: "#C9A227", color: "#0A3D2F" }}
        >
          Explorar produtos
        </Link>
      </div>
    );
  }

  return (
    <>
      {showModal && <AccountPromptModal onClose={() => setShowModal(false)} />}

      <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "#0A3D2F" }}>
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="label-luxury mb-2" style={{ color: "#C9A227" }}>
              Meu Carrinho
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "#F5F0E6" }}>
              {itemCount} {itemCount === 1 ? "item" : "itens"}
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
            {/* Items */}
            <div className="space-y-4">
              {enriched.map((item) => {
                const images = parseImages(item.product.images as unknown as string);
                const mainImage = images[0] ?? "/placeholder.svg";
                return (
                  <div
                    key={item.productId}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      backgroundColor: "#0F4A37",
                      border: "1px solid rgba(201,162,39,0.15)",
                    }}
                  >
                    <div className="flex gap-4 p-4">
                      <div
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl"
                        style={{ backgroundColor: "#145A43" }}
                      >
                        <ProductImage src={mainImage} alt={item.product.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <p className="font-serif font-semibold text-sm" style={{ color: "#F5F0E6" }}>
                          {item.product.name}
                        </p>
                        <p className="font-bold text-sm" style={{ color: "#C9A227" }}>
                          {formatPrice(Number(item.product.price))}
                        </p>
                        <div className="flex items-center gap-2 mt-auto">
                          <button
                            className="h-7 w-7 flex items-center justify-center rounded-full"
                            style={{ border: "1px solid rgba(201,162,39,0.3)", color: "#C9A227" }}
                            onClick={() => handleUpdate(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold" style={{ color: "#F5F0E6" }}>
                            {item.quantity}
                          </span>
                          <button
                            className="h-7 w-7 flex items-center justify-center rounded-full"
                            style={{ border: "1px solid rgba(201,162,39,0.3)", color: "#C9A227" }}
                            onClick={() => handleUpdate(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            className="h-7 w-7 flex items-center justify-center rounded-full ml-2 hover:bg-red-500/20"
                            style={{ color: "rgba(224,82,82,0.7)" }}
                            onClick={() => handleRemove(item.productId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="font-bold text-sm shrink-0 self-center" style={{ color: "#C9A227" }}>
                        {formatPrice(Number(item.product.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div
              className="h-fit rounded-2xl p-6 space-y-5 sticky top-24"
              style={{
                backgroundColor: "#0F4A37",
                border: "1px solid rgba(201,162,39,0.2)",
              }}
            >
              <h2 className="font-serif text-xl font-bold" style={{ color: "#F5F0E6" }}>
                Resumo do Pedido
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between" style={{ color: "#C8BBA8" }}>
                  <span>Subtotal ({itemCount} itens)</span>
                  <span style={{ color: "#F5F0E6" }}>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between" style={{ color: "#C8BBA8" }}>
                  <span>Frete</span>
                  <span>A calcular</span>
                </div>
              </div>

              <div
                className="pt-4 flex justify-between font-bold text-xl"
                style={{ borderTop: "1px solid rgba(201,162,39,0.2)" }}
              >
                <span style={{ color: "#F5F0E6" }}>Total</span>
                <span style={{ color: "#C9A227" }}>{formatPrice(subtotal)}</span>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-sm font-semibold tracking-widest uppercase transition-all hover:bg-[#E8C84A] hover:shadow-[0_0_20px_rgba(201,162,39,0.4)]"
                style={{ backgroundColor: "#C9A227", color: "#0A3D2F" }}
              >
                Finalizar compra <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href="/products"
                className="flex items-center justify-center w-full py-3 rounded-full text-sm font-medium"
                style={{ border: "1px solid rgba(201,162,39,0.3)", color: "#C9A227" }}
              >
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
