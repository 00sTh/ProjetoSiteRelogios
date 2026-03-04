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
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%231A1A1A'/%3E%3Cpath d='M160 170 Q200 130 240 170 Q270 200 240 230 Q200 270 160 230 Q130 200 160 170Z' fill='%23D4AF3730' stroke='%23D4AF3750' stroke-width='1'/%3E%3Ccircle cx='200' cy='200' r='40' fill='none' stroke='%23D4AF3740' stroke-width='1'/%3E%3C/svg%3E";

export function ProductImage({
  src,
  alt,
  fill,
  sizes,
  priority,
  className,
}: ProductImageProps) {
  const [error, setError] = useState(false);

  return (
    <Image
      src={error ? PLACEHOLDER : src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setError(true)}
      unoptimized={error}
    />
  );
}
