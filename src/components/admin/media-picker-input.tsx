"use client";

/**
 * MediaPickerInput — substitui <input type="url"> em campos de imagem.
 * Inclui preview da imagem atual + botão "Banco" para escolher do media bank.
 * Funciona com forms não-controlados (defaultValue + ref).
 */

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { MediaPickerButton } from "./media-picker-button";

interface MediaPickerInputProps {
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  /** Estilo do <input> */
  style?: React.CSSProperties;
}

export function MediaPickerInput({
  name,
  defaultValue,
  placeholder,
  style,
}: MediaPickerInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(defaultValue ?? null);

  function handleSelect(url: string) {
    if (inputRef.current) {
      inputRef.current.value = url;
    }
    setPreview(url);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setPreview(v || null);
  }

  function clearValue() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
  }

  return (
    <div className="space-y-2">
      {/* Input row */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          name={name}
          type="text"
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          onChange={handleInputChange}
          style={{ ...style, flex: 1 }}
        />
        <MediaPickerButton onSelect={handleSelect} />
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="preview"
            className="h-16 w-16 object-cover rounded-lg"
            style={{ border: "1px solid rgba(212,175,55,0.3)" }}
            onError={() => setPreview(null)}
          />
          <button
            type="button"
            onClick={clearValue}
            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full flex items-center justify-center transition-opacity"
            style={{ backgroundColor: "#F87171", color: "white" }}
            title="Remover imagem"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
