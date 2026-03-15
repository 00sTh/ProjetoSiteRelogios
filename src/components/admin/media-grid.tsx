"use client";

import { useState, useTransition } from "react";
import { Copy, Trash2, Check, Film, Image as ImageIcon } from "lucide-react";
import { deleteMediaAsset } from "@/actions/admin";

interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number | null;
  createdAt: Date;
}

interface MediaGridProps {
  assets: MediaAsset[];
}

export function MediaGrid({ assets }: MediaGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCopy(url: string, id: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir "${name}" da biblioteca? Esta ação não pode ser desfeita.`)) return;
    startTransition(async () => {
      await deleteMediaAsset(id);
    });
  }

  if (assets.length === 0) {
    return (
      <div
        className="rounded-2xl p-12 text-center"
        style={{ border: "1px dashed rgba(201,201,201,0.2)" }}
      >
        <ImageIcon className="h-8 w-8 mx-auto mb-3" style={{ color: "rgba(201,201,201,0.3)" }} />
        <p className="text-sm" style={{ color: "rgba(200,187,168,0.5)" }}>
          Nenhuma mídia adicionada ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="group relative rounded-xl overflow-hidden"
          style={{ backgroundColor: "#141414", border: "1px solid rgba(201,201,201,0.12)" }}
        >
          {/* Thumbnail */}
          <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: "#1A1A1A" }}>
            {asset.type === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset.url}
                alt={asset.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film className="h-8 w-8" style={{ color: "rgba(201,201,201,0.5)" }} />
              </div>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
              <button
                onClick={() => handleCopy(asset.url, asset.id)}
                title="Copiar URL"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: copiedId === asset.id ? "#4ADE80" : "#C9C9C9" }}
              >
                {copiedId === asset.id ? (
                  <Check className="h-4 w-4 text-[#0A0A0A]" />
                ) : (
                  <Copy className="h-4 w-4 text-[#0A0A0A]" />
                )}
              </button>
              <button
                onClick={() => handleDelete(asset.id, asset.name)}
                disabled={isPending}
                title="Excluir"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
                style={{ backgroundColor: "#F87171" }}
              >
                <Trash2 className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-2">
            <p
              className="text-xs font-medium truncate"
              style={{ color: "#9A9A9A" }}
              title={asset.name}
            >
              {asset.name}
            </p>
            {asset.type === "VIDEO" && (
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(200,187,168,0.4)" }}>
                Vídeo URL
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
