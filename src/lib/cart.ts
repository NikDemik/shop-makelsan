"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  code: string; // slug товара
  name: string;
  article: string;
  priceKopecks: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (code: string, qty: number) => void;
  remove: (code: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.code === item.code);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.code === item.code ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, qty }] };
        }),
      setQty: (code, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.code !== code)
              : state.items.map((i) => (i.code === code ? { ...i, qty } : i)),
        })),
      remove: (code) =>
        set((state) => ({ items: state.items.filter((i) => i.code !== code) })),
      clear: () => set({ items: [] }),
    }),
    { name: "makelsan-cart" }
  )
);

export const cartCount = (items: CartItem[]) =>
  items.reduce((s, i) => s + i.qty, 0);

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((s, i) => s + i.qty * i.priceKopecks, 0);
