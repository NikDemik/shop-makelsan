import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import { formatDateTime, formatPrice, ORDER_STATUS_LABELS } from "@/lib/format";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PER_PAGE = 20;

export default async function AdminOrders({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const page = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);

  const where = status && status in ORDER_STATUS_LABELS
    ? { status: status as keyof typeof ORDER_STATUS_LABELS as never }
    : {};

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { _count: { select: { items: true } } },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl heading-caps">Заказы</h1>
        <span className="text-sm text-muted">{total} всего</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`px-4 py-1.5 text-xs font-semibold transition ${
            !status ? "bg-brand-950 text-accent-400" : "border border-line bg-white text-muted hover:border-accent-400"
          }`}
        >
          Все
        </Link>
        {Object.entries(ORDER_STATUS_LABELS).map(([k, label]) => (
          <Link
            key={k}
            href={`/admin/orders?status=${k}`}
            className={`px-4 py-1.5 text-xs font-semibold transition ${
              status === k ? "bg-brand-950 text-accent-400" : "border border-line bg-white text-muted hover:border-accent-400"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-160 text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-5 py-3.5 font-semibold">Номер</th>
              <th className="px-5 py-3.5 font-semibold">Дата</th>
              <th className="px-5 py-3.5 font-semibold">Клиент</th>
              <th className="px-5 py-3.5 font-semibold">Тип</th>
              <th className="px-5 py-3.5 font-semibold">Позиции</th>
              <th className="px-5 py-3.5 text-right font-semibold">Сумма</th>
              <th className="px-5 py-3.5 font-semibold">Статус</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0 transition hover:bg-paper">
                <td className="px-5 py-3.5">
                  <Link href={`/admin/orders/${o.id}`} className="font-mono font-bold transition hover:text-accent-600">
                    {o.number}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-muted">{formatDateTime(o.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <div className="font-medium">{o.customerName}</div>
                  {o.companyName && <div className="text-xs text-muted">{o.companyName}</div>}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-0.5 text-xs font-semibold ${
                    o.type === "B2B" ? "bg-violet-50 text-violet-700" : "bg-sky-50 text-sky-700"
                  }`}>
                    {o.type}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted">{o._count.items}</td>
                <td className="px-5 py-3.5 text-right font-bold">{formatPrice(o.totalKopecks)}</td>
                <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted">Заказов не найдено.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <Link
              key={i}
              href={`/admin/orders?page=${i + 1}${status ? `&status=${status}` : ""}`}
              className={`flex h-9 w-9 items-center justify-center text-sm font-semibold transition ${
                page === i + 1 ? "bg-brand-950 text-accent-400" : "border border-line bg-white hover:border-accent-400"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
