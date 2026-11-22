"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ProductImage from "@/components/ProductImage";
import { baseAssetUrl } from "@/lib/seo";
import {
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconExpand,
} from "@/components/icons";

/** Галерея товара: главное фото + миниатюры; клик по главному фото — просмотр в модальном окне */
export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  // Модальное окно открывается только когда у текущего фото есть источник
  const hasCurrent = Boolean(baseAssetUrl(images[active] ?? null));

  const closeLightbox = useCallback(() => setLightbox(false), []);
  const step = useCallback(
    (dir: 1 | -1) => setActive((a) => (a + dir + images.length) % images.length),
    [images.length]
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (images.length > 1) {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }
    };
    document.addEventListener("keydown", onKey);
    // Блокируем прокрутку страницы под окном
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, images.length, closeLightbox, step]);

  return (
    <div>
      <div className="group relative flex h-72 items-center justify-center border border-line bg-white p-6 sm:h-96">
        <button
          type="button"
          onClick={() => hasCurrent && setLightbox(true)}
          disabled={!hasCurrent}
          aria-label="Открыть фото в полном размере"
          aria-haspopup="dialog"
          className={`h-full w-full ${hasCurrent ? "cursor-zoom-in" : "cursor-default"}`}
        >
          <ProductImage path={images[active] ?? null} alt={name} eager className="h-full w-full" />
        </button>
        {hasCurrent && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-3 flex h-8 w-8 items-center justify-center border border-line bg-white/90 text-muted opacity-0 transition group-hover:opacity-100"
          >
            <IconExpand />
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Фото ${i + 1}`}
              className={`h-16 w-20 overflow-hidden border-2 bg-white p-1 transition ${
                active === i ? "border-accent-400" : "border-line hover:border-accent-400/50"
              }`}
            >
              <ProductImage path={img} alt={`${name} — фото ${i + 1}`} className="h-full w-full" />
            </button>
          ))}
        </div>
      )}

      {/* Модалка через портал в body: reveal-обёртки вокруг галереи создают
          containing block и обрезали бы fixed-окно */}
      {lightbox &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Просмотр фото: ${name}`}
            className="lightbox-overlay fixed inset-0 z-[70] flex flex-col bg-brand-950/85 p-4 backdrop-blur-sm sm:p-6"
            onClick={closeLightbox}
          >
          <div
            className="mx-auto flex h-full w-full max-w-5xl flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Шапка окна: название, счётчик, закрытие */}
            <div className="flex items-center justify-between gap-4 pb-3 text-paper">
              <span className="truncate text-xs font-semibold uppercase tracking-[0.08em] text-paper/70">
                {name}
              </span>
              <div className="flex items-center gap-3">
                {images.length > 1 && (
                  <span className="text-xs font-semibold text-paper/60">
                    {active + 1} / {images.length}
                  </span>
                )}
                <button
                  type="button"
                  onClick={closeLightbox}
                  aria-label="Закрыть просмотр"
                  autoFocus
                  className="flex h-9 w-9 items-center justify-center border border-white/20 text-paper/80 transition hover:border-accent-400 hover:text-accent-400"
                >
                  <IconClose className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Фото + стрелки */}
            <div className="flex min-h-0 flex-1 items-center gap-3">
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Предыдущее фото"
                  className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/20 text-paper/80 transition hover:border-accent-400 hover:text-accent-400"
                >
                  <IconChevronLeft />
                </button>
              )}
              <div
                key={active}
                className="lightbox-img flex min-h-0 flex-1 items-center justify-center"
              >
                <ProductImage
                  path={images[active] ?? null}
                  alt={`${name} — фото ${active + 1}`}
                  eager
                  className="max-h-[80vh] w-auto max-w-full object-contain"
                />
              </div>
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Следующее фото"
                  className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/20 text-paper/80 transition hover:border-accent-400 hover:text-accent-400"
                >
                  <IconChevronRight />
                </button>
              )}
            </div>
          </div>
          </div>,
          document.body
        )}
    </div>
  );
}
