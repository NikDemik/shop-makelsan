import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import StatusBadge from "@/components/StatusBadge";
import { formatDateTime, formatPrice, DELIVERY_LABELS, PAYMENT_LABELS } from "@/lib/format";
import { IconCheck } from "@/components/icons";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const TIMELINE = ["NEW", "CONFIRMED", "PAID", "SHIPPED", "COMPLETED"] as const;

export default async function AccountOrderDetail({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const isNew = sp.new === "1";

  const order = await prisma.order.findUnique({
    where: { id: (await params).id },
    include: { items: true },
  });
  if (!order || order.userId !== session.uid) notFound();

  const currentIdx = TIMELINE.indexOf(order.status as (typeof TIMELINE)[number]);

  return (
    <div>
      {isNew && (
        <div className="mb-6 flex items-start gap-3 border border-accent-400/40 bg-accent-400/10 p-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-accent-400 text-brand-950">
            <IconCheck />
          </span>
          <div>
            <div className="font-bold">Заказ {order.number} принят!</div>
            <div className="mt-1 text-sm text-muted">
              Менеджер свяжется с вами по телефону {order.phone} для подтверждения.
              {order.payment === "invoice"
                ? " Счёт на оплату будет направлен на указанный e-mail."
                : ""}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-mono text-2xl heading-caps">{order.number}</h1>
        <StatusBadge status={order.status} />
        <span className="text-sm text-muted">от {formatDateTime(order.createdAt)}</span>
      </div>

      {/* Статусная шкала */}
      {order.status !== "CANCELLED" && (
        <div className="mt-6 border border-line bg-white p-6">
          <div className="flex items-center">
            {TIMELINE.map((s, i) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-8 w-8 items-center justify-center border text-xs font-bold ${
                      i <= currentIdx
                        ? "border-accent-400 bg-accent-400 text-brand-950"
                        : "border-line bg-white text-muted"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`mt-2 text-[10px] font-semibold sm:text-xs ${i <= currentIdx ? "text-ink" : "text-muted"}`}>
                    {["Принят", "Подтверждён", "Оплачен", "Отправлен", "Выполнен"][i]}
                  </span>
                </div>
                {i < TIMELINE.length - 1 && (
                  <div className={`mx-1 mb-5 h-0.5 flex-1 rounded sm:mx-2 ${i < currentIdx ? "bg-accent-400" : "bg-line"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="overflow-hidden border border-line bg-white">
          <div className="border-b border-line px-5 py-4 text-sm font-bold">
            Состав заказа
          </div>
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
          <div className="border border-line bg-white p-5 text-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-muted">Получатель</div>
            <div className="mt-3 space-y-1.5">
              <div className="font-medium">{order.customerName}</div>
              <div className="text-muted">{order.phone}</div>
              <div className="text-muted">{order.email}</div>
            </div>
            {order.type === "B2B" && (
              <>
                <div className="mt-4 border-t border-line pt-4 text-xs font-bold uppercase tracking-wider text-muted">
                  Организация
                </div>
                <div className="mt-2 space-y-1.5">
                  <div className="font-medium">{order.companyName}</div>
                  <div className="text-muted">ИНН: {order.inn}</div>
                </div>
              </>
            )}
          </div>

          <div className="border border-line bg-white p-5 text-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-muted">Доставка и оплата</div>
            <div className="mt-3 space-y-1.5">
              <div className="font-medium">{DELIVERY_LABELS[order.delivery] ?? order.delivery}</div>
              {(order.city || order.address) && (
                <div className="text-muted">{[order.city, order.address].filter(Boolean).join(", ")}</div>
              )}
              <div className="border-t border-line pt-2 text-muted">{PAYMENT_LABELS[order.payment] ?? order.payment}</div>
            </div>
            {order.comment && (
              <>
                <div className="mt-4 border-t border-line pt-4 text-xs font-bold uppercase tracking-wider text-muted">
                  Комментарий
                </div>
                <p className="mt-2 text-muted">{order.comment}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
