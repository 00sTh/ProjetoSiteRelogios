import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { AnalyzeBulkClient } from "./analyze-client";

export const metadata: Metadata = { title: "Admin — Análise Gemini" };

export default async function AnalyzePage() {
  // Fetch products without brand
  const products = await prisma.product.findMany({
    where: {
      active: true,
      brand: null,
    },
    select: { id: true, name: true, brand: true, model_name: true, images: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const withImage = products.filter((p) => {
    const imgs = parseImages(p.images as string | string[]);
    return imgs.length > 0;
  });

  const ids = withImage.map((p) => p.id);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs mb-4" style={{ color: "rgba(200,187,168,0.5)" }}>
          <Link href="/admin/products" className="hover:text-[#C9C9C9] transition-colors">
            Produtos
          </Link>
          <span>/</span>
          <span style={{ color: "#C9C9C9" }}>Análise Gemini</span>
        </div>
        <h1 className="font-serif text-3xl font-bold" style={{ color: "#F5F5F5" }}>
          Análise em Massa com Gemini
        </h1>
        <p className="mt-2 text-sm" style={{ color: "#9A9A9A" }}>
          {withImage.length} produto{withImage.length !== 1 ? "s" : ""} sem marca ou cores detectadas.
          O Gemini irá analisar cada imagem e preencher automaticamente marca, modelo e cores.
        </p>
      </div>

      {/* Preview list */}
      {withImage.length > 0 ? (
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: "#141414", border: "1px solid rgba(201,201,201,0.15)" }}
        >
          <p className="text-xs mb-4" style={{ color: "rgba(200,187,168,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Produtos na fila
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {withImage.map((p) => (
              <div key={p.id} className="flex items-center gap-3 text-sm" style={{ color: "#9A9A9A" }}>
                <span style={{ color: "#6A6A6A", fontSize: "10px", fontFamily: "monospace" }}>{p.id.slice(0, 8)}</span>
                <span className="truncate flex-1">{p.name}</span>
                {p.brand && <span style={{ color: "#C9A947", fontSize: "11px" }}>{p.brand}</span>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: "#141414", border: "1px solid rgba(201,201,201,0.15)" }}
        >
          <p style={{ color: "#9A9A9A" }}>Todos os produtos já foram analisados.</p>
          <Link href="/admin/products" className="text-sm mt-2 inline-block" style={{ color: "#C9C9C9" }}>
            Voltar para produtos →
          </Link>
        </div>
      )}

      {withImage.length > 0 && <AnalyzeBulkClient productIds={ids} />}
    </div>
  );
}
