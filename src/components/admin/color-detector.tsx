"use client";
import { useState } from "react";
import { detectProductColors } from "@/actions/admin";

export function ColorDetector({ imageUrl, defaultColors }: { imageUrl?: string; defaultColors?: string }) {
  const [colors, setColors] = useState(defaultColors ?? "");
  const [loading, setLoading] = useState(false);

  async function detect() {
    if (!imageUrl) return;
    setLoading(true);
    try {
      const detected = await detectProductColors(imageUrl);
      setColors(detected.join(", "));
    } catch {
      // keep existing value
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <input
          name="colors"
          value={colors}
          onChange={(e) => setColors(e.target.value)}
          placeholder="Ex: Preto, Prata, Azul Marinho"
          className="border px-3 py-2 text-sm flex-1 outline-none focus:border-[#B8963E]"
          style={{ borderColor: "rgba(13,11,11,0.2)" }}
        />
        {imageUrl && (
          <button
            type="button"
            onClick={detect}
            disabled={loading}
            className="px-3 py-2 text-[9px] tracking-widest uppercase border flex-shrink-0 transition-opacity"
            style={{ borderColor: "rgba(184,150,62,0.4)", color: "#B8963E", opacity: loading ? 0.5 : 1 }}
          >
            {loading ? "Detectando…" : "✦ Gemini"}
          </button>
        )}
      </div>
      <p className="text-[10px] opacity-40">Separar por vírgula · Ex: Preto, Prata, Dourado</p>
    </div>
  );
}
