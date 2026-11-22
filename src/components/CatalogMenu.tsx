"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconArrowRight } from "@/components/icons";

export type CatalogSeriesLink = { slug: string; name: string };
export type CatalogCategory = { label: string; series: CatalogSeriesLink[] };

/**
 * Кнопка «Каталог» в шапке с выпадающим меню: категории по мощности -> серии.
 * Клик по надписи ведёт на /catalog; панель раскрывается при наведении.
 * Клик по шеврону «закрепляет» панель (не закрывается при уходе курсора),
 * повторный клик закрывает. Также закрывается по клику вне и по Escape.
 */
export default function CatalogMenu({ categories }: { categories: CatalogCategory[] }) {
  const [open, setOpen] = useState(false);
  const pinnedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const closeAll = () => {
    pinnedRef.current = false;
    setOpen(false);
  };

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) closeAll();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  const openNow = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => {
      if (!pinnedRef.current) setOpen(false);
    }, 150);
  };
  const togglePin = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    if (open && pinnedRef.current) {
      pinnedRef.current = false;
      setOpen(false);
    } else {
      pinnedRef.current = true;
      setOpen(true);
    }
  };

  return (
    <div ref={rootRef} className="relative" onMouseEnter={openNow} onMouseLeave={scheduleClose}>
      <div className="flex items-center gap-1">
        <Link
          href="/catalog"
          className={`font-semibold transition ${open ? "text-accent-400" : "hover:text-accent-400"}`}
        >
          Каталог
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-label="Открыть меню каталога"
          onClick={togglePin}
          className={`transition ${open ? "text-accent-400" : "text-paper/50 hover:text-accent-400"}`}
        >
          <IconChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-full z-50 pt-3">
          <div className="w-[min(720px,calc(100vw-4rem))] border border-line bg-white p-6 text-ink shadow-[0_16px_40px_rgba(10,14,20,0.25)]">
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-3">
              {categories.map((cat) => (
                <div key={cat.label}>
                  <div className="label-caps text-accent-600">{cat.label}</div>
                  <ul className="mt-2 space-y-0.5 text-sm">
                    {cat.series.map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={`/catalog/${s.slug}`}
                          onClick={() => setOpen(false)}
                          className="block py-1 text-muted transition hover:text-accent-600"
                        >
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <Link
                href="/catalog"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-sm font-bold text-accent-600 transition hover:text-accent-500"
              >
                Весь каталог <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
