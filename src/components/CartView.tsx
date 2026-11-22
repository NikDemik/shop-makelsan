"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, cartSubtotal } from "@/lib/cart";
import { formatPrice, formatPriceShort } from "@/lib/format";
import { IconMinus, IconPlus, IconClose, IconArrowRight } from "@/components/icons";
import ProductImage from "@/components/ProductImage";

export default function CartView({
  isB2B,
  loggedIn,
}: {
  isB2B: boolean;
  loggedIn: boolean;
}) {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const [images, setImages] = useState<Record<string, string>>({});

  // Картинки товаров корзины подтягиваем с сервера по слагам
  useEffect(() => {
    const slugs = items.map((i) => i.code);
    if (!slugs.length) {
      setImages({});
      return;
    }
    let alive = true;
    fetch("/api/cart-images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.images) setImages(d.images);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [items]);

  const subtotal = cartSubtotal(items);
  const discount = isB2B ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal - discount;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-line bg-white px-6 py-20 text-center">
        <div className="text-lg font-bold">Корзина пуста</div>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Выберите источник бесперебойного питания в каталоге — добавим его сюда.
        </p>
        <Link
          href="/catalog"
          className="mt-6 flex items-center gap-2 bg-accent-400 px-6 py-3 text-sm font-bold text-brand-950 transition hover:bg-accent-300"
        >
          Перейти в каталог <IconArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
      <div className="border border-line bg-white">
        {items.map((i) => (
          <div key={i.code} className="flex flex-wrap items-center gap-4 border-b border-line p-5 last:border-0">
            <Link href={`/product/${i.code}`} className="shrink-0 bg-paper p-2">
              <ProductImage path={images[i.code] ?? null} alt={i.name} className="h-16 w-20" />
            </Link>
            <div className="min-w-40 flex-1">
              <Link href={`/product/${i.code}`} className="text-sm font-bold leading-snug transition hover:text-accent-600">
                {i.name}
              </Link>
              <div className="mt-1 text-xs text-muted">арт. {i.article}</div>
              <div className="mt-1 text-xs text-muted">{formatPrice(i.priceKopecks)} / шт</div>
            </div>
            <div className="flex items-center border border-line">
              <button
                type="button"
                onClick={() => setQty(i.code, i.qty - 1)}
                className="flex h-9 w-9 items-center justify-center text-muted transition hover:text-accent-600"
                aria-label="Уменьшить"
              >
                <IconMinus />
              </button>
              <span className="w-10 text-center text-sm font-bold">{i.qty}</span>
              <button
                type="button"
                onClick={() => setQty(i.code, i.qty + 1)}
                className="flex h-9 w-9 items-center justify-center text-muted transition hover:text-accent-600"
                aria-label="Увеличить"
              >
                <IconPlus />
              </button>
            </div>
            <div className="w-28 text-right text-sm font-extrabold">
              {formatPriceShort(i.qty * i.priceKopecks)}
            </div>
            <button
              type="button"
              onClick={() => remove(i.code)}
              className="text-muted transition hover:text-red-500"
              aria-label="Удалить"
            >
              <IconClose />
            </button>
          </div>
        ))}
      </div>

      <div className="border border-line bg-white p-6">
        <h2 className="text-lg font-bold">Итого</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Товары ({items.reduce((s, i) => s + i.qty, 0)})</dt>
            <dd className="font-medium">{formatPrice(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-accent-600">
              <dt>Скидка B2B (5%)</dt>
              <dd className="font-medium">−{formatPrice(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-line pt-3 text-base">
            <dt className="font-bold">К оплате</dt>
            <dd className="font-extrabold">{formatPrice(total)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted">Цены указаны без НДС. Стоимость доставки рассчитывается отдельно.</p>

        {loggedIn ? (
          <Link
            href="/checkout"
            className="mt-5 flex w-full items-center justify-center gap-2 bg-accent-400 py-3.5 text-sm font-bold text-brand-950 transition hover:bg-accent-300"
          >
            Оформить заказ <IconArrowRight />
          </Link>
        ) : (
          <div className="mt-5 space-y-2.5">
            <Link
              href="/login?next=/checkout"
              className="flex w-full items-center justify-center bg-accent-400 py-3.5 text-sm font-bold text-brand-950 transition hover:bg-accent-300"
            >
              Войти и оформить заказ
            </Link>
            <Link
              href="/register?next=/checkout"
              className="flex w-full items-center justify-center border border-line py-3 text-sm font-semibold text-ink transition hover:border-accent-400"
            >
              Зарегистрироваться
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
