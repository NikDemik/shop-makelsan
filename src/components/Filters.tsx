"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type SeriesOpt = { slug: string; name: string; count: number };

const TYPE_OPTIONS = [
  { value: "on-line", label: "On-line (двойное преобразование)", match: "двойного преобразования" },
  { value: "line-interactive", label: "Линейно-интерактивный", match: "линейно-интерактивный" },
];

const POWER_STEPS = ["0.45", "1", "3", "10", "20", "60", "200", "600"];

export default function Filters({ seriesList }: { seriesList: SeriesOpt[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const [selected, setSelected] = useState<string[]>(
    sp.get("series")?.split(",").filter(Boolean) ?? []
  );
  const [type, setType] = useState(sp.get("type") ?? "");
  const [minPower, setMinPower] = useState(sp.get("pmin") ?? "");
  const [maxPower, setMaxPower] = useState(sp.get("pmax") ?? "");
  const [priced, setPriced] = useState(sp.get("priced") === "1");
  const [showAllSeries, setShowAllSeries] = useState(false);

  const apply = () => {
    const params = new URLSearchParams();
    if (selected.length) params.set("series", selected.join(","));
    if (type) params.set("type", type);
    if (minPower) params.set("pmin", minPower);
    if (maxPower) params.set("pmax", maxPower);
    if (priced) params.set("priced", "1");
    const sort = sp.get("sort");
    if (sort) params.set("sort", sort);
    router.push(`/catalog${params.toString() ? `?${params}` : ""}`);
  };

  const reset = () => {
    setSelected([]);
    setType("");
    setMinPower("");
    setMaxPower("");
    setPriced(false);
    setShowAllSeries(false);
    router.push("/catalog");
  };

  const toggleSeries = (slug: string) =>
    setSelected((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]));

  const visibleSeries = showAllSeries ? seriesList : seriesList.slice(0, 10);

  return (
    <aside className="border border-line bg-white p-6">
      <div className="flex items-center justify-between">
        <span className="label-caps text-ink">Фильтры</span>
        <button type="button" onClick={reset} className="text-xs text-muted transition hover:text-accent-600">
          Сбросить
        </button>
      </div>

      <div className="mt-6">
        <div className="text-xs font-bold uppercase tracking-wider text-muted">Серии</div>
        <div className="mt-3 space-y-2">
          {visibleSeries.map((s) => (
            <label key={s.slug} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(s.slug)}
                onChange={() => toggleSeries(s.slug)}
                className="h-4 w-4 rounded border-line accent-accent-500"
              />
              <span className="flex-1">{s.name}</span>
              <span className="text-xs text-muted">{s.count}</span>
            </label>
          ))}
          {seriesList.length > 10 && (
            <button
              type="button"
              onClick={() => setShowAllSeries((v) => !v)}
              className="text-xs font-semibold text-accent-600 transition hover:text-accent-500"
            >
              {showAllSeries ? "Свернуть" : `Показать все серии (${seriesList.length})`}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <div className="text-xs font-bold uppercase tracking-wider text-muted">Тип ИБП</div>
        <div className="mt-3 space-y-2">
          {TYPE_OPTIONS.map((t) => (
            <label key={t.value} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="radio"
                name="type"
                checked={type === t.value}
                onChange={() => setType(type === t.value ? "" : t.value)}
                className="h-4 w-4 border-line accent-accent-500"
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <div className="text-xs font-bold uppercase tracking-wider text-muted">Мощность, кВА</div>
        <div className="mt-3 flex items-center gap-2">
          <select
            value={minPower}
            onChange={(e) => setMinPower(e.target.value)}
            className="w-full border border-line bg-paper px-2.5 py-2 text-sm outline-none focus:border-accent-400"
          >
            <option value="">от</option>
            {POWER_STEPS.map((v) => (
              <option key={v} value={v}>{v.replace(".", ",")}</option>
            ))}
          </select>
          <span className="text-muted">—</span>
          <select
            value={maxPower}
            onChange={(e) => setMaxPower(e.target.value)}
            className="w-full border border-line bg-paper px-2.5 py-2 text-sm outline-none focus:border-accent-400"
          >
            <option value="">до</option>
            {POWER_STEPS.map((v) => (
              <option key={v} value={v}>{v.replace(".", ",")}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={priced}
            onChange={(e) => setPriced(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-accent-500"
          />
          Только с ценой
        </label>
      </div>

      <button
        type="button"
        onClick={apply}
        className="mt-6 w-full bg-brand-950 py-3 text-sm font-bold text-accent-400 transition hover:bg-brand-800"
      >
        Применить
      </button>
    </aside>
  );
}
