import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { formatDateTime, formatPrice } from "@/lib/format";

export default async function AccountOrders() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.uid },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="text-2xl heading-caps">Мои заказы</h1>
        <div className="mt-6 border border-dashed border-line bg-white px-6 py-14 text-center text-sm text-muted">
          Заказов пока нет.{" "}
          <Link href="/catalog" className="font-semibold text-accent-600 hover:underline">
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl heading-caps">Мои заказы</h1>
      <div className="mt-6 overflow-hidden border border-line bg-white">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/account/orders/${o.id}`}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line p-5 transition last:border-0 hover:bg-paper"
          >
            <div className="min-w-28">
              <div className="font-mono text-sm font-bold">{o.number}</div>
              <div className="mt-0.5 text-xs text-muted">{formatDateTime(o.createdAt)}</div>
            </div>
            <StatusBadge status={o.status} />
            <div className="text-sm text-muted">{o._count.items} поз.</div>
            <div className="ml-auto text-sm font-bold">{formatPrice(o.totalKopecks)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
