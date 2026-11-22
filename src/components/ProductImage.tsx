"use client";

import { useState } from "react";
import { baseAssetUrl } from "@/lib/seo";

/**
 * Изображение товара с площадки base.sstmk.ru.
 * Если картинки нет/не загрузилась — брендовый плейсхолдер.
 */
export default function ProductImage({
  path,
  alt,
  className = "",
  eager = false,
}: {
  path: string | null;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const src = baseAssetUrl(path);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="flex h-full min-h-24 w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-900 to-brand-700 text-paper/50">
          <svg viewBox="0 0 40 12" className="h-6 w-24" fill="none">
            <path
              d="M1 7h5l1.5-4.5 3 9 2.5-7 1.5 3H39"
              stroke="#f28232"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="label-caps text-[10px]">MAKELSAN</span>
        </div>
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      className={`object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
