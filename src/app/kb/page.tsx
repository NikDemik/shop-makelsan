import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import TextPageLayout from "@/components/TextPageLayout";
import SideNav from "@/components/SideNav";
import { INFO_PAGES } from "@/lib/info-pages";
import { breadcrumbLd } from "@/lib/seo";
import { KB_ARTICLES } from "@/lib/kb";

export const metadata: Metadata = {
  title: "База знаний — выбор и эксплуатация ИБП",
  description:
    "Как выбрать источник бесперебойного питания: расчёт мощности, время автономии, типы ИБП (off-line, line-interactive, on-line). Практические материалы инженеров Makelsan.",
  alternates: { canonical: "/kb" },
};

export default function KbPage() {
  return (
    <TextPageLayout leftNav={<SideNav title="Информация" items={INFO_PAGES} />}>
      <JsonLd
        data={breadcrumbLd([
          { name: "Главная", url: "/" },
          { name: "База знаний", url: "/kb" },
        ])}
      />
      <h1 className="heading-caps text-3xl sm:text-5xl" data-reveal="heading">База знаний</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted" data-reveal="up" data-reveal-delay="80">
        Практические материалы по подбору и применению источников бесперебойного
        питания — пишут инженеры, которые ежедневно подбирают ИБП под задачи.
      </p>

      <div className="mt-8 space-y-4">
        {KB_ARTICLES.map((a, i) => (
          <Link
            key={a.slug}
            href={`/kb/${a.slug}`}
            className="group block border border-line bg-white p-6 transition hover:border-accent-400/60"
            data-reveal="up"
            data-reveal-delay={i * 60}
          >
            <h2 className="text-lg font-bold transition group-hover:text-accent-600">{a.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{a.lead}</p>
          </Link>
        ))}
      </div>
    </TextPageLayout>
  );
}
