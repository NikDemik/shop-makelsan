import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import HeroSlider, { type HeroProduct } from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import {
  IconArrowRight,
  IconBolt,
  IconGauge,
  IconShield,
  IconTruck,
} from "@/components/icons";
import { SOLUTIONS } from "@/lib/solutions";
import { effectivePriceKopecks } from "@/lib/format";

export const metadata: Metadata = {
  description:
    "Купить ИБП Makelsan: on-line системы двойного преобразования от 10 кВА до 1 МВА для ЦОД, медицины, промышленности и энергетики. Цены в рублях, склад в Москве, доставка по России, гарантия 2 года.",
  alternates: { canonical: "/" },
};

const STATS = [
  { icon: IconGauge, value: "6", label: "серий ИБП в каталоге" },
  { icon: IconBolt, value: "10–1000", label: "кВА — диапазон мощностей" },
  { icon: IconTruck, value: "50+", label: "городов доставки по РФ" },
  { icon: IconShield, value: "24", label: "месяца гарантии" },
];

const SOLUTION_CARDS = SOLUTIONS.map((s, i) => ({
  num: String(i + 1).padStart(2, "0"),
  slug: s.slug,
  title: s.title,
  desc: s.lead.split(":")[0].split(".")[0] + ".",
}));

/** Товары для слайда 01 hero-слайдера: BOXER 15 крупно + BOXER S рядом */
const HERO_PRODUCT_SLUGS = ["boxer-15-kva", "boxer-s-15-kva"];

export default async function HomePage() {
  const seriesList = await prisma.series.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { active: true } } } } },
  });

  const withGoods = seriesList.filter((s) => s._count.products > 0);
  const homeSeries = [...withGoods].slice(0, 8);
  const hasMoreSeries = withGoods.length > homeSeries.length;

  const heroFound = await prisma.product.findMany({
    where: { active: true, slug: { in: HERO_PRODUCT_SLUGS } },
    select: { slug: true, name: true, powerKva: true, image: true, priceKopecks: true },
  });
  // Порядок фиксированный (BOXER 15 → BOXER S); товар без фото не показываем
  const heroProducts: HeroProduct[] = HERO_PRODUCT_SLUGS.map((slug) =>
    heroFound.find((p) => p.slug === slug && p.image !== null)
  ).filter((p): p is HeroProduct => p !== undefined);

  const popular = await prisma.product.findMany({
    where: {
      active: true,
      OR: [{ priceKopecks: { not: null } }, { priceOverrideKopecks: { not: null } }],
    },
    orderBy: [{ isSale: "desc" }, { powerKva: "asc" }],
    take: 8,
    include: { series: true },
  });

  return (
    <div>
      {/* ─── HERO: слайдер из 3 баннеров ─── */}
      <HeroSlider products={heroProducts} />

      {/* ─── РЕШЕНИЯ ─── */}
      <section id="solutions" className="bg-paper">
        <div className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
            <div>
              <div className="section-num text-5xl text-accent-400" data-reveal="up">01</div>
              <div className="label-caps mt-3 text-accent-600" data-reveal="up" data-reveal-delay="60">Для кого</div>
              <h2 className="heading-caps mt-3 text-3xl sm:text-5xl" data-reveal="heading" data-reveal-delay="100">
                Решения, которые защищают вашу отрасль
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted lg:justify-self-end" data-reveal="up" data-reveal-delay="160">
              Подбираем ИБП под задачу: от серверной комнаты до промышленного
              ЦОД и производственной линии. Консультация инженера на всех этапах.
            </p>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {SOLUTION_CARDS.map((s, i) => (
              <Link
                key={s.num}
                href={`/solutions/${s.slug}`}
                className="group bg-white p-7 transition hover:bg-brand-950"
                data-reveal="up"
                data-reveal-delay={(i % 3) * 70}
              >
                <div className="section-num text-2xl text-accent-600 transition group-hover:text-accent-400">{s.num}</div>
                <h3 className="mt-3 text-lg font-bold transition group-hover:text-paper">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted transition group-hover:text-paper/60">
                  {s.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── СЕРИИ ─── */}
      <section id="series" className="diag-lines relative overflow-hidden bg-brand-950 text-paper">
        <div
          aria-hidden="true"
          className="ghost-word pointer-events-none absolute -left-4 top-6 hidden select-none text-[9rem] xl:block"
        >
          Серии
        </div>
        <div className="relative mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="section-num text-5xl text-accent-400" data-reveal="up">02</div>
              <div className="label-caps mt-3 text-accent-400" data-reveal="up" data-reveal-delay="60">Продуктовые линейки</div>
              <h2 className="heading-caps mt-3 text-3xl sm:text-5xl" data-reveal="heading" data-reveal-delay="100">
                Серии ИБП Makelsan
              </h2>
            </div>
            <Link
              href="/catalog"
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-accent-400 transition hover:text-accent-300"
              data-reveal="up" data-reveal-delay="160"
            >
              Смотреть весь каталог <IconArrowRight />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {homeSeries.map((s, i) => (
              <Link
                key={s.id}
                href={`/catalog/${s.slug}`}
                className="group flex flex-col border border-white/10 bg-brand-900/60 p-5 transition hover:border-accent-400/50 hover:bg-brand-800"
                data-reveal="up"
                data-reveal-delay={(i % 4) * 60}
              >
                <div className="flex h-24 items-center justify-center">
                  <svg viewBox="0 0 40 12" className="h-10 w-32 transition group-hover:scale-105" fill="none" aria-hidden="true">
                    <path
                      d="M1 7h5l1.5-4.5 3 9 2.5-7 1.5 3H39"
                      stroke="#f28232"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="heading-caps mt-4 text-base">{s.name}</div>
                <div className="mt-1 line-clamp-2 text-xs text-paper/50">{s.tagline}</div>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                  <span className="font-semibold text-accent-400">
                    {s.powerMin !== null && s.powerMax !== null
                      ? `${String(s.powerMin).replace(".", ",")}–${String(s.powerMax).replace(".", ",")} кВА`
                      : "под заказ"}
                  </span>
                  <span className="text-paper/45">{s._count.products} моделей →</span>
                </div>
              </Link>
            ))}
          </div>

          {hasMoreSeries && (
            <div className="mt-8 flex flex-wrap items-center gap-2 text-sm text-paper/55">
              <span className="label-caps mr-2 text-paper/35">Также в каталоге:</span>
              {withGoods.slice(8, 20).map((s) => (
                <Link
                  key={s.id}
                  href={`/catalog/${s.slug}`}
                  className="border border-white/10 px-3 py-1.5 text-xs transition hover:border-accent-400/60 hover:text-accent-400"
                >
                  {s.name}
                </Link>
              ))}
              <Link
                href="/catalog"
                className="border border-accent-400/40 px-3 py-1.5 text-xs font-semibold text-accent-400 transition hover:bg-accent-400/10"
              >
                Все {withGoods.length} серий →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── ПОПУЛЯРНЫЕ ─── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="section-num text-5xl text-accent-400" data-reveal="up">03</div>
              <div className="label-caps mt-3 text-accent-600" data-reveal="up" data-reveal-delay="60">Выбор покупателей</div>
              <h2 className="heading-caps mt-3 text-3xl sm:text-5xl" data-reveal="heading" data-reveal-delay="100">
                Популярные модели
              </h2>
            </div>
            <Link
              href="/catalog"
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-accent-600 transition hover:text-accent-500"
              data-reveal="up" data-reveal-delay="160"
            >
              Все товары <IconArrowRight />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((p, i) => (
              <ProductCard
                key={p.id}
                revealDelay={(i % 4) * 60}
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
        </div>
      </section>

      {/* ─── СТАТИСТИКА ─── */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-site gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {STATS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-4" data-reveal="up" data-reveal-delay={i * 60}>
              <div className="flex h-12 w-12 items-center justify-center bg-brand-950 text-accent-400">
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="section-num text-3xl">{s.value}</div>
                <div className="text-xs leading-snug text-muted">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── B2B + CTA ─── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="overflow-hidden bg-brand-950 text-paper">
            <div className="hero-grid diag-lines grid gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:items-center lg:p-16">
              <div>
                <div className="section-num text-5xl text-accent-400" data-reveal="up">04</div>
                <div className="label-caps mt-3 text-accent-400" data-reveal="up" data-reveal-delay="60">Оптовым покупателям</div>
                <h2 className="heading-caps mt-3 text-3xl sm:text-5xl" data-reveal="heading" data-reveal-delay="100">
                  Работаем по договору, отгружаем со склада
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-paper/65" data-reveal="up" data-reveal-delay="160">
                  Регистрация для юридических лиц открывает безналичную оплату по счёту,
                  скидка 5% на заказы и персональный менеджер. Отгрузка в день оплаты
                  или доставка транспортной компанией.
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-paper/75">
                  {[
                    "Скидка 5% для зарегистрированных организаций",
                    "Счёт и закрывающие документы в течение дня",
                    "Подбор ИБП по параметрам и запрос спецификации",
                    "Проектные решения для ЦОД и промышленных объектов",
                  ].map((li) => (
                    <li key={li} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-accent-400" />
                      {li}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/register?type=b2b"
                    className="flex items-center gap-2 bg-accent-400 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-brand-950 transition hover:bg-accent-300"
                  >
                    Регистрация B2B <IconArrowRight />
                  </Link>
                  <Link
                    href="/contacts"
                    className="flex items-center gap-2 border border-white/20 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-paper/85 transition hover:border-accent-400 hover:text-accent-400"
                  >
                    Запросить КП
                  </Link>
                </div>
              </div>

              <div id="contacts" className="border border-white/10 bg-brand-900/70 p-6 sm:p-8" data-reveal="img" data-reveal-delay="200">
                <div className="label-caps text-accent-400">Свяжитесь с нами</div>
                <div className="mt-5 space-y-5">
                  <div>
                    <div className="text-xs text-paper/45">Отдел продаж</div>
                    <a href="tel:+78005051010" className="section-num mt-1 block text-3xl transition hover:text-accent-400">
                      8 800 505-10-10
                    </a>
                    <div className="text-xs text-paper/45">звонок по России бесплатный, пн–пт 9:00–18:00</div>
                  </div>
                  <div className="border-t border-white/10 pt-5">
                    <div className="text-xs text-paper/45">E-mail</div>
                    <a href="mailto:sales@makelsan-ups.ru" className="mt-1 block text-lg font-bold transition hover:text-accent-400">
                      sales@makelsan-ups.ru
                    </a>
                  </div>
                  <div className="border-t border-white/10 pt-5">
                    <div className="text-xs text-paper/45">Склад и шоурум</div>
                    <div className="mt-1 text-sm text-paper/75">
                      Москва, ул. Электрозаводская, д. 21, стр. 4
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
