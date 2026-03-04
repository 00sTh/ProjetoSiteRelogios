"use client";

import { useState } from "react";
import { Truck, Search, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface FreteResult {
  pac: number | null;
  sedex: number | null;
  prazoPac: number | null;
  prazoSedex: number | null;
  erro?: string;
}

interface Props {
  itemCount: number;
}

export function ShippingCalculator({ itemCount }: Props) {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FreteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputStyle = {
    backgroundColor: "rgba(10,10,10,0.6)",
    border: "1px solid rgba(212,175,55,0.2)",
    borderRadius: "0.75rem",
    color: "#F5F5F5",
    padding: "0.625rem 1rem",
    fontSize: "0.875rem",
    flex: 1,
    minWidth: 0,
    outline: "none",
  };

  function formatCep(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return digits;
  }

  async function handleCalcular() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setError("CEP inválido. Digite 8 dígitos.");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/frete?cep=${digits}&quantidade=${itemCount}`
      );
      const data = (await res.json()) as FreteResult;
      if (data.erro) {
        setError("Não foi possível calcular o frete para este CEP.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Erro ao consultar frete. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm" style={{ color: "#9A9A9A" }}>
        <Truck className="h-4 w-4" style={{ color: "#D4AF37" }} />
        <span>Calcular frete</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={cep}
          onChange={(e) => setCep(formatCep(e.target.value))}
          placeholder="00000-000"
          maxLength={9}
          style={inputStyle}
          onKeyDown={(e) => e.key === "Enter" && handleCalcular()}
        />
        <button
          onClick={handleCalcular}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-[#F0D060] disabled:opacity-50"
          style={{ backgroundColor: "#D4AF37", color: "#0A0A0A", flexShrink: 0 }}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {loading ? "" : "OK"}
        </button>
      </div>

      {error && (
        <p className="text-xs" style={{ color: "#F87171" }}>
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-2">
          {result.pac !== null ? (
            <div
              className="flex justify-between items-center px-3 py-2.5 rounded-xl text-sm"
              style={{
                backgroundColor: "rgba(212,175,55,0.06)",
                border: "1px solid rgba(212,175,55,0.15)",
              }}
            >
              <div>
                <span style={{ color: "#F5F5F5", fontWeight: 600 }}>PAC</span>
                {result.prazoPac && (
                  <span className="text-xs ml-2" style={{ color: "#9A9A9A" }}>
                    até {result.prazoPac} dias úteis
                  </span>
                )}
              </div>
              <span style={{ color: "#D4AF37", fontWeight: 700 }}>
                {formatPrice(result.pac)}
              </span>
            </div>
          ) : (
            <p className="text-xs" style={{ color: "rgba(200,187,168,0.5)" }}>
              PAC indisponível para este CEP.
            </p>
          )}

          {result.sedex !== null ? (
            <div
              className="flex justify-between items-center px-3 py-2.5 rounded-xl text-sm"
              style={{
                backgroundColor: "rgba(212,175,55,0.06)",
                border: "1px solid rgba(212,175,55,0.15)",
              }}
            >
              <div>
                <span style={{ color: "#F5F5F5", fontWeight: 600 }}>SEDEX</span>
                {result.prazoSedex && (
                  <span className="text-xs ml-2" style={{ color: "#9A9A9A" }}>
                    até {result.prazoSedex} dias úteis
                  </span>
                )}
              </div>
              <span style={{ color: "#D4AF37", fontWeight: 700 }}>
                {formatPrice(result.sedex)}
              </span>
            </div>
          ) : (
            <p className="text-xs" style={{ color: "rgba(200,187,168,0.5)" }}>
              SEDEX indisponível para este CEP.
            </p>
          )}

          <p className="text-xs" style={{ color: "rgba(200,187,168,0.4)" }}>
            * Prazo em dias úteis. Valor pode variar no checkout.
          </p>
        </div>
      )}
    </div>
  );
}
