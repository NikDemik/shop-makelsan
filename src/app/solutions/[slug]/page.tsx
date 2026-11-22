import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import JsonLd from "@/components/JsonLd";
import TextPageLayout from "@/components/TextPageLayout";
import SideNav from "@/components/SideNav";
import ProductCard from "@/components/ProductCard";
import { breadcrumbLd } from "@/lib/seo";
import { effectivePriceKopecks } from "@/lib/format";
import { getSolution, SOLUTIONS } from "@/lib/solutions";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const solution = getSolution((await params).slug);
  if (!solution) return {};
  return {
    title: solution.metaTitle,
    description: solution.metaDescription,
    alternates: { canonical: `/solutions/${solution.slug}` },
  };
}

export default async function SolutionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) notFound();

  // Модели, подходящие по флагам применения (любой из них)
  const products = await prisma.product.findMany({
    where: {
      active: true,
      OR: solution.applicationFlags.map((f) => ({ application: { path: [f], equals: true } })),
    },
    orderBy: [{ powerKva: "asc" }],
    take: 8,
    include: { series: true },
  });

  const total = await prisma.product.count({
    where: {
      active: true,
      OR: solution.applicationFlags.map((f) => ({ application: { path: [f], equals: true } })),
    },
  });

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: solution.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const toc = [
    { id: "overview", title: "Обзор" },
    { id: "models", title: "Подходящие модели" },
    {
      id: "faq",
      title: "Частые вопросы",
      children: solution.faq.map((f, i) => ({ id: `faq-${i}`, title: f.q })),
    },
  ];

  return (
    <div>
      <JsonLd
        data={breadcrumbLd([
          { name: "Главная", url: "/" },
          { name: "Решения", url: "/solutions" },
          { name: solution.title, url: `/solutions/${solution.slug}` },
        ])}
      />
      <JsonLd data={faqLd} />

      <TextPageLayout
        leftNav={
          <SideNav
            title="Решения"
            items={SOLUTIONS.map((s) => ({ href: `/solutions/${s.slug}`, title: s.title }))}
          />
        }
        toc={toc}
      >
        <div className="text-sm text-muted">
          <Link href="/" className="transition hover:text-accent-600">Главная</Link>
          <span className="mx-1.5">/</span>
          <Link href="/solutions" className="transition hover:text-accent-600">Решения</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">{solution.title}</span>
        </div>

        <h1 className="mt-3 heading-caps text-3xl sm:text-5xl" data-reveal="heading">
          ИБП Makelsan — {solution.title.toLowerCase()}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted" data-reveal="up" data-reveal-delay="80">{solution.lead}</p>

        <div id="overview" className="mt-6 space-y-4 text-sm leading-relaxed text-muted" data-reveal="up" data-reveal-delay="140">
          {solution.body.map((p, i) => (
            <div key={i}>
              <h2 className="text-lg heading-caps text-ink">{p.h2}</h2>
              {p.paragraphs.map((t, j) => (
                <p key={j} className="mt-3">{t}</p>
              ))}
            </div>
          ))}
        </div>

        <section id="models" className="mt-10 scroll-mt-24" data-reveal="up">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl heading-caps">Подходящие модели</h2>
            <Link
              href="/catalog"
              className="text-sm font-semibold text-accent-600 transition hover:text-accent-500"
            >
              Весь каталог ({total} моделей) →
            </Link>
          </div>
          {products.length > 0 ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {products.map((p, i) => (
                <ProductCard
                  key={p.id}
                  revealDelay={(i % 2) * 70}
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
          ) : (
            <div className="mt-5 border border-dashed border-line bg-white p-8 text-center text-sm text-muted">
              Подходящие модели обновляются — свяжитесь с нами для подбора.
            </div>
          )}
        </section>

        <section id="faq" className="mt-10 scroll-mt-24" data-reveal="up">
          <h2 className="text-xl heading-caps">Частые вопросы</h2>
          <div className="mt-5 space-y-4">
            {solution.faq.map((f, i) => (
              <div key={f.q} id={`faq-${i}`} className="scroll-mt-24 border border-line bg-white p-5">
                <h3 className="text-sm font-bold">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 bg-brand-950 p-6 text-paper sm:p-8">
          <h2 className="text-lg font-extrabold">Нужен подбор под конкретную задачу?</h2>
          <p className="mt-2 text-sm text-paper/70">
            Опишите нагрузку (мощность, время автономии, чувствительность) — инженер
            подберёт модель и подготовит коммерческое предложение в течение рабочего дня.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a href="tel:+78005051010" className="bg-accent-400 px-5 py-2.5 font-bold text-brand-950 transition hover:bg-accent-300">
              8 800 505-10-10
            </a>
            <Link href="/catalog" className="border border-white/20 px-5 py-2.5 font-semibold transition hover:border-accent-400 hover:text-accent-400">
              Перейти в каталог
            </Link>
          </div>
        </div>
      </TextPageLayout>
    </div>
  );
}
