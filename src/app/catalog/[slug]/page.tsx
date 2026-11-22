import { notFound } from "next/navigation";
import Link from "next/link";
import { cache, Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import SeriesBrowser from "@/components/SeriesBrowser";
import UpsImage from "@/components/UpsImage";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, SITE_URL } from "@/lib/seo";
import { pluralModels, effectivePriceKopecks } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export const dynamic = "force-dynamic";

const getSeries = cache(async (slug: string) => {
  return prisma.series.findUnique({ where: { slug } });
});

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeries(slug);
  if (!series) return {};

  const power =
    series.powerMin !== null && series.powerMax !== null
      ? `${String(series.powerMin).replace(".", ",")}–${String(series.powerMax).replace(".", ",")} кВА`
      : "различные мощности";
  return {
    title: series.metaTitle ?? `ИБП Makelsan серии ${series.name} — ${power}, цены`,
    description: series.metaDescription ?? `${series.tagline}. ${series.description}`.slice(0, 300),
    alternates: {
      canonical: `/catalog/${slug}`,
    },
  };
}

export default async function SeriesPage({ params }: { params: Params }) {
  const { slug } = await params;
  const series = await getSeries(slug);
  if (!series) notFound();

  const products = await prisma.product.findMany({
    where: { seriesId: series.id, active: true },
    orderBy: [{ powerKva: "asc" }, { priceKopecks: "asc" }],
  });

  const powerText =
    series.powerMin !== null && series.powerMax !== null
      ? `${String(series.powerMin).replace(".", ",")}–${String(series.powerMax).replace(".", ",")} кВА`
      : "мощности по запросу";

  return (
    <div>
      <JsonLd
        data={breadcrumbLd([
          { name: "Главная", url: "/" },
          { name: "Каталог", url: "/catalog" },
          { name: series.name, url: `/catalog/${series.slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: products.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/product/${encodeURIComponent(p.slug)}`,
            name: p.name,
          })),
        }}
      />
      <section className="hero-grid relative overflow-hidden bg-brand-950 text-paper">
        <div className="hero-glow absolute inset-0" />
        <div className="relative mx-auto flex max-w-site flex-wrap items-center justify-between gap-8 px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-sm text-paper/50" data-reveal="up">
              <Link href="/catalog" className="transition hover:text-accent-400">Каталог</Link>
              <span className="mx-1.5">/</span>
              <span className="text-accent-400">{series.name}</span>
            </div>
            <h1 className="mt-3 heading-caps text-3xl sm:text-5xl" data-reveal="heading" data-reveal-delay="60">
              ИБП Makelsan серия {series.name}
            </h1>
            <div className="mt-2 text-sm font-semibold text-accent-400" data-reveal="up" data-reveal-delay="140">{series.tagline}</div>
            <p className="mt-4 text-sm leading-relaxed text-paper/65" data-reveal="up" data-reveal-delay="200">{series.description}</p>
            <div className="mt-5 text-sm text-paper/50" data-reveal="up" data-reveal-delay="260">
              Диапазон мощностей: {powerText} · {products.length}{" "}
              {pluralModels(products.length)}
            </div>
          </div>
          <div data-reveal="img" data-reveal-delay="150">
            <UpsImage tone="dark" className="w-40 sm:w-48" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:px-8">
        <Suspense>
          <SeriesBrowser
            seriesName={series.name}
            seriesSlug={series.slug}
            products={products.map((p) => ({
              slug: p.slug,
              article: p.article,
              name: p.name,
              powerKva: p.powerKva,
              type: p.type,
              priceKopecks: effectivePriceKopecks(p),
              saleKopecks: p.priceOverrideKopecks === null ? p.saleKopecks : null,
              image: p.image,
            }))}
          />
        </Suspense>
      </div>
    </div>
  );
}
