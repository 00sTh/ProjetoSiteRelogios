"use client";

import { useTransition, useState } from "react";
import { Heart } from "lucide-react";
import { addToWishlist, removeFromWishlist } from "@/actions/wishlist";

interface WishlistButtonProps {
  productId: string;
  initialInWishlist?: boolean;
  className?: string;
}

export function WishlistButton({
  productId,
  initialInWishlist = false,
  className = "",
}: WishlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [inWishlist, setInWishlist] = useState(initialInWishlist);

  function toggle() {
    startTransition(async () => {
      if (inWishlist) {
        await removeFromWishlist(productId);
        setInWishlist(false);
      } else {
        await addToWishlist(productId);
        setInWishlist(true);
      }
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={inWishlist ? "Remover da lista de desejos" : "Adicionar à lista de desejos"}
      className={`h-10 w-10 flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 ${className}`}
      style={{
        backgroundColor: inWishlist ? "rgba(212,175,55,0.15)" : "rgba(212,175,55,0.08)",
        border: `1px solid ${inWishlist ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.2)"}`,
      }}
    >
      <Heart
        className="h-4 w-4 transition-all duration-200"
        style={{ color: "#D4AF37" }}
        fill={inWishlist ? "#D4AF37" : "none"}
      />
    </button>
  );
}
