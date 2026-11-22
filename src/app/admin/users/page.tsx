import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
      orders: { where: { status: { not: "CANCELLED" } }, select: { totalKopecks: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl heading-caps">Пользователи</h1>
      <p className="mt-1 text-sm text-muted">{users.length} зарегистрированных</p>

      <div className="mt-5 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-160 text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-5 py-3.5 font-semibold">Имя</th>
              <th className="px-5 py-3.5 font-semibold">E-mail</th>
              <th className="px-5 py-3.5 font-semibold">Тип</th>
              <th className="px-5 py-3.5 font-semibold">Организация</th>
              <th className="px-5 py-3.5 text-center font-semibold">Заказы</th>
              <th className="px-5 py-3.5 text-right font-semibold">Выручка</th>
              <th className="px-5 py-3.5 font-semibold">Регистрация</th>
              <th className="px-5 py-3.5 text-center font-semibold">Роль</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const spent = u.orders.reduce((s, o) => s + o.totalKopecks, 0);
              return (
                <tr key={u.id} className="border-b border-line last:border-0 transition hover:bg-paper">
                  <td className="px-5 py-3.5 font-medium">{u.name}</td>
                  <td className="px-5 py-3.5 text-muted">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold ${
                      u.accountType === "B2B" ? "bg-violet-50 text-violet-700" : "bg-sky-50 text-sky-700"
                    }`}>
                      {u.accountType}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted">
                    {u.companyName ?? "—"}
                    {u.inn && <span className="block text-[11px]">ИНН {u.inn}</span>}
                  </td>
                  <td className="px-5 py-3.5 text-center">{u._count.orders}</td>
                  <td className="px-5 py-3.5 text-right font-bold">{formatPrice(spent)}</td>
                  <td className="px-5 py-3.5 text-muted">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3.5 text-center">
                    {u.role === "ADMIN" && (
                      <span className="bg-brand-950 px-2.5 py-0.5 text-[11px] font-bold text-accent-400">
                        ADMIN
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
