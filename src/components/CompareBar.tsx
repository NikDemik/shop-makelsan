"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCompare } from "@/lib/compare";
import { pluralGoods } from "@/lib/format";
import { IconCompare, IconClose } from "@/components/icons";

/**
 * Плавающая плашка сравнения: появляется внизу, когда в сравнении есть товары.
 * На самой странице сравнения не показывается.
 */
export default function CompareBar() {
  const items = useCompare((s) => s.items);
  const clear = useCompare((s) => s.clear);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || pathname === "/compare" || items.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(560px,calc(100%-2rem))] -translate-x-1/2 border border-line bg-white shadow-[0_16px_40px_rgba(10,14,20,0.25)]">
      <div className="flex items-center gap-3 px-4 py-3">
        <IconCompare className="h-5 w-5 shrink-0 text-accent-600" />
        <span className="text-sm text-muted">
          В сравнении: <span className="font-bold text-ink">{items.length}</span>{" "}
          {pluralGoods(items.length)}
        </span>
        <Link
          href="/compare"
          className="ml-auto bg-accent-400 px-4 py-2 text-sm font-bold text-brand-950 transition hover:bg-accent-300"
        >
          Перейти к сравнению
        </Link>
        <button
          type="button"
          onClick={clear}
          aria-label="Очистить сравнение"
          title="Очистить сравнение"
          className="flex h-8 w-8 shrink-0 items-center justify-center text-muted transition hover:text-accent-600"
        >
          <IconClose className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
