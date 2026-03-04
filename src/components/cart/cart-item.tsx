"use client";

import { ProductImage } from "@/components/ui/product-image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { updateQuantity, removeFromCart } from "@/actions/cart";
import { formatPrice } from "@/lib/utils";
import { parseImages } from "@/lib/utils";
import type { CartItemWithProduct } from "@/types";

interface CartItemCardProps {
  item: CartItemWithProduct;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const [isPending, startTransition] = useTransition();
  const images = parseImages(item.product.images as unknown as string);
  const mainImage = images[0] ?? "/placeholder.svg";

  function handleUpdate(newQty: number) {
    startTransition(() =>
      updateQuantity({ cartItemId: item.id, quantity: newQty })
    );
  }

  function handleRemove() {
    startTransition(() => removeFromCart({ cartItemId: item.id }));
  }

  return (
    <div
      className={`flex gap-4 p-4 transition-opacity ${
        isPending ? "opacity-50" : ""
      }`}
    >
      {/* Image */}
      <div
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl"
        style={{ backgroundColor: "#1A1A1A" }}
      >
        <ProductImage
          src={mainImage}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1">
        <p
          className="font-serif font-semibold text-sm leading-tight"
          style={{ color: "#F5F5F5" }}
        >
          {item.product.name}
        </p>
        <p
          className="font-bold text-sm"
          style={{ color: "#D4AF37" }}
        >
          {formatPrice(Number(item.product.price))}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-auto">
          <button
            className="h-7 w-7 flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-40"
            style={{
              border: "1px solid rgba(212,175,55,0.3)",
              color: "#D4AF37",
            }}
            onClick={() => handleUpdate(item.quantity - 1)}
            disabled={isPending}
            aria-label="Diminuir quantidade"
          >
            <Minus className="h-3 w-3" />
          </button>

          <span
            className="w-6 text-center text-sm font-bold"
            style={{ color: "#F5F5F5" }}
          >
            {item.quantity}
          </span>

          <button
            className="h-7 w-7 flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-40"
            style={{
              border: "1px solid rgba(212,175,55,0.3)",
              color: "#D4AF37",
            }}
            onClick={() => handleUpdate(item.quantity + 1)}
            disabled={isPending || item.quantity >= item.product.stock}
            aria-label="Aumentar quantidade"
          >
            <Plus className="h-3 w-3" />
          </button>

          <button
            className="h-7 w-7 flex items-center justify-center rounded-full ml-2 transition-all duration-200 hover:bg-red-500/20 disabled:opacity-40"
            style={{ color: "rgba(224,82,82,0.7)" }}
            onClick={handleRemove}
            disabled={isPending}
            aria-label="Remover item"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <p
        className="font-bold text-sm shrink-0 self-center"
        style={{ color: "#D4AF37" }}
      >
        {formatPrice(Number(item.product.price) * item.quantity)}
      </p>
    </div>
  );
}
