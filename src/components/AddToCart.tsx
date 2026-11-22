"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { IconCart, IconCheck } from "@/components/icons";

type Props = {
  code: string;
  name: string;
  article: string;
  priceKopecks: number;
  compact?: boolean;
};

export default function AddToCart({ code, name, article, priceKopecks, compact }: Props) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  const handle = () => {
    add({ code, name, article, priceKopecks });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handle}
        className={`flex h-9 w-9 shrink-0 items-center justify-center transition ${
          added
            ? "bg-accent-500 text-white"
            : "bg-brand-950 text-accent-400 hover:bg-brand-800"
        }`}
        aria-label="Добавить в корзину"
      >
        {added ? <IconCheck /> : <IconCart className="h-4.5 w-4.5" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      className={`flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold transition sm:w-auto ${
        added
          ? "bg-accent-600 text-white"
          : "bg-accent-400 text-brand-950 hover:bg-accent-300"
      }`}
    >
      {added ? (
        <>
          <IconCheck className="h-4.5 w-4.5" /> Добавлено в корзину
        </>
      ) : (
        <>
          <IconCart className="h-4.5 w-4.5" /> Добавить в корзину
        </>
      )}
    </button>
  );
}
