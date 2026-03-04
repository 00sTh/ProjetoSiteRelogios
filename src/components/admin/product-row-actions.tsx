"use client";

import { useState, useTransition } from "react";
import { Star, Trash2 } from "lucide-react";
import { hardDeleteProduct, toggleProductFeatured } from "@/actions/admin";

interface ProductRowActionsProps {
  productId: string;
  featured: boolean;
  productName: string;
}

export function ProductRowActions({ productId, featured, productName }: ProductRowActionsProps) {
  const [isFeatured, setIsFeatured] = useState(featured);
  const [isPending, startTransition] = useTransition();

  function handleToggleFeatured() {
    startTransition(async () => {
      await toggleProductFeatured(productId, !isFeatured);
      setIsFeatured((prev) => !prev);
    });
  }

  function handleDelete() {
    if (!confirm(`Excluir permanentemente "${productName}"? Esta ação não pode ser desfeita.`)) return;
    startTransition(async () => {
      const result = await hardDeleteProduct(productId);
      if (result.success && result.softDeleted) {
        alert(`"${productName}" tem pedidos históricos e foi desativado (oculto) em vez de excluído.`);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {/* Featured toggle */}
      <button
        onClick={handleToggleFeatured}
        disabled={isPending}
        title={isFeatured ? "Remover dos destaques" : "Adicionar aos destaques"}
        className="flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 disabled:opacity-50"
        style={{
          backgroundColor: isFeatured ? "rgba(212,175,55,0.15)" : "transparent",
          color: isFeatured ? "#D4AF37" : "rgba(200,187,168,0.4)",
          border: `1px solid ${isFeatured ? "rgba(212,175,55,0.4)" : "rgba(200,187,168,0.15)"}`,
        }}
      >
        <Star className="h-3.5 w-3.5" fill={isFeatured ? "#D4AF37" : "none"} />
      </button>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={isPending}
        title="Excluir produto"
        className="flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 disabled:opacity-50 hover:bg-[rgba(239,68,68,0.1)] hover:border-[rgba(239,68,68,0.3)]"
        style={{
          color: "rgba(200,187,168,0.4)",
          border: "1px solid rgba(200,187,168,0.15)",
        }}
      >
        <Trash2 className="h-3.5 w-3.5 hover:text-[#F87171]" />
      </button>
    </div>
  );
}
