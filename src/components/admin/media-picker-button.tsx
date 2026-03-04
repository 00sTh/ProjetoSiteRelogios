"use client";

import { useState } from "react";
import { FolderOpen, X, Loader2, Image as ImageIcon } from "lucide-react";
import { getMediaAssets } from "@/actions/admin";

interface Asset {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface MediaPickerButtonProps {
  onSelect: (url: string) => void;
  /** Texto do botão — padrão: "Banco" */
  label?: string;
}

export function MediaPickerButton({ onSelect, label = "Banco" }: MediaPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  async function openPicker() {
    setOpen(true);
    if (!fetched) {
      setLoading(true);
      const result = await getMediaAssets("IMAGE");
      setAssets(result as Asset[]);
      setLoading(false);
      setFetched(true);
    }
  }

  function handleSelect(url: string) {
    onSelect(url);
    setOpen(false);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={openPicker}
        title="Escolher do banco de mídia"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all hover:shadow-[0_0_12px_rgba(212,175,55,0.25)]"
        style={{
          backgroundColor: "rgba(212,175,55,0.1)",
          color: "#D4AF37",
          border: "1px solid rgba(212,175,55,0.3)",
          whiteSpace: "nowrap",
        }}
      >
        <FolderOpen className="h-3.5 w-3.5" />
        {label}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.82)" }}
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            className="relative w-full max-w-3xl flex flex-col rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "#0A2419",
              border: "1px solid rgba(212,175,55,0.2)",
              maxHeight: "80vh",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{ borderBottom: "1px solid rgba(212,175,55,0.12)" }}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" style={{ color: "#D4AF37" }} />
                <h2 className="font-serif text-base font-semibold" style={{ color: "#F5F5F5" }}>
                  Banco de Imagens
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[rgba(212,175,55,0.1)]"
                style={{ color: "#9A9A9A" }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-auto p-6 flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#D4AF37" }} />
                </div>
              ) : assets.length === 0 ? (
                <div className="text-center py-16">
                  <ImageIcon className="h-8 w-8 mx-auto mb-3" style={{ color: "rgba(212,175,55,0.3)" }} />
                  <p className="text-sm mb-3" style={{ color: "rgba(200,187,168,0.5)" }}>
                    Nenhuma imagem no banco ainda.
                  </p>
                  <a
                    href="/admin/media"
                    target="_blank"
                    className="text-sm underline"
                    style={{ color: "#D4AF37" }}
                  >
                    Adicionar imagens →
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {assets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => handleSelect(asset.url)}
                      className="group relative rounded-xl overflow-hidden text-left transition-all hover:ring-2 hover:ring-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      style={{ backgroundColor: "#0F2E1E" }}
                    >
                      <div className="aspect-square overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <p
                        className="px-2 py-1.5 text-[10px] truncate"
                        style={{ color: "rgba(200,187,168,0.6)" }}
                        title={asset.name}
                      >
                        {asset.name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-6 py-3 text-xs shrink-0"
              style={{
                borderTop: "1px solid rgba(212,175,55,0.12)",
                color: "rgba(200,187,168,0.4)",
              }}
            >
              {assets.length} imagem{assets.length !== 1 ? "ns" : ""} · Clique em uma imagem para selecionar ·{" "}
              <a href="/admin/media" target="_blank" className="underline" style={{ color: "#D4AF37" }}>
                Gerenciar banco
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
