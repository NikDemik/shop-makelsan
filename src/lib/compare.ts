"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Лимит товаров в сравнении */
export const COMPARE_LIMIT = 4;

/** Товар в сравнении: минимум данных для добавления из карточки или страницы товара */
export type CompareItem = {
  slug: string;
  name: string;
  article: string;
  powerKva: number | null;
  type: string | null;
  priceKopecks: number | null;
  seriesName: string | null;
};

type CompareState = {
  items: CompareItem[];
  toggle: (item: CompareItem) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

export const useCompare = create<CompareState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (item) =>
        set((state) => {
          const existing = state.items.some((i) => i.slug === item.slug);
          if (existing) {
            return { items: state.items.filter((i) => i.slug !== item.slug) };
          }
          if (state.items.length >= COMPARE_LIMIT) return { items: state.items };
          return { items: [...state.items, item] };
        }),
      remove: (slug) =>
        set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),
      clear: () => set({ items: [] }),
    }),
    { name: "makelsan-compare" }
  )
);
