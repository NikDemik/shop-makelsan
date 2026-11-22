import Link from "next/link";
import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import AddToCart from "@/components/AddToCart";
import CompareButton from "@/components/CompareButton";
import JsonLd from "@/components/JsonLd";
import { formatKva, formatPrice, formatPriceShort, effectivePriceKopecks } from "@/lib/format";
import { FILE_CAT_LABELS } from "@/lib/format";
import { baseAssetUrl, breadcrumbLd, SITE_URL } from "@/lib/seo";
import { IconArrowRight, IconBolt, IconDownload, IconFile, IconShield, IconTruck } from "@/components/icons";

type Params = Promise<{ slug: string }>;

const getProduct = cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    include: { series: true },
  });
});

const APPLICATION_LABELS: Record<string, string> = {
  home: "Для дома и офиса",
  server: "Для серверов",
  cod: "Для ЦОД",
  medical: "Для медицины",
  industry: "Для промышленности",
  heating: "Для котлов",
  pump: "Для насосов",
  machine: "Для станков",
  sensitive: "Чувствительное оборудование",
  rack: "Монтаж в стойку",
  russian: "Сделано в России",
};

type ModificationTable = {
  columns: string[];
  rows: { cells: string[]; relevant: boolean }[];
};

type GoodFile = { cat: string; title: string; path: string };

function fallbackDescription(name: string, seriesName: string | null, kva: number | null) {
  return `Источник бесперебойного питания ${name}${seriesName ? ` серии ${seriesName}` : ""}${kva ? ` мощностью ${formatKva(kva)}` : ""} бренда Makelsan. Защита электропитания от сбоев и пропаданий сети.`;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(decodeURIComponent(slug));
  if (!product || !product.active) return {};

  const price = product.priceKopecks !== null ? formatPriceShort(product.priceKopecks) : "по запросу";
  const base = product.description
    ? product.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    : fallbackDescription(product.name, product.series?.name ?? null, product.powerKva);
  const description = `${base.slice(0, 240).trimEnd()}… Цена ${price}. Доставка по всей России.`;

  return {
    title: `${product.name} — купить, цена ${price}`,
    description,
    alternates: { canonical: `/product/${product.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(decodeURIComponent(slug));
  if (!product || !product.active) notFound();

  const similar = product.seriesId
    ? await prisma.product.findMany({
        where: { seriesId: product.seriesId, active: true, id: { not: product.id } },
        take: 4,
        include: { series: true },
      })
    : [];

  const galleryImages = [
    ...(product.image ? [product.image] : []),
    ...product.images,
  ];

  const specs = (product.specs ?? {}) as Record<string, string>;
  const blocks = (product.blocks ?? {}) as Record<string, string>;
  const app = (product.application ?? {}) as Record<string, boolean>;
  const modifications = product.modifications as ModificationTable | null;
  const files = (product.files ?? []) as GoodFile[];

  const appFlags = Object.entries(app)
    .filter(([, on]) => on)
    .map(([k]) => APPLICATION_LABELS[k])
    .filter(Boolean);

  const hasPrice = effectivePriceKopecks(product) !== null;
  const saleMode = product.priceOverrideKopecks === null && product.saleKopecks !== null;
  const effPrice = effectivePriceKopecks(product);

  const compareItem = {
    slug: product.slug,
    name: product.name,
    article: product.article ?? "",
    powerKva: product.powerKva,
    type: product.type,
    priceKopecks: effPrice,
    seriesName: product.series?.name ?? null,
  };

  const fileGroups = new Map<string, GoodFile[]>();
  for (const f of files) {
    const cat = fileGroups.get(f.cat) ?? [];
    cat.push(f);
    fileGroups.set(f.cat, cat);
  }

  const faq = [
    {
      q: `Какая гарантия на ${product.name}?`,
      a: "Гарантия производителя — 24 месяца с даты поставки, сервисная поддержка в России. Вся продукция Makelsan официально поставляется в РФ.",
    },
    {
      q: "Как быстро доставите?",
      a: `Отгрузка со склада в Москве, далее доставка транспортной компанией по всей России${product.deliveryDays ? `, срок поставки ${product.deliveryDays} дн.` : ""}. Доступен самовывоз.`,
    },
    {
      q: "Можно ли оплатить по счёту для организации?",
      a: "Да: для юридических лиц и ИП работает безналичная оплата по счёту, скидка 5% на заказ и персональный менеджер. Физические лица могут оплатить картой онлайн или при получении.",
    },
    {
      q: "Цена не указана — как узнать стоимость?",
      a: "Стоимость этой модели формируется под объём и комплектацию: позвоните нам или отправьте заявку — подготовим коммерческое предложение в течение рабочего дня.",
    },
  ];

  return (
    <div className="mx-auto max-w-site px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd
        data={breadcrumbLd([
          { name: "Главная", url: "/" },
          { name: "Каталог", url: "/catalog" },
          ...(product.series
            ? [
                { name: product.series.name, url: `/catalog/${product.series.slug}` },
                { name: product.name, url: `/product/${product.slug}` },
              ]
            : [{ name: product.name, url: `/product/${product.slug}` }]),
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          sku: product.article ?? product.slug,
          description:
            product.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300) ||
            fallbackDescription(product.name, product.series?.name ?? null, product.powerKva),
          brand: { "@type": "Brand", name: "Makelsan" },
          category: product.series?.name,
          ...(galleryImages.length
            ? {
                image: galleryImages
                  .slice(0, 5)
                  .map((p) => baseAssetUrl(p))
                  .filter(Boolean),
              }
            : {}),
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/product/${product.slug}`,
            ...(hasPrice
              ? {
                  priceCurrency: "RUB",
                  price: ((saleMode ? product.saleKopecks : product.priceKopecks)! / 100).toFixed(2),
                }
              : {}),
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <div className="text-sm text-muted" data-reveal="up">
        <Link href="/" className="transition hover:text-accent-600">Главная</Link>
        <span className="mx-1.5">/</span>
        <Link href="/catalog" className="transition hover:text-accent-600">Каталог</Link>
        {product.series && (
          <>
            <span className="mx-1.5">/</span>
            <Link href={`/catalog/${product.series.slug}`} className="transition hover:text-accent-600">
              {product.series.name}
            </Link>
          </>
        )}
        <span className="mx-1.5">/</span>
        <span className="text-ink">{product.name}</span>
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div data-reveal="img">
          <ProductGallery images={galleryImages} name={product.name} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3" data-reveal="up">
            {product.series && (
              <Link
                href={`/catalog/${product.series.slug}`}
                className="label-caps text-accent-600 transition hover:text-accent-500"
              >
                {product.series.name}
              </Link>
            )}
            {saleMode && (
              <span className="bg-accent-400 px-2.5 py-0.5 text-xs font-bold text-brand-950">
                Акция
              </span>
            )}
            {appFlags.includes("Сделано в России") && (
              <span className="bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                Сделано в России
              </span>
            )}
          </div>

          <h1 className="mt-3 heading-caps text-3xl sm:text-5xl" data-reveal="heading" data-reveal-delay="60">{product.name}</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted" data-reveal="up" data-reveal-delay="140">
            {product.article && <span>Артикул: {product.article}</span>}
            {product.powerKva !== null && <span>Мощность: {formatKva(product.powerKva)}</span>}
            {product.deliveryDays !== null && <span>Срок поставки: {product.deliveryDays} дн.</span>}
          </div>

          {appFlags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {appFlags
                .filter((f) => f !== "Сделано в России")
                .map((f) => (
                  <span
                    key={f}
                    className="border border-line bg-white px-2.5 py-1 text-xs text-muted"
                  >
                    {f}
                  </span>
                ))}
            </div>
          )}

          <div className="mt-6 border border-line bg-white p-6" data-reveal="up" data-reveal-delay="200">
            {hasPrice ? (
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-xs text-muted">Цена</div>
                  {saleMode ? (
                    <div className="mt-1 flex items-baseline gap-3">
                      <div className="text-4xl section-num text-accent-600">
                        {formatPrice(product.saleKopecks!)}
                      </div>
                      <div className="text-lg text-muted line-through">
                        {formatPrice(effPrice!)}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 text-4xl section-num">
                      {formatPrice(effPrice!)}
                    </div>
                  )}
                </div>
                <div className="text-right text-xs leading-relaxed text-muted">
                  Для юридических лиц — безнал по счёту<br />и скидка 5% на заказ
                </div>
              </div>
            ) : (
              <div>
                <div className="text-2xl section-num">Цена по запросу</div>
                <p className="mt-2 text-sm text-muted">
                  Подготовим коммерческое предложение в течение рабочего дня: позвоните
                  нам или отправьте заявку с указанием модели и количества.
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              {hasPrice ? (
                  <AddToCart
                  code={product.slug}
                  name={product.name}
                  article={product.article ?? ""}
                  priceKopecks={effPrice!}
                />
              ) : (
                <>
                  <Link
                    href="/contacts"
                    className="flex items-center justify-center gap-2 bg-accent-400 px-6 py-3.5 text-sm font-bold text-brand-950 transition hover:bg-accent-300"
                  >
                    Запросить цену <IconArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="mailto:sales@makelsan-ups.ru?subject=Запрос цены"
                    className="flex items-center justify-center gap-2 border border-line px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-accent-400 hover:text-accent-600"
                  >
                    Отправить заявку
                  </a>
                </>
              )}
              <CompareButton item={compareItem} />
            </div>

            <div className="mt-5 grid gap-3 border-t border-line pt-5 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2.5 text-muted">
                <IconTruck className="h-5 w-5 shrink-0 text-accent-600" />
                Отгрузка со склада в Москве
              </div>
              <div className="flex items-center gap-2.5 text-muted">
                <IconShield className="h-5 w-5 shrink-0 text-accent-600" />
                Гарантия 24 месяца, сервис в РФ
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Характеристики + описание ─── */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {Object.keys(specs).length > 0 && (
          <div className="border border-line bg-white p-6" data-reveal="up">
            <h2 className="heading-caps text-lg">Характеристики</h2>
            <table className="mt-4 w-full text-sm">
              <tbody>
                {Object.entries(specs).map(([k, v]) => (
                  <tr key={k} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-4 align-top text-muted">{k}</td>
                    <td className="py-2.5 text-right align-top font-medium">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="space-y-6">
          {(product.description || blocks.advantages) && (
            <div className="border border-line bg-white p-6" data-reveal="up" data-reveal-delay="80">
              <h2 className="heading-caps text-lg">Описание</h2>
              {product.description && (
                <div
                  className="rich-html mt-4 text-sm"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}
              {blocks.advantages && (
                <div
                  className="rich-html mt-4 border-t border-line pt-4 text-sm"
                  dangerouslySetInnerHTML={{ __html: blocks.advantages }}
                />
              )}
              {product.series && (
                <Link
                  href={`/catalog/${product.series.slug}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-600 transition hover:text-accent-500"
                >
                  Все модели серии {product.series.name} <IconArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}

          {files.length > 0 && (
            <div className="border border-line bg-white p-6" data-reveal="up">
              <h2 className="heading-caps text-lg">Документация</h2>
              <div className="mt-4 space-y-4">
                {[...fileGroups.entries()].map(([cat, groupFiles]) => (
                  <div key={cat}>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted">
                      {FILE_CAT_LABELS[cat] ?? "Файлы"}
                    </div>
                    <ul className="mt-2 space-y-2">
                      {groupFiles.map((f) => (
                        <li key={f.path}>
                          <a
                            href={baseAssetUrl(f.path) ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2.5 text-sm text-ink transition hover:text-accent-600"
                          >
                            <IconFile className="h-4.5 w-4.5 shrink-0 text-accent-600" />
                            <span className="flex-1">{f.title}</span>
                            <IconDownload className="h-4 w-4 text-muted transition group-hover:text-accent-600" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Дополнительные блоки из API ─── */}
      {(["application", "appearance", "complectation", "installation", "instructions", "recommendations", "features"] as const)
        .filter((key) => blocks[key])
        .map((key, i) => (
          <section
            key={key}
            className={`mt-10 border border-line bg-white p-6 sm:p-8 ${i % 2 === 1 ? "bg-paper" : ""}`}
            data-reveal="up"
          >
            <div
              className="rich-html"
              dangerouslySetInnerHTML={{ __html: blocks[key] }}
            />
          </section>
        ))}

      {/* ─── Модификации ─── */}
      {modifications && modifications.rows.length > 0 && (
        <section className="mt-10 border border-line bg-white p-6 sm:p-8" data-reveal="up">
          <h2 className="heading-caps text-lg">Модификации</h2>
          <p className="mt-2 text-sm text-muted">
            Модели различаются индикацией, интерфейсами связи и типом выходных разъёмов.
            Отмечены складские варианты.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wider text-muted">
                  {modifications.columns.map((c) => (
                    <th key={c} className="py-2.5 pr-4">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modifications.rows.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-line last:border-0 ${
                      row.relevant ? "bg-accent-100/60" : ""
                    } transition hover:bg-paper`}
                  >
                    {row.cells.map((cell, j) => (
                      <td key={j} className="py-2.5 pr-4">
                        {cell}
                        {j === 0 && row.relevant && (
                          <span className="ml-2 inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            <IconBolt className="h-3 w-3" /> склад
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ─── FAQ ─── */}
      <section className="mt-10 border border-line bg-white p-6 sm:p-8" data-reveal="up">
        <h2 className="heading-caps text-lg">Частые вопросы</h2>
        <div className="mt-4 space-y-4">
          {faq.map((f) => (
            <div key={f.q} className="border-b border-line pb-4 last:border-0 last:pb-0">
              <h3 className="text-sm font-bold">{f.q}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl heading-caps" data-reveal="heading">Похожие товары</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((p, i) => (
              <ProductCard
                key={p.id}
                revealDelay={(i % 4) * 60}
                p={{
                  slug: p.slug,
                  article: p.article,
                  name: p.name,
                  powerKva: p.powerKva,
                  type: p.type,
                  priceKopecks: p.priceKopecks,
                  saleKopecks: p.saleKopecks,
                  image: p.image,
                  seriesName: p.series?.name ?? null,
                  seriesSlug: p.series?.slug ?? null,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
