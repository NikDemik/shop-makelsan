"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cartCount, useCart } from "@/lib/cart";
import { IconCart } from "@/components/icons";

export default function CartLinkClient() {
  const items = useCart((s) => s.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = mounted ? cartCount(items) : 0;

  return (
    <Link
      href="/cart"
      className="relative flex items-center border border-white/15 px-3 py-2 text-paper/85 transition hover:border-accent-400/60 hover:text-accent-400"
      aria-label="Корзина"
    >
      <IconCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-400 px-1 text-[11px] font-bold text-brand-950">
          {count}
        </span>
      )}
    </Link>
  );
}
