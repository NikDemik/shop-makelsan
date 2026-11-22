import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import BarChart from "@/components/BarChart";
import { formatDate, formatPrice } from "@/lib/format";
import { effectivePriceKopecks } from "@/lib/format";
import { IconArrowRight } from "@/components/icons";

export default async function AdminDashboard() {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const daysAgo14 = new Date(Date.now() - 13 * 24 * 3600 * 1000);
  daysAgo14.setHours(0, 0, 0, 0);

  const [monthAgg, newOrders, customers, noPriceProducts, recentOrders, chartOrders, topItems] =
    await Promise.all([
      prisma.order.aggregate({
        where: { createdAt: { gte: monthStart }, status: { not: "CANCELLED" } },
        _sum: { totalKopecks: true },
        _count: true,
      }),
      prisma.order.count({ where: { status: "NEW" } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.findMany({
        where: { active: true, priceKopecks: null, priceOverrideKopecks: null },
        orderBy: { modDate: "desc" },
        take: 6,
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 7,
        include: { _count: { select: { items: true } } },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: daysAgo14 }, status: { not: "CANCELLED" } },
        select: { createdAt: true, totalKopecks: true },
      }),
      prisma.orderItem.groupBy({
        by: ["code", "name"],
        _sum: { qty: true },
        orderBy: { _sum: { qty: "desc" } },
        take: 5,
      }),
    ]);

  // Выручка по дням за 14 дней
  const chart = Array.from({ length: 14 }).map((_, i) => {
    const day = new Date(daysAgo14.getTime() + i * 24 * 3600 * 1000);
    const next = new Date(day.getTime() + 24 * 3600 * 1000);
    const sum = chartOrders
      .filter((o) => o.createdAt >= day && o.createdAt < next)
      .reduce((s, o) => s + o.totalKopecks, 0);
    return { label: day.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }), value: Math.round(sum / 100) };
  });

  const activeProducts = await prisma.product.count({ where: { active: true } });

  const cards = [
    {
      label: "Выручка за месяц",
      value: formatPrice(monthAgg._sum.totalKopecks ?? 0),
      sub: `${monthAgg._count} заказов`,
    },
    {
      label: "Новые заказы",
      value: String(newOrders),
      sub: "ожидают обработки",
      accent: newOrders > 0,
    },
    { label: "Покупателей", value: String(customers), sub: "включая B2B" },
    { label: "Товаров в каталоге", value: String(activeProducts), sub: "активных позиций" },
  ];

  return (
    <div>
      <h1 className="text-2xl heading-caps">Дашборд</h1>
      <p className="mt-1 text-sm text-muted">
        {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="border border-line bg-white p-5">
            <div className="text-xs text-muted">{c.label}</div>
            <div className={`mt-1.5 text-2xl section-num ${c.accent ? "text-accent-600" : ""}`}>
              {c.value}
            </div>
            <div className="mt-1 text-xs text-muted">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <BarChart data={chart} title="Выручка по дням" />

        <div className="border border-line bg-white p-6">
          <h3 className="text-sm font-bold">Топ товаров</h3>
          <div className="mt-4 space-y-3">
            {topItems.length === 0 && <p className="text-sm text-muted">Пока нет продаж.</p>}
            {topItems.map((t, i) => (
              <div key={t.code} className="flex items-center gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-brand-950 text-[11px] font-bold text-accent-400">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{t.name}</div>
                  <div className="font-mono text-[11px] text-muted">{t.code}</div>
                </div>
                <div className="shrink-0 font-bold">{t._sum.qty} шт</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h3 className="text-sm font-bold">Последние заказы</h3>
            <Link href="/admin/orders" className="flex items-center gap-1.5 text-xs font-semibold text-accent-600 hover:underline">
              Все заказы <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentOrders.map((o) => (
            <Link
              key={o.id}
              href={`/admin/orders/${o.id}`}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-6 py-3.5 transition last:border-0 hover:bg-paper"
            >
              <span className="font-mono text-sm font-bold">{o.number}</span>
              <span className="text-xs text-muted">{formatDate(o.createdAt)}</span>
              <span className="max-w-40 truncate text-sm text-muted">{o.customerName}</span>
              <span className="ml-auto text-sm font-bold">{formatPrice(o.totalKopecks)}</span>
              <StatusBadge status={o.status} />
            </Link>
          ))}
        </div>

        <div className="border border-line bg-white p-6">
          <h3 className="text-sm font-bold">Товары с ценой по запросу</h3>
          <p className="mt-1 text-xs text-muted">Задайте им цену вручную на странице товара</p>
          <div className="mt-4 space-y-3">
            {noPriceProducts.length === 0 && <p className="text-sm text-muted">У всех товаров есть цена.</p>}
            {noPriceProducts.map((p) => (
              <Link key={p.id} href={`/admin/products/${p.id}`} className="block text-sm transition hover:opacity-75">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-medium">{p.name}</span>
                  <span className="shrink-0 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                    по запросу
                  </span>
                </div>
                <div className="font-mono text-[11px] text-muted">{p.article ?? p.slug}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
