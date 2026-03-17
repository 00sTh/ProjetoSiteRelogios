"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23F0F0F0'/%3E%3Crect x='170' y='160' width='60' height='48' rx='4' fill='none' stroke='%23CCCCCC' stroke-width='2'/%3E%3Ccircle cx='185' cy='175' r='5' fill='%23CCCCCC'/%3E%3Cpath d='M170 195 l20-15 l15 12 l10-8 l15 16' fill='none' stroke='%23CCCCCC' stroke-width='2'/%3E%3C/svg%3E";

export function ProductImage({
  src,
  alt,
  fill,
  sizes,
  priority,
  className,
}: ProductImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return <div style={{ position: "absolute", inset: 0 }} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setError(true)}
    />
  );
}
