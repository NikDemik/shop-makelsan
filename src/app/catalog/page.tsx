import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Filters from "@/components/Filters";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, SITE_URL } from "@/lib/seo";
import { effectivePriceKopecks } from "@/lib/format";
import type { Prisma } from "@prisma/client";

const PER_PAGE = 12;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);
  return {
    title: "Каталог ИБП Makelsan — цены в рублях, характеристики",
    description:
      "Полный каталог ИБП Makelsan: 30 серий, мощности от 0,45 кВА до 2 МВА, on-line и линейно-интерактивные модели. Цены в рублях, склад в Москве, доставка по всей России.",
    alternates: { canonical: page > 1 ? `/catalog?page=${page}` : "/catalog" },
  };
}

const SORTS = [
  { value: "popular", label: "По популярности" },
  { value: "price-asc", label: "Сначала дешевле" },
  { value: "price-desc", label: "Сначала дороже" },
  { value: "power-asc", label: "По возрастанию мощности" },
];

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v : undefined;
  };

  const seriesSlugs = get("series")?.split(",").filter(Boolean) ?? [];
  const type = get("type"); // on-line | line-interactive
  const pmin = parseFloat(get("pmin") ?? "");
  const pmax = parseFloat(get("pmax") ?? "");
  const priced = get("priced") === "1";
  const sort = get("sort") ?? "popular";
  const page = Math.max(1, parseInt(get("page") ?? "1", 10) || 1);

  const where: Prisma.ProductWhereInput = { active: true };
  if (seriesSlugs.length) where.series = { slug: { in: seriesSlugs } };
  if (type === "on-line") where.type = { contains: "двойного преобразования" };
  if (type === "line-interactive") where.type = { contains: "линейно-интерактивный" };
  if (!Number.isNaN(pmin) || !Number.isNaN(pmax)) {
    where.powerKva = {};
    if (!Number.isNaN(pmin)) where.powerKva.gte = pmin;
    if (!Number.isNaN(pmax)) where.powerKva.lte = pmax;
  }
  if (priced) {
    where.OR = [
      { priceKopecks: { not: null } },
      { priceOverrideKopecks: { not: null } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { priceKopecks: { sort: "asc", nulls: "last" } }
      : sort === "price-desc"
        ? { priceKopecks: { sort: "desc", nulls: "last" } }
        : sort === "power-asc"
          ? { powerKva: "asc" }
          : { powerKva: "asc" };

  const [seriesList, total, products] = await Promise.all([
    prisma.series.findMany({
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, _count: { select: { products: { where: { active: true } } } } },
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { series: true },
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const qs = (over: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    Object.entries({ ...sp, ...over }).forEach(([k, v]) => {
      if (typeof v === "string" && v) params.set(k, v);
    });
    return `/catalog${params.toString() ? `?${params}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-site px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd
        data={breadcrumbLd([
          { name: "Главная", url: "/" },
          { name: "Каталог", url: "/catalog" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: products.map((p, i) => ({
            "@type": "ListItem",
            position: (page - 1) * PER_PAGE + i + 1,
            url: `${SITE_URL}/product/${encodeURIComponent(p.slug)}`,
            name: p.name,
          })),
        }}
      />
      <div className="text-sm text-muted">
        <Link href="/" className="transition hover:text-accent-600">Главная</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">Каталог</span>
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-caps text-3xl sm:text-5xl" data-reveal="heading">Каталог ИБП Makelsan</h1>
          <p className="mt-2 text-sm text-muted" data-reveal="up" data-reveal-delay="80">Найдено {total} моделей · цены в рублях</p>
        </div>
        <SortSelect current={sort} qs={qs} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <Suspense fallback={<div className="h-96 animate-pulse bg-white" />}>
          <Filters
            seriesList={seriesList.map((s) => ({ slug: s.slug, name: s.name, count: s._count.products }))}
          />
        </Suspense>

        <div>
          {products.length === 0 ? (
            <div className="flex h-64 items-center justify-center border border-dashed border-line bg-white text-sm text-muted">
              По заданным фильтрам ничего не найдено — попробуйте сбросить фильтры.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p, i) => (
                <ProductCard
                  key={p.id}
                  revealDelay={(i % 3) * 60}
                  p={{
                    slug: p.slug,
                    article: p.article,
                    name: p.name,
                    powerKva: p.powerKva,
                    type: p.type,
                    priceKopecks: effectivePriceKopecks(p),
                    saleKopecks: p.priceOverrideKopecks === null ? p.saleKopecks : null,
                    image: p.image,
                    seriesName: p.series?.name ?? null,
                    seriesSlug: p.series?.slug ?? null,
                  }}
                />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: pages }).map((_, i) => (
                <Link
                  key={i}
                  href={qs({ page: i + 1 })}
                  className={`flex h-10 w-10 items-center justify-center text-sm font-semibold transition ${
                    page === i + 1
                      ? "bg-brand-950 text-accent-400"
                      : "border border-line bg-white text-ink hover:border-accent-400"
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SortSelect({ current, qs }: { current: string; qs: (over: Record<string, string | number | undefined>) => string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted">Сортировка:</span>
      {SORTS.map((s) => (
        <Link
          key={s.value}
          href={qs({ sort: s.value, page: 1 })}
          className={`px-3 py-1.5 transition ${
            current === s.value
              ? "bg-brand-950 font-semibold text-accent-400"
              : "text-muted hover:text-accent-600"
          }`}
        >
          {s.label}
        </Link>
      ))}
    </div>
  );
}
