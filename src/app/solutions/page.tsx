import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { SOLUTIONS } from "@/lib/solutions";
import { prisma } from "@/lib/prisma";
import { IconArrowRight } from "@/components/icons";
import { IconServer, IconHospital, IconGauge, IconFactory, IconHome, IconNet } from "@/components/icons";

export const metadata: Metadata = {
  title: "Решения по отраслям — подбор ИБП",
  description:
    "Как выбрать источник бесперебойного питания под задачу: серверные и ЦОД, медицина, промышленность, станки и АСУ ТП, точная электроника, офис и дом. Подходящие модели ИБП Makelsan для каждой отрасли.",
  alternates: { canonical: "/solutions" },
};

const SOLUTION_ICONS: Record<string, (props: { className?: string }) => React.ReactNode> = {
  cod: IconNet,
  medicina: IconHospital,
  promyshlennost: IconFactory,
  stanki: IconServer,
  sensitive: IconGauge,
  office: IconHome,
};

export default async function SolutionsPage() {
  // Количество подходящих моделей для каждого решения
  const counts = await Promise.all(
    SOLUTIONS.map(async (sol) => {
      const n = await prisma.product.count({
        where: {
          active: true,
          OR: sol.applicationFlags.map((f) => ({ application: { path: [f], equals: true } })),
        },
      });
      return { slug: sol.slug, count: n };
    })
  );
  const countBySlug = new Map(counts.map((c) => [c.slug, c.count]));

  return (
    <div className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={breadcrumbLd([
          { name: "Главная", url: "/" },
          { name: "Решения", url: "/solutions" },
        ])}
      />
      <h1 className="heading-caps text-3xl sm:text-5xl" data-reveal="heading">
        Решения по отраслям
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted" data-reveal="up" data-reveal-delay="80">
        Подбор источника бесперебойного питания под задачу: применение, подходящие
        модели и ответы на частые вопросы.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SOLUTIONS.map((sol, i) => {
          const Icon = SOLUTION_ICONS[sol.slug] ?? IconServer;
          const count = countBySlug.get(sol.slug) ?? 0;
          return (
            <Link
              key={sol.slug}
              href={`/solutions/${sol.slug}`}
              className="group flex flex-col border border-line bg-white p-6 transition hover:border-accent-400/60 hover:shadow-[0_8px_30px_rgba(181,47,34,0.08)]"
              data-reveal="up"
              data-reveal-delay={(i % 3) * 70}
            >
              <div className="flex h-10 w-10 items-center justify-center bg-brand-950 text-accent-400">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-bold transition group-hover:text-accent-600">{sol.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{sol.lead}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="bg-paper px-2.5 py-1 text-[11px] font-semibold text-accent-600">
                  {count} моделей
                </span>
              </div>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent-600">
                Подробнее <IconArrowRight className="h-4 w-4" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
