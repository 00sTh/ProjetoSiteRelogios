"use client";

import { useState } from "react";
import { ProductImage } from "@/components/ui/product-image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const mainImage = images[activeIdx] ?? images[0] ?? "/placeholder.svg";

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div
        className="relative aspect-square overflow-hidden rounded-3xl"
        style={{
          backgroundColor: "#EAEAEA",
          border: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <ProductImage
          src={mainImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <div
          className="absolute top-4 right-4 w-8 h-8 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(201,201,201,0.3) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, idx) => {
            const active = idx === activeIdx;
            return (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl transition-all duration-200"
                style={{
                  backgroundColor: "#EAEAEA",
                  border: active
                    ? "2px solid #0A0A0A"
                    : "1px solid rgba(0,0,0,0.1)",
                  opacity: active ? 1 : 0.7,
                  cursor: "pointer",
                }}
                aria-label={`Imagem ${idx + 1}`}
              >
                <ProductImage
                  src={img}
                  alt={`${productName} ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
