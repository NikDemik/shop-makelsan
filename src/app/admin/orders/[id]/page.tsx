import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import { updateOrderStatusAction } from "@/actions/admin";
import { formatDateTime, formatPrice, DELIVERY_LABELS, PAYMENT_LABELS, ORDER_STATUS_LABELS } from "@/lib/format";

type Params = Promise<{ id: string }>;

export default async function AdminOrderDetail({ params }: { params: Params }) {
  const order = await prisma.order.findUnique({
    where: { id: (await params).id },
    include: { items: true, user: true },
  });
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-muted transition hover:text-accent-600">
        ← Все заказы
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <h1 className="font-mono text-2xl heading-caps">{order.number}</h1>
        <StatusBadge status={order.status} />
        <span className="text-sm text-muted">{formatDateTime(order.createdAt)}</span>
        <span className={`px-2.5 py-0.5 text-xs font-semibold ${
          order.type === "B2B" ? "bg-violet-50 text-violet-700" : "bg-sky-50 text-sky-700"
        }`}>
          {order.type}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="overflow-hidden border border-line bg-white">
          <div className="border-b border-line px-5 py-4 text-sm font-bold">Состав заказа</div>
          {order.items.map((it) => (
            <div key={it.id} className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4 last:border-0">
              <div className="flex-1">
                <div className="text-sm font-medium leading-snug">{it.name}</div>
                <div className="mt-0.5 font-mono text-xs text-muted">{it.code}</div>
              </div>
              <div className="text-sm text-muted">{it.qty} × {formatPrice(it.priceKopecks)}</div>
              <div className="w-28 text-right text-sm font-bold">{formatPrice(it.qty * it.priceKopecks)}</div>
            </div>
          ))}
          <div className="space-y-2 bg-paper px-5 py-4 text-sm">
            <div className="flex justify-between text-muted">
              <span>Товары</span>
              <span>{formatPrice(order.totalKopecks + order.discountKopecks)}</span>
            </div>
            {order.discountKopecks > 0 && (
              <div className="flex justify-between text-accent-600">
                <span>Скидка B2B (5%)</span>
                <span>−{formatPrice(order.discountKopecks)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold">
              <span>Итого</span>
              <span>{formatPrice(order.totalKopecks)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <form action={updateOrderStatusAction} className="border border-line bg-white p-5">
            <input type="hidden" name="id" value={order.id} />
            <label className="block text-xs font-bold uppercase tracking-wider text-muted">
              Статус заказа
            </label>
            <div className="mt-2.5 flex gap-2">
              <select
                key={order.status}
                name="status"
                defaultValue={order.status}
                className="flex-1 border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-accent-400"
              >
                {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-accent-400 px-4 py-2.5 text-sm font-bold text-brand-950 transition hover:bg-accent-300"
              >
                ОК
              </button>
            </div>
          </form>

          <div className="border border-line bg-white p-5 text-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-muted">Клиент</div>
            <div className="mt-3 space-y-1.5">
              <div className="font-medium">{order.customerName}</div>
              <div className="text-muted">{order.phone}</div>
              <div className="text-muted">{order.email}</div>
              {order.user && (
                <div className="text-xs text-muted">
                  Аккаунт: {order.user.email}
                  {order.user.accountType === "B2B" ? " (B2B)" : ""}
                </div>
              )}
            </div>
            {order.companyName && (
              <>
                <div className="mt-4 border-t border-line pt-4 text-xs font-bold uppercase tracking-wider text-muted">Организация</div>
                <div className="mt-2 space-y-1">
                  <div className="font-medium">{order.companyName}</div>
                  <div className="text-muted">ИНН: {order.inn}</div>
                </div>
              </>
            )}
            <div className="mt-4 border-t border-line pt-4 text-xs font-bold uppercase tracking-wider text-muted">
              Доставка и оплата
            </div>
            <div className="mt-2 space-y-1">
              <div className="font-medium">{DELIVERY_LABELS[order.delivery] ?? order.delivery}</div>
              {(order.city || order.address) && (
                <div className="text-muted">{[order.city, order.address].filter(Boolean).join(", ")}</div>
              )}
              <div className="text-muted">{PAYMENT_LABELS[order.payment] ?? order.payment}</div>
            </div>
            {order.comment && (
              <>
                <div className="mt-4 border-t border-line pt-4 text-xs font-bold uppercase tracking-wider text-muted">Комментарий</div>
                <p className="mt-2 text-muted">{order.comment}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
