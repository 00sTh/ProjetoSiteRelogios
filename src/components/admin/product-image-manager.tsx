"use client";
import { useState } from "react";

export function ProductImageManager({ initialImages }: { initialImages: string[] }) {
  const [images, setImages] = useState(initialImages);

  return (
    <>
      <input type="hidden" name="existingImages" value={JSON.stringify(images)} />
      {images.length > 0 && (
        <div className="sm:col-span-2">
          <label className="label-slc mb-2 block">Imagens atuais</label>
          <div className="flex gap-2 flex-wrap">
            {images.map((img, i) => (
              <div key={img} className="relative group w-20 h-20 flex-shrink-0">
                <img src={img} alt={`img-${i}`} className="w-full h-full object-cover border" style={{ borderColor: "rgba(13,11,11,0.1)" }} />
                <button
                  type="button"
                  onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center text-white text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: "#6B1A2A" }}
                  title="Remover foto"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <p className="text-[10px] opacity-40 mt-1">Passe o mouse sobre a foto e clique × para remover.</p>
        </div>
      )}
    </>
  );
}
