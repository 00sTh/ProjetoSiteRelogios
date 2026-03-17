"use client";

import { useState, useTransition } from "react";
import { ShoppingCart, Check, Loader2, AlertCircle } from "lucide-react";
import { addToCart } from "@/actions/cart";
import { addToGuestCart } from "@/hooks/use-guest-cart";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";

// ─── Per-category config ───────────────────────────────────────────────────────

type ChipConfig = {
  type: "chips";
  label: string;
  options: string[];   // empty = will show free-text fallback
  required: boolean;
  freeText: boolean;
};
type TextConfig = { type: "text"; placeholder: string };
type VariationConfig = ChipConfig | TextConfig;

function getStaticConfig(categorySlug: string): VariationConfig {
  switch (categorySlug) {
    case "sapatos":
      return {
        type: "chips",
        label: "Tamanho",
        options: ["36","37","38","39","40","41","42","43"],
        required: true,
        freeText: false,
      };
    case "bolsas":
      return { type: "text", placeholder: "Ex: Cor, modelo..." };
    default:
      return { type: "text", placeholder: "Ex: Cor, tamanho, modelo..." };
  }
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ProductActionsProps {
  productId: string;
  categorySlug: string;
  inStock: boolean;
  /** Colors detected from product images (passed from server component) */
  detectedColors?: string[];
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ProductActions({
  productId,
  categorySlug,
  inStock,
  detectedColors,
  className,
}: ProductActionsProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(false);

  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");

  // Determine config: if we have detected colors, show color chips
  const isColorCategory = categorySlug === "relogios"
                       || categorySlug === "oculos"
                       || categorySlug === "bolsas";
  let config: VariationConfig;

  if (isColorCategory && detectedColors && detectedColors.length > 0) {
    config = {
      type: "chips",
      label: "Cor",
      options: detectedColors,
      required: false,
      freeText: true,
    };
  } else if (isColorCategory) {
    // No detected colors → free text
    config = { type: "text", placeholder: "Ex: Cor, detalhe..." };
  } else {
    config = getStaticConfig(categorySlug);
  }

  function buildObservation(): string | undefined {
    const parts: string[] = [];
    if (selectedChip) parts.push(selectedChip);
    const trimmed = freeText.trim();
    if (trimmed) parts.push(trimmed);
    return parts.length > 0 ? parts.join(" · ") : undefined;
  }

  const chipsConfig = config.type === "chips" ? config : null;
  const needsSelection = chipsConfig?.required && !selectedChip;
  const isDisabled = !inStock || !isLoaded || isPending || !!needsSelection;

  function handleAddToCart() {
    startTransition(async () => {
      try {
        const observations = buildObservation();
        if (isSignedIn) {
          await addToCart({ productId, quantity: 1, observations });
        } else {
          addToGuestCart(productId, 1, observations);
        }
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      } catch (err) {
        if (
          err !== null &&
          typeof err === "object" &&
          "digest" in err &&
          typeof (err as Record<string, unknown>).digest === "string" &&
          (err as Record<string, string>).digest.startsWith("NEXT_REDIRECT")
        ) {
          throw err;
        }
        setError(true);
        setTimeout(() => setError(false), 2500);
      }
    });
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>

      {/* Chips selector */}
      {chipsConfig && (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#6A6A6A" }}>
            {chipsConfig.label}
            {chipsConfig.required && <span style={{ color: "#e05252" }} className="ml-1">*</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {chipsConfig.options.map((opt) => {
              const active = selectedChip === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setSelectedChip(active ? null : opt)}
                  style={{
                    minWidth: "36px",
                    height: "36px",
                    padding: "0 12px",
                    fontSize: "12px",
                    cursor: "pointer",
                    borderRadius: "6px",
                    border: active ? "none" : "1px solid rgba(0,0,0,0.15)",
                    backgroundColor: active ? "#0A0A0A" : "transparent",
                    color: active ? "#F5F0E6" : "#6A6A6A",
                    fontWeight: active ? 600 : 400,
                    transition: "all 0.15s",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {chipsConfig.required && !selectedChip && (
            <p className="mt-1.5 text-xs" style={{ color: "rgba(224,82,82,0.7)" }}>
              Selecione um tamanho para continuar
            </p>
          )}
        </div>
      )}

      {/* Free text field */}
      {config.type === "text" && (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#6A6A6A" }}>
            Observações
          </p>
          <input
            type="text"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            maxLength={200}
            placeholder={config.placeholder}
            style={{
              width: "100%",
              padding: "10px 14px",
              fontSize: "13px",
              borderRadius: "10px",
              border: "1px solid rgba(0,0,0,0.15)",
              backgroundColor: "transparent",
              color: "#0A0A0A",
              outline: "none",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.35)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)"; }}
          />
        </div>
      )}

      {/* Extra free text for chip categories that allow it */}
      {chipsConfig?.freeText && (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#6A6A6A" }}>
            Detalhes adicionais
          </p>
          <input
            type="text"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            maxLength={200}
            placeholder="Ex: pulseira extra, mostrador específico..."
            style={{
              width: "100%",
              padding: "10px 14px",
              fontSize: "13px",
              borderRadius: "10px",
              border: "1px solid rgba(0,0,0,0.15)",
              backgroundColor: "transparent",
              color: "#0A0A0A",
              outline: "none",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.35)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)"; }}
          />
        </div>
      )}

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        style={
          added
            ? { backgroundColor: "#4ade80", color: "#0A0A0A", boxShadow: "0 0 20px rgba(74,222,128,0.3)" }
            : error
            ? { backgroundColor: "rgba(248,113,113,0.15)", color: "#F87171", boxShadow: "0 0 20px rgba(248,113,113,0.2)" }
            : isDisabled && !isPending
            ? { backgroundColor: "rgba(201,201,201,0.3)", color: "rgba(245,240,230,0.5)" }
            : { backgroundColor: "#C9C9C9", color: "#0A0A0A" }
        }
        onMouseEnter={(e) => {
          if (!isDisabled && !added && !error) {
            (e.currentTarget as HTMLElement).style.backgroundColor = "#E8E8E8";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(201,201,201,0.4)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled && !added && !error) {
            (e.currentTarget as HTMLElement).style.backgroundColor = "#C9C9C9";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }
        }}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> :
         added    ? <Check className="h-4 w-4" /> :
         error    ? <AlertCircle className="h-4 w-4" /> :
                    <ShoppingCart className="h-4 w-4" />}
        {isPending ? "Adicionando..." : added ? "Adicionado!" : error ? "Erro" : "Adicionar ao Carrinho"}
      </button>
    </div>
  );
}
