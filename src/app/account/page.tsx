import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, formatPrice } from "@/lib/format";

export default async function AccountOverview() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");

  const [orders, totalAgg] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.uid },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { items: true } } },
    }),
    prisma.order.aggregate({
      where: { userId: session.uid, status: { not: "CANCELLED" } },
      _sum: { totalKopecks: true },
      _count: true,
    }),
  ]);

  const active = await prisma.order.count({
    where: { userId: session.uid, status: { in: ["NEW", "CONFIRMED", "PAID", "SHIPPED"] } },
  });

  return (
    <div>
      <h1 className="text-2xl heading-caps sm:text-3xl">
        Здравствуйте, {session.name.split(" ")[0]}!
      </h1>
      <p className="mt-1.5 text-sm text-muted">
        {session.accountType === "B2B"
          ? "Аккаунт организации — заказы по счёту со скидкой 5%."
          : "Здесь ваши заказы и данные аккаунта."}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Всего заказов", value: String(totalAgg._count) },
          { label: "Активных заказов", value: String(active) },
          {
            label: "Сумма покупок",
            value: formatPrice(totalAgg._sum.totalKopecks ?? 0),
          },
        ].map((c) => (
          <div key={c.label} className="border border-line bg-white p-5">
            <div className="text-xs text-muted">{c.label}</div>
            <div className="mt-1.5 text-xl section-num">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold">Последние заказы</h2>
        <Link href="/account/orders" className="text-sm font-semibold text-accent-600 hover:underline">
          Все заказы →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-4 border border-dashed border-line bg-white px-6 py-12 text-center text-sm text-muted">
          Заказов пока нет.{" "}
          <Link href="/catalog" className="font-semibold text-accent-600 hover:underline">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden border border-line bg-white">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/account/orders/${o.id}`}
              className="flex flex-wrap items-center gap-4 border-b border-line p-5 transition last:border-0 hover:bg-paper"
            >
              <span className="font-mono text-sm font-bold">{o.number}</span>
              <span className="text-sm text-muted">{formatDate(o.createdAt)}</span>
              <span className="text-sm text-muted">{o._count.items} поз.</span>
              <span className="ml-auto text-sm font-bold">{formatPrice(o.totalKopecks)}</span>
              <StatusBadge status={o.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
