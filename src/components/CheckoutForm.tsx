"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCart, cartSubtotal } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

type Props = {
  user: {
    name: string;
    email: string;
    phone: string | null;
    accountType: "B2C" | "B2B";
    companyName: string | null;
    inn: string | null;
    city: string | null;
    address: string | null;
  };
};

export default function CheckoutForm({ user }: Props) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [pending, startTransition] = useTransition();

  const [type, setType] = useState<"B2C" | "B2B">(user.accountType);
  const [customerName, setCustomerName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [email, setEmail] = useState(user.email);
  const [companyName, setCompanyName] = useState(user.companyName ?? "");
  const [inn, setInn] = useState(user.inn ?? "");
  const [city, setCity] = useState(user.city ?? "");
  const [address, setAddress] = useState(user.address ?? "");
  const [delivery, setDelivery] = useState<"pickup" | "tc">("pickup");
  const [payment, setPayment] = useState<"card" | "receipt" | "invoice">(user.accountType === "B2B" ? "invoice" : "card");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const subtotal = cartSubtotal(items);
  const discount = type === "B2B" ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal - discount;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          customerName,
          phone,
          email,
          companyName,
          inn,
          city,
          address,
          delivery,
          payment,
          comment,
          items: items.map((i) => ({ code: i.code, qty: i.qty })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Не удалось создать заказ");
        return;
      }
      clear();
      router.push(`/account/orders/${data.id}?new=1`);
    });
  };

  const inputCls =
    "w-full border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent-400";

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-line bg-white px-6 py-16 text-center text-sm text-muted">
        Корзина пуста.{" "}
        <a href="/catalog" className="font-semibold text-accent-600 hover:underline">
          Перейти в каталог
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="space-y-6">
        {/* Тип покупателя */}
        <section className="border border-line bg-white p-6">
          <h2 className="text-lg font-bold">1. Покупатель</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(
              [
                { v: "B2C", t: "Физическое лицо", d: "Оплата картой или при получении" },
                { v: "B2B", t: "Организация", d: "Счёт на оплату, скидка 5%" },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => {
                  setType(o.v);
                  setPayment(o.v === "B2B" ? "invoice" : "card");
                }}
                className={`border p-4 text-left transition ${
                  type === o.v
                    ? "border-accent-400 bg-accent-400/5"
                    : "border-line hover:border-accent-400/50"
                }`}
              >
                <div className="text-sm font-bold">{o.t}</div>
                <div className="mt-1 text-xs text-muted">{o.d}</div>
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-muted">Имя и фамилия *</span>
              <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={`mt-1.5 ${inputCls}`} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted">Телефон *</span>
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (___) ___-__-__" className={`mt-1.5 ${inputCls}`} />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-muted">E-mail *</span>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-1.5 ${inputCls}`} />
            </label>
          </div>

          {type === "B2B" && (
            <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold text-muted">Наименование организации *</span>
                <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={`mt-1.5 ${inputCls}`} />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted">ИНН *</span>
                <input required value={inn} onChange={(e) => setInn(e.target.value)} className={`mt-1.5 ${inputCls}`} />
              </label>
            </div>
          )}
        </section>

        {/* Доставка */}
        <section className="border border-line bg-white p-6">
          <h2 className="text-lg font-bold">2. Доставка</h2>
          <div className="mt-4 space-y-3">
            {(
              [
                { v: "pickup", t: "Самовывоз со склада", d: "Москва, ул. Электрозаводская, д. 21, стр. 4 · бесплатно, в день оплаты" },
                { v: "tc", t: "Транспортная компания", d: "До терминала ТК в вашем городе · по тарифам перевозчика" },
              ] as const
            ).map((o) => (
              <label
                key={o.v}
                className={`flex cursor-pointer items-start gap-3 border p-4 transition ${
                  delivery === o.v ? "border-accent-400 bg-accent-400/5" : "border-line hover:border-accent-400/50"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={delivery === o.v}
                  onChange={() => setDelivery(o.v)}
                  className="mt-0.5 h-4 w-4 accent-accent-500"
                />
                <span>
                  <span className="block text-sm font-bold">{o.t}</span>
                  <span className="mt-0.5 block text-xs text-muted">{o.d}</span>
                </span>
              </label>
            ))}
          </div>

          {delivery === "tc" && (
            <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold text-muted">Город *</span>
                <input required value={city} onChange={(e) => setCity(e.target.value)} className={`mt-1.5 ${inputCls}`} />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted">Адрес / терминал *</span>
                <input required value={address} onChange={(e) => setAddress(e.target.value)} className={`mt-1.5 ${inputCls}`} />
              </label>
            </div>
          )}
        </section>

        {/* Оплата */}
        <section className="border border-line bg-white p-6">
          <h2 className="text-lg font-bold">3. Оплата</h2>
          <div className="mt-4 space-y-3">
            {(type === "B2B"
              ? [
                  { v: "invoice", t: "Счёт на оплату", d: "Безналичный расчёт по счёту, отгрузка после поступления средств" },
                  { v: "card", t: "Банковской картой онлайн", d: "Оплата на сайте после подтверждения заказа" },
                ]
              : [
                  { v: "card", t: "Банковской картой онлайн", d: "Оплата на сайте после подтверждения заказа" },
                  { v: "receipt", t: "При получении", d: "Наличными или картой при самовывозе / доставке" },
                ]
            ).map((o) => (
              <label
                key={o.v}
                className={`flex cursor-pointer items-start gap-3 border p-4 transition ${
                  payment === o.v ? "border-accent-400 bg-accent-400/5" : "border-line hover:border-accent-400/50"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={payment === o.v}
                  onChange={() => setPayment(o.v as typeof payment)}
                  className="mt-0.5 h-4 w-4 accent-accent-500"
                />
                <span>
                  <span className="block text-sm font-bold">{o.t}</span>
                  <span className="mt-0.5 block text-xs text-muted">{o.d}</span>
                </span>
              </label>
            ))}
          </div>

          <label className="mt-5 block">
            <span className="text-xs font-semibold text-muted">Комментарий к заказу</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Пожелания к документам, отгрузке, реквизиты для счёта…"
              className={`mt-1.5 ${inputCls} resize-none`}
            />
          </label>
        </section>
      </div>

      {/* Итог */}
      <div className="border border-line bg-white p-6 lg:sticky lg:top-20">
        <h2 className="text-lg font-bold">Ваш заказ</h2>
        <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
          {items.map((i) => (
            <div key={i.code} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <div className="font-medium leading-snug">{i.name}</div>
                <div className="text-xs text-muted">{i.qty} × {formatPrice(i.priceKopecks)}</div>
              </div>
              <div className="shrink-0 font-semibold">{formatPrice(i.qty * i.priceKopecks)}</div>
            </div>
          ))}
        </div>
        <dl className="mt-5 space-y-3 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Товары</dt>
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

        {error && (
          <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-5 w-full bg-accent-400 py-3.5 text-sm font-bold text-brand-950 transition hover:bg-accent-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Создаём заказ…" : "Подтвердить заказ"}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных.
          Менеджер свяжется с вами для подтверждения.
        </p>
      </div>
    </form>
  );
}
