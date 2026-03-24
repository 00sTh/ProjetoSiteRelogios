"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGuestCart } from "@/hooks/use-guest-cart";
import { formatPrice } from "@/lib/utils";
import type { HydratedCartItem } from "@/types";

export function CartPageClient() {
  const { items, updateItem, removeItem, count } = useGuestCart();
  const [hydrated, setHydrated] = useState<HydratedCartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!items.length) { setLoading(false); return; }
    const ids = items.map(i => i.productId).join(",");
    fetch(`/api/cart-products?ids=${ids}`)
      .then(r => r.json())
      .then((data: HydratedCartItem[]) => {
        const merged = items.map(item => {
          const found = data.find(d => d.productId === item.productId);
          if (!found) return null;
          return { ...item, ...found } as HydratedCartItem;
        }).filter((i): i is HydratedCartItem => i !== null);
        setHydrated(merged);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map(i => i.productId).join(",")]);

  const total = hydrated.reduce((acc, i) => acc + (i.price ?? 0) * i.quantity, 0);

  if (loading) return <div className="pt-24 min-h-screen flex items-center justify-center"><p className="label-slc">Carregando…</p></div>;

  if (!count) return (
    <div className="pt-24 min-h-screen flex flex-col items-center justify-center gap-6">
      <p className="font-serif text-2xl font-light">Seu carrinho está vazio</p>
      <Link href="/" className="cta-link">Explorar Coleção</Link>
    </div>
  );

  return (
    <div className="pt-24 min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-serif text-3xl font-light mb-10">Carrinho</h1>
        <div className="space-y-4 mb-8">
          {hydrated.map(item => (
            <div key={item.productId} className="flex gap-4 py-4 border-b" style={{ borderColor: "rgba(13,11,11,0.08)" }}>
              <div className="relative flex-shrink-0 bg-white overflow-hidden" style={{ width: 80, height: 100 }}>
                {item.image && <Image src={item.image} alt={item.name ?? ""} fill className="object-cover" />}
              </div>
              <div className="flex-1">
                <p className="label-slc mb-0.5" style={{ color: "#B8963E" }}>{item.brandName}</p>
                <p className="font-serif italic text-sm mb-2">{item.name}</p>
                <p className="font-mono text-sm">{formatPrice(item.price ?? 0)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center border" style={{ borderColor: "rgba(13,11,11,0.15)" }}>
                  <button onClick={() => updateItem(item.productId, item.quantity - 1)} className="px-2 py-1 text-sm">−</button>
                  <span className="px-3 py-1 font-mono text-xs">{item.quantity}</span>
                  <button onClick={() => updateItem(item.productId, item.quantity + 1)} className="px-2 py-1 text-sm">+</button>
                </div>
                <button onClick={() => removeItem(item.productId)} className="label-slc opacity-40 hover:opacity-100">Remover</button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="label-slc">Total</span>
          <span className="font-mono text-xl font-medium">{formatPrice(total)}</span>
        </div>
        <Link href="/checkout" className="block w-full py-4 text-center text-[10px] tracking-[0.4em] uppercase text-white" style={{ backgroundColor: "#0D0B0B" }}>
          Finalizar Pedido
        </Link>
      </div>
    </div>
  );
}
