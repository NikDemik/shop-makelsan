"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useCompare } from "@/lib/compare";
import ProductImage from "@/components/ProductImage";
import {
  formatKva,
  formatPower,
  formatPrice,
  formatPriceShort,
  pluralGoods,
  UPS_TYPE_LABELS,
} from "@/lib/format";
import { IconClose } from "@/components/icons";

type CompareProduct = {
  slug: string;
  name: string;
  article: string | null;
  powerKva: number | null;
  powerKw: number | null;
  type: string | null;
  phasesIn: number | null;
  phasesOut: number | null;
  priceKopecks: number | null;
  regularPriceKopecks: number | null;
  image: string | null;
  deliveryDays: number | null;
  seriesName: string | null;
  seriesSlug: string | null;
  specs: Record<string, string>;
};

const dash = (v: ReactNode) => <span className="text-muted">—</span>;

/** Базовые строки таблицы сравнения (до характеристик из specs) */
const BASE_ROWS: { label: string; value: (p: CompareProduct) => ReactNode }[] = [
  { label: "Артикул", value: (p) => p.article ?? dash(null) },
  {
    label: "Мощность, кВА",
    value: (p) => (p.powerKva !== null ? formatKva(p.powerKva) : dash(null)),
  },
  {
    label: "Мощность, кВт",
    value: (p) => (p.powerKw !== null ? formatPower(p.powerKw) : dash(null)),
  },
  {
    label: "Тип",
    value: (p) => (p.type ? (UPS_TYPE_LABELS[p.type] ?? p.type) : dash(null)),
  },
  {
    label: "Фазы вход / выход",
    value: (p) => `${p.phasesIn ?? "—"} / ${p.phasesOut ?? "—"}`,
  },
  {
    label: "Срок поставки",
    value: (p) => (p.deliveryDays !== null ? `${p.deliveryDays} дн.` : dash(null)),
  },
];

export default function CompareView() {
  const items = useCompare((s) => s.items);
  const remove = useCompare((s) => s.remove);
  const clear = useCompare((s) => s.clear);
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  const slugsKey = items.map((i) => i.slug).join(",");

  useEffect(() => {
    if (!mounted) return;
    const slugs = slugsKey ? slugsKey.split(",") : [];
    if (!slugs.length) {
      setProducts([]);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs }),
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, slugsKey]);

  // Объединённый набор характеристик в порядке первого появления
  const specKeys = useMemo(() => {
    const keys: string[] = [];
    for (const p of products) {
      for (const k of Object.keys(p.specs ?? {})) {
        if (!keys.includes(k)) keys.push(k);
      }
    }
    return keys;
  }, [products]);

  if (!mounted) {
    return <div className="h-96 animate-pulse bg-white" />;
  }

  if (items.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 border border-dashed border-line bg-white text-sm text-muted">
        В сравнении пока нет товаров — добавьте их кнопкой «К сравнению»
        на карточках каталога или страницах моделей.
        <Link
          href="/catalog"
          className="bg-brand-950 px-4 py-2 text-sm font-semibold text-paper transition hover:bg-brand-800"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted">
          {loading
            ? "Загружаем характеристики…"
            : `Сравнивается ${items.length} ${pluralGoods(items.length)}`}
        </span>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-muted transition hover:text-accent-600"
        >
          Очистить сравнение
        </button>
      </div>

      <div className="mt-4 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr>
              <th className="w-36 align-bottom" aria-label="Параметр" />
              {products.map((p) => (
                <th
                  key={p.slug}
                  className="w-52 min-w-52 border-b border-line p-4 text-left align-top font-normal"
                >
                  <div className="flex items-start justify-between gap-2">
                    {p.seriesSlug ? (
                      <Link
                        href={`/catalog/${p.seriesSlug}`}
                        className="label-caps text-accent-600 transition hover:text-accent-500"
                      >
                        {p.seriesName ?? "ИБП Makelsan"}
                      </Link>
                    ) : (
                      <span className="label-caps text-muted">ИБП Makelsan</span>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(p.slug)}
                      aria-label={`Убрать ${p.name} из сравнения`}
                      title="Убрать из сравнения"
                      className="shrink-0 text-muted transition hover:text-accent-600"
                    >
                      <IconClose className="h-4 w-4" />
                    </button>
                  </div>
                  <Link
                    href={`/product/${p.slug}`}
                    className="mt-2 flex h-32 items-center justify-center"
                  >
                    <ProductImage path={p.image} alt={p.name} className="h-full w-full" />
                  </Link>
                  <Link
                    href={`/product/${p.slug}`}
                    className="mt-3 block text-sm font-bold leading-snug text-ink transition hover:text-accent-600"
                  >
                    {p.name}
                  </Link>
                  <div className="mt-2 leading-tight">
                    {p.priceKopecks !== null ? (
                      p.regularPriceKopecks !== null ? (
                        <>
                          <div className="text-lg font-extrabold tracking-tight text-accent-600">
                            {formatPriceShort(p.priceKopecks)}
                          </div>
                          <div className="text-xs text-muted line-through">
                            {formatPrice(p.regularPriceKopecks)}
                          </div>
                        </>
                      ) : (
                        <div className="text-lg font-extrabold tracking-tight">
                          {formatPriceShort(p.priceKopecks)}
                        </div>
                      )
                    ) : (
                      <span className="text-sm font-semibold text-muted">Цена по запросу</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BASE_ROWS.map((row) => (
              <tr key={row.label} className="border-b border-line last:border-0">
                <td className="p-4 align-top text-muted">{row.label}</td>
                {products.map((p) => (
                  <td key={p.slug} className="p-4 align-top font-medium">
                    {row.value(p)}
                  </td>
                ))}
              </tr>
            ))}
            {specKeys.map((key) => (
              <tr key={key} className="border-b border-line last:border-0">
                <td className="p-4 align-top text-muted">{key}</td>
                {products.map((p) => {
                  const v = p.specs?.[key];
                  return (
                    <td key={p.slug} className="p-4 align-top font-medium">
                      {v ? v : <span className="text-muted">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
