"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveProductAction, type ProductFormState } from "@/actions/admin";

export type ProductFormData = {
  id: string;
  name: string;
  article: string | null;
  slug: string;
  priceUsd: number | null;
  priceRub: string; // текущая итоговая цена в рублях (пусто — по запросу)
  isOverridden: boolean;
};

const inputCls =
  "w-full border border-line bg-white px-4 py-2.5 text-sm outline-none transition focus:border-accent-400";

/**
 * Форма цены товара: каталог наполняется синхронизацией с API, поэтому
 * админ управляет только рублёвой ценой (пусто → «по запросу»).
 */
export default function ProductForm({ initial }: { initial: ProductFormData }) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProductAction, {});

  return (
    <form action={action} className="max-w-3xl space-y-6">
      <input type="hidden" name="id" value={initial.id} />

      <div className="border border-line bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-muted">Название</div>
            <div className="mt-1.5 text-sm font-bold">{initial.name}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-muted">Артикул</div>
            <div className="mt-1.5 font-mono text-sm">{initial.article ?? "—"}</div>
          </div>
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <div className="text-xs font-semibold text-muted">Цена в API base.sstmk.ru</div>
          <div className="mt-1.5 text-sm">
            {initial.priceUsd !== null ? (
              <span className="font-mono font-bold">${initial.priceUsd}</span>
            ) : (
              <span className="text-muted">не задана</span>
            )}
            <span className="ml-2 text-xs text-muted">
              (конвертируется по курсу ЦБ при каждой синхронизации)
            </span>
          </div>
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-semibold text-muted">
            Цена на сайте, ₽ без НДС
            {initial.isOverridden && (
              <span className="ml-2 bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                задана вручную
              </span>
            )}
          </span>
          <input
            name="priceRub"
            defaultValue={initial.priceRub}
            placeholder={initial.priceUsd !== null ? String(initial.priceRub) : "например, 24500"}
            className={`mt-1.5 ${inputCls}`}
          />
          <span className="mt-1.5 block text-xs text-muted">
            Оставьте поле пустым, чтобы показывать «Цена по запросу». Ручная цена
            сохраняется при синхронизации и имеет приоритет над ценой из API.
          </span>
        </label>
      </div>

      {state.error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">{state.error}</div>
      )}
      {state.ok && !state.error && (
        <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
          Цена сохранена.
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent-400 px-8 py-3 text-sm font-bold text-brand-950 transition hover:bg-accent-300 disabled:opacity-60"
        >
          {pending ? "Сохраняем…" : "Сохранить"}
        </button>
        <Link href="/admin/products" className="border border-line px-6 py-3 text-sm font-semibold text-muted transition hover:border-accent-400">
          Отмена
        </Link>
      </div>
    </form>
  );
}
