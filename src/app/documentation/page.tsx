import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import TextPageLayout from "@/components/TextPageLayout";
import SideNav from "@/components/SideNav";
import JsonLd from "@/components/JsonLd";
import { INFO_PAGES } from "@/lib/info-pages";
import { breadcrumbLd, baseAssetUrl } from "@/lib/seo";
import { FILE_CAT_LABELS } from "@/lib/format";
import { IconDownload, IconFile } from "@/components/icons";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PER_PAGE = 50;

export const metadata: Metadata = {
  title: "Документация — инструкции и техописания ИБП Makelsan",
  description:
    "Библиотека документов ИБП Makelsan: технические описания серий, руководства по эксплуатации, инструкции по замене АКБ. PDF-файлы с сайта производителя.",
  alternates: { canonical: "/documentation" },
};

export const dynamic = "force-dynamic";

type GoodFile = { cat: string; title: string; path: string };

export default async function DocumentationPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const cat = typeof sp.cat === "string" && sp.cat ? sp.cat : "";
  const page = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);

  // Все файлы товаров из БД
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true, name: true, files: true, series: { select: { name: true } } },
  });

  const all: (GoodFile & { product: string; productSlug: string; series: string | null })[] = [];
  for (const p of products) {
    const files = (p.files ?? []) as GoodFile[];
    for (const f of files) {
      all.push({ ...f, product: p.name, productSlug: p.slug, series: p.series?.name ?? null });
    }
  }

  // Счётчики по категориям
  const catCounts = new Map<string, number>();
  for (const f of all) catCounts.set(f.cat, (catCounts.get(f.cat) ?? 0) + 1);

  const filtered = cat ? all.filter((f) => f.cat === cat) : all;
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageFiles = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const qs = (over: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    Object.entries({ cat, page, ...over }).forEach(([k, v]) => {
      if (typeof v === "string" && v) params.set(k, v);
      else if (typeof v === "number" && k === "page" && v > 1) params.set(k, String(v));
    });
    const s = params.toString();
    return `/documentation${s ? `?${s}` : ""}`;
  };

  return (
    <TextPageLayout leftNav={<SideNav title="Информация" items={INFO_PAGES} />}>
      <JsonLd
        data={breadcrumbLd([
          { name: "Главная", url: "/" },
          { name: "Документация", url: "/documentation" },
        ])}
      />
      <h1 className="heading-caps text-3xl sm:text-5xl">Документация</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Технические описания и руководства по эксплуатации ИБП Makelsan. Всего
        в библиотеке {all.length} документов; каждый привязан к модели в каталоге.
      </p>

      {/* Категории файлов */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={qs({ cat: undefined, page: 1 })}
          className={`px-4 py-1.5 text-xs font-semibold transition ${
            !cat ? "bg-brand-950 text-accent-400" : "border border-line bg-white text-muted hover:border-accent-400"
          }`}
        >
          Все ({all.length})
        </Link>
        {[...catCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([c, n]) => (
            <Link
              key={c}
              href={qs({ cat: c, page: 1 })}
              className={`px-4 py-1.5 text-xs font-semibold transition ${
                cat === c ? "bg-brand-950 text-accent-400" : "border border-line bg-white text-muted hover:border-accent-400"
              }`}
            >
              {FILE_CAT_LABELS[c] ?? c} ({n})
            </Link>
          ))}
      </div>

      <div className="mt-6 overflow-hidden border border-line bg-white">
        {pageFiles.map((f, i) => (
          <div
            key={`${f.path}-${i}`}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-5 py-3.5 last:border-0"
          >
            <IconFile className="h-4.5 w-4.5 shrink-0 text-accent-600" />
            <a
              href={baseAssetUrl(f.path) ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 text-sm font-medium transition hover:text-accent-600"
            >
              {f.title}
              <span className="ml-2 text-xs font-normal text-muted">{f.series ?? ""}</span>
            </a>
            <Link
              href={`/product/${f.productSlug}`}
              className="shrink-0 text-xs text-accent-600 transition hover:text-accent-500"
            >
              {f.product}
            </Link>
            <a
              href={baseAssetUrl(f.path) ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted transition hover:text-accent-600"
              aria-label="Скачать"
            >
              <IconDownload className="h-4 w-4" />
            </a>
          </div>
        ))}
        {pageFiles.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-muted">Документов не найдено.</div>
        )}
      </div>

      {pages > 1 && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <Link
              key={i}
              href={qs({ page: i + 1 })}
              className={`flex h-9 w-9 items-center justify-center text-sm font-semibold transition ${
                page === i + 1 ? "bg-brand-950 text-accent-400" : "border border-line bg-white hover:border-accent-400"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </TextPageLayout>
  );
}
