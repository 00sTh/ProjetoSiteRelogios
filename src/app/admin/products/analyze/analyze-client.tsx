"use client";

import { useState, useTransition } from "react";
import { analyzeProductsWithGemini } from "@/actions/admin";

interface ResultItem {
  id: string;
  brand: string | null;
  model: string | null;
  colors: string[];
}

interface Props {
  productIds: string[];
}

const BATCH_SIZE = 5;

export function AnalyzeBulkClient({ productIds }: Props) {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<ResultItem[]>([]);
  const [processed, setProcessed] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startAnalysis() {
    setResults([]);
    setProcessed(0);
    setDone(false);
    setError(null);

    startTransition(async () => {
      const allIds = [...productIds];
      let offset = 0;

      while (offset < allIds.length) {
        const batch = allIds.slice(offset, offset + BATCH_SIZE);
        try {
          const batchResults = await analyzeProductsWithGemini(batch);
          setResults((prev) => [...prev, ...batchResults]);
          setProcessed((prev) => prev + batch.length);
        } catch (err) {
          setError((err as Error).message);
          break;
        }
        offset += BATCH_SIZE;
      }

      setDone(true);
    });
  }

  const progress = productIds.length > 0 ? Math.round((processed / productIds.length) * 100) : 0;

  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: "#141414", border: "1px solid rgba(201,201,201,0.15)" }}
    >
      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm mb-4"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          Erro: {error}
        </div>
      )}

      {isPending && (
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-2" style={{ color: "#9A9A9A" }}>
            <span>Analisando com Gemini...</span>
            <span>{processed} / {productIds.length}</span>
          </div>
          <div className="h-1 rounded-full" style={{ backgroundColor: "rgba(201,201,201,0.1)" }}>
            <div
              className="h-1 rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: "#C9A947" }}
            />
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="mb-6 space-y-1 max-h-48 overflow-y-auto">
          {results.map((r) => (
            <div key={r.id} className="text-xs flex items-center gap-3" style={{ color: "#9A9A9A" }}>
              <span style={{ color: "#6A6A6A", fontFamily: "monospace" }}>{r.id.slice(0, 8)}</span>
              {r.brand && <span style={{ color: "#C9A947" }}>{r.brand}</span>}
              {r.model && <span style={{ color: "#F5F5F5" }}>{r.model}</span>}
              {r.colors.length > 0 && <span>{r.colors.join(", ")}</span>}
            </div>
          ))}
        </div>
      )}

      {done && !isPending && (
        <div
          className="rounded-xl px-4 py-3 text-sm mb-4"
          style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#4ADE80", border: "1px solid rgba(34,197,94,0.2)" }}
        >
          Análise completa! {results.length} produto{results.length !== 1 ? "s" : ""} atualizado{results.length !== 1 ? "s" : ""}.
        </div>
      )}

      <button
        onClick={startAnalysis}
        disabled={isPending}
        className="px-6 py-2.5 rounded-xl text-sm font-semibold tracking-wider transition-all duration-200 disabled:opacity-50"
        style={{ backgroundColor: "#C9A947", color: "#0A0A0A" }}
      >
        {isPending ? "Analisando..." : done ? "Analisar novamente" : `Iniciar análise (${productIds.length} produtos)`}
      </button>
    </div>
  );
}
