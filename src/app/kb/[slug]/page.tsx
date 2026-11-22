import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import TextPageLayout from "@/components/TextPageLayout";
import SideNav from "@/components/SideNav";
import { breadcrumbLd } from "@/lib/seo";
import { getKbArticle, KB_ARTICLES } from "@/lib/kb";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return KB_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const article = getKbArticle((await params).slug);
  if (!article) return {};
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: `/kb/${article.slug}` },
  };
}

export default async function KbArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = getKbArticle(slug);
  if (!article) notFound();

  const toc = article.sections.map((s, i) => ({ id: `s${i + 1}`, title: s.h2 }));

  return (
    <TextPageLayout
      leftNav={
        <SideNav
          title="База знаний"
          items={KB_ARTICLES.map((a) => ({ href: `/kb/${a.slug}`, title: a.title }))}
        />
      }
      toc={toc}
    >
      <JsonLd
        data={breadcrumbLd([
          { name: "Главная", url: "/" },
          { name: "База знаний", url: "/kb" },
          { name: article.title, url: `/kb/${article.slug}` },
        ])}
      />

      <div className="text-sm text-muted">
        <Link href="/" className="transition hover:text-accent-600">Главная</Link>
        <span className="mx-1.5">/</span>
        <Link href="/kb" className="transition hover:text-accent-600">База знаний</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{article.title}</span>
      </div>

      <h1 className="mt-3 heading-caps text-3xl sm:text-5xl" data-reveal="heading">{article.title}</h1>
      <p className="mt-5 text-base leading-relaxed text-muted" data-reveal="up" data-reveal-delay="80">{article.lead}</p>

      <article className="mt-8 space-y-8">
        {article.sections.map((s, i) => (
          <section key={s.h2} id={`s${i + 1}`} className="scroll-mt-24" data-reveal="up">
            <h2 className="text-xl heading-caps">{s.h2}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
              {s.paragraphs.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </article>

      <div className="mt-10 bg-brand-950 p-6 text-paper sm:p-8" data-reveal="up">
        <h2 className="text-lg font-extrabold">Подберём ИБП под вашу задачу</h2>
        <p className="mt-2 text-sm text-paper/70">
          Опишите нагрузку и требуемое время автономии — инженер предложит модель
          и подготовит коммерческое предложение в течение рабочего дня.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <a href="tel:+78005051010" className="bg-accent-400 px-5 py-2.5 font-bold text-brand-950 transition hover:bg-accent-300">
            8 800 505-10-10
          </a>
          <Link href="/catalog" className="border border-white/20 px-5 py-2.5 font-semibold transition hover:border-accent-400 hover:text-accent-400">
            Каталог ИБП
          </Link>
        </div>
      </div>
    </TextPageLayout>
  );
}
