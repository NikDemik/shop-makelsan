import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toggleProductActiveAction } from "@/actions/admin";
import { formatPrice, effectivePriceKopecks } from "@/lib/format";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PER_PAGE = 20;

export default async function AdminProducts({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);

  const where = q
    ? {
        OR: [
          { slug: { contains: q, mode: "insensitive" as const } },
          { article: { contains: q, mode: "insensitive" as const } },
          { name: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { series: true },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl heading-caps">Товары</h1>
          <p className="mt-1 text-sm text-muted">
            {total} позиций · каталог наполняется синхронизацией с API base.sstmk.ru
          </p>
        </div>
      </div>

      <form className="mt-5 flex gap-2" action="/admin/products">
        <input
          name="q"
          defaultValue={q}
          placeholder="Поиск по названию, артикулу или слагу…"
          className="w-full max-w-md border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-accent-400"
        />
        <button type="submit" className="bg-brand-950 px-5 py-2.5 text-sm font-bold text-accent-400 transition hover:bg-brand-800">
          Найти
        </button>
      </form>

      <div className="mt-5 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-220 text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-5 py-3.5 font-semibold">Название</th>
              <th className="px-5 py-3.5 font-semibold">Серия</th>
              <th className="px-5 py-3.5 text-right font-semibold">Мощн.</th>
              <th className="px-5 py-3.5 text-right font-semibold">Цена USD</th>
              <th className="px-5 py-3.5 text-right font-semibold">Цена ₽</th>
              <th className="px-5 py-3.5 text-center font-semibold">В каталоге</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const eff = effectivePriceKopecks(p);
              return (
                <tr key={p.id} className="border-b border-line last:border-0 transition hover:bg-paper">
                  <td className="max-w-72 px-5 py-3.5">
                    <Link href={`/product/${p.slug}`} className="font-medium transition hover:text-accent-600">
                      {p.name}
                    </Link>
                    <div className="font-mono text-[11px] text-muted">{p.article ?? p.slug}</div>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{p.series?.name ?? "—"}</td>
                  <td className="px-5 py-3.5 text-right text-muted">
                    {p.powerKva !== null ? `${String(p.powerKva).replace(".", ",")} кВА` : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right text-muted">
                    {p.priceUsd !== null ? `$${p.priceUsd}` : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold">
                    {eff !== null ? (
                      <>
                        {formatPrice(eff)}
                        {p.priceOverrideKopecks !== null && (
                          <span className="ml-1.5 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                            вручную
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600">по запросу</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <form action={toggleProductActiveAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className={`inline-flex h-6 w-11 items-center p-0.5 transition ${
                          p.active ? "bg-accent-400" : "bg-gray-300"
                        }`}
                        title={p.active ? "Скрыть из каталога" : "Показать в каталоге"}
                      >
                        <span className={`h-5 w-5 bg-white shadow transition ${p.active ? "translate-x-5" : ""}`} />
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="border border-line px-3 py-1.5 text-xs font-semibold transition hover:border-accent-400"
                    >
                      Цена
                    </Link>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted">Ничего не найдено.</td>
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
              href={`/admin/products?page=${i + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
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
