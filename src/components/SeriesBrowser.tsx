"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { formatKva, formatPriceShort, pluralModels } from "@/lib/format";

export type SeriesProduct = {
  slug: string;
  article: string | null;
  name: string;
  powerKva: number | null;
  type: string | null;
  priceKopecks: number | null;
  saleKopecks: number | null;
  image: string | null;
};

type Props = {
  seriesName: string;
  seriesSlug: string;
  products: SeriesProduct[];
};

const CHIP = "flex items-center gap-1.5 border px-3 py-1.5 text-sm font-semibold transition";
const CHIP_ON = "border-brand-950 bg-brand-950 text-accent-400";
const CHIP_OFF = "border-line bg-white text-ink hover:border-accent-400";

const typeShort = (t: string | null) =>
  t === "двойного преобразования (on-line)" ? "On-line"
  : t === "линейно-интерактивный (line-interactive)" ? "Line-interactive"
  : (t ?? "—");

export default function SeriesBrowser({ seriesName, seriesSlug, products }: Props) {
  const sp = useSearchParams();
  const [power, setPower] = useState(() => sp.get("power") ?? "");
  const [type, setType] = useState(() => sp.get("type") ?? "");
  const [priced, setPriced] = useState(() => sp.get("priced") === "1");
  const [sort, setSort] = useState(() => sp.get("sort") ?? "power");

  // Фильтры дублируются в URL (без перезагрузки страницы), чтобы подбором можно было поделиться ссылкой
  const syncUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  };

  const togglePower = (kva: string) => {
    const next = power === kva ? "" : kva;
    setPower(next);
    syncUrl({ power: next || null });
  };

  const toggleType = (t: string) => {
    const next = type === t ? "" : t;
    setType(next);
    syncUrl({ type: next || null });
  };

  const togglePriced = () => {
    const next = !priced;
    setPriced(next);
    syncUrl({ priced: next ? "1" : null });
  };

  const changeSort = (s: string) => {
    setSort(s);
    syncUrl({ sort: s === "power" ? null : s });
  };

  const reset = () => {
    setPower("");
    setType("");
    setPriced(false);
    setSort("power");
    syncUrl({ power: null, type: null, priced: null, sort: null });
  };

  const selectPowerFromTable = (kva: string) => {
    setPower(kva);
    syncUrl({ power: kva });
    document.getElementById("series-filter")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Модели без мощности убираем в конец списка
  const ordered = useMemo(() => {
    const drives = products.filter((p) => (p.powerKva ?? 0) > 0);
    const extras = products.filter((p) => (p.powerKva ?? 0) === 0);
    return [...drives, ...extras];
  }, [products]);

  const powers = useMemo(() => {
    const map = new Map<number, number>();
    for (const p of products) {
      const kva = p.powerKva ?? 0;
      if (kva > 0) map.set(kva, (map.get(kva) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [products]);

  const types = useMemo(
    () => [...new Set(products.map((p) => typeShort(p.type)).filter((t) => t && t !== "—"))].sort(),
    [products]
  );

  const filtered = useMemo(() => {
    const list = ordered.filter(
      (p) =>
        (!power || String(p.powerKva) === power) &&
        (!type || typeShort(p.type) === type) &&
        (!priced || p.priceKopecks !== null)
    );
    if (sort === "price-asc") {
      return [...list].sort(
        (a, b) => (a.priceKopecks ?? Infinity) - (b.priceKopecks ?? Infinity)
      );
    }
    if (sort === "price-desc") {
      return [...list].sort(
        (a, b) => (b.priceKopecks ?? -Infinity) - (a.priceKopecks ?? -Infinity)
      );
    }
    return list;
  }, [ordered, power, type, priced, sort]);

  const hasFilters = Boolean(power || type || priced) || sort !== "power";
  const seriesShort = seriesName.split(" ")[0];

  if (products.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-3 border border-dashed border-line bg-white text-sm text-muted">
        Модели этой серии сейчас в обновлении каталога.
        <Link
          href="/contacts"
          className="border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent-400"
        >
          Запросить подбор
        </Link>
      </div>
    );
  }

  return (
    <div>
      <section
        id="series-filter"
        className="scroll-mt-24 border border-line bg-white p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Подбор по мощности</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">
              Найдено: <span className="font-bold text-ink">{filtered.length}</span>{" "}
              {pluralModels(filtered.length)}
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={reset}
                className="text-xs text-muted transition hover:text-accent-600"
              >
                Сбросить
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setPower("");
              syncUrl({ power: null });
            }}
            className={`${CHIP} ${!power ? CHIP_ON : CHIP_OFF}`}
          >
            Все
          </button>
          {powers.map(([kva, count]) => {
            const active = String(kva) === power;
            return (
              <button
                key={kva}
                type="button"
                onClick={() => togglePower(String(kva))}
                className={`${CHIP} ${active ? CHIP_ON : CHIP_OFF}`}
              >
                {formatKva(kva)}
                <span
                  className={`text-xs font-normal ${active ? "text-accent-400/70" : "text-muted"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Тип</span>
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                className={`${CHIP} ${t === type ? CHIP_ON : CHIP_OFF}`}
              >
                {t}
              </button>
            ))}
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={priced}
              onChange={togglePriced}
              className="h-4 w-4 rounded border-line accent-accent-500"
            />
            Только с ценой
          </label>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Сортировка</span>
            <select
              value={sort}
              onChange={(e) => changeSort(e.target.value)}
              className="border border-line bg-paper px-2.5 py-2 text-sm outline-none focus:border-accent-400"
            >
              <option value="power">По мощности</option>
              <option value="price-asc">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
            </select>
          </div>
        </div>
      </section>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p, i) => (
            <ProductCard
              key={p.slug}
              revealDelay={(i % 4) * 60}
              p={{ ...p, seriesName: seriesShort, seriesSlug }}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-3 border border-dashed border-line bg-white py-14 text-center">
          <span className="text-sm text-muted">Под выбранные фильтры ничего не найдено.</span>
          <button
            type="button"
            onClick={reset}
            className="border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent-400"
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      <section className="mt-12 border border-line bg-white p-6 sm:p-8" data-reveal="up">
        <h2 className="text-lg font-bold">Все модели серии {seriesName}</h2>
        <p className="mt-2 text-sm text-muted">
          Мощность, тип и цены. Нажмите на мощность, чтобы отфильтровать каталог,
          или на модель — чтобы перейти к характеристикам.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wider text-muted">
                <th className="py-2.5 pr-4">Мощность</th>
                <th className="py-2.5 pr-4">Модель</th>
                <th className="py-2.5 pr-4">Тип</th>
                <th className="py-2.5 pr-4">Артикул</th>
                <th className="py-2.5 text-right">Цена</th>
              </tr>
            </thead>
            <tbody>
              {ordered.map((p) => (
                <tr
                  key={p.slug}
                  className="border-b border-line transition last:border-0 hover:bg-paper"
                >
                  <td className="whitespace-nowrap py-2.5 pr-4 font-semibold">
                    {(p.powerKva ?? 0) > 0 ? (
                      <button
                        type="button"
                        onClick={() => selectPowerFromTable(String(p.powerKva))}
                        className="text-accent-600 transition hover:text-accent-500"
                      >
                        {formatKva(p.powerKva!)}
                      </button>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4">
                    <Link
                      href={`/product/${p.slug}`}
                      className="transition hover:text-accent-600"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-4 text-muted">{typeShort(p.type)}</td>
                  <td className="whitespace-nowrap py-2.5 pr-4 text-muted">{p.article ?? "—"}</td>
                  <td className="whitespace-nowrap py-2.5 text-right font-bold">
                    {p.priceKopecks !== null ? (
                      p.saleKopecks !== null ? (
                        <span className="text-accent-600">{formatPriceShort(p.saleKopecks)}</span>
                      ) : (
                        formatPriceShort(p.priceKopecks)
                      )
                    ) : (
                      <Link
                        href={`/product/${p.slug}`}
                        className="text-sm font-semibold text-accent-600 transition hover:text-accent-500"
                      >
                        По запросу
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
