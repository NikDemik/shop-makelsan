"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { formatPriceShort } from "@/lib/format";
import { IconArrowRight } from "@/components/icons";

export type HeroProduct = {
  slug: string;
  name: string;
  powerKva: number | null;
  image: string | null;
  priceKopecks: number | null;
};

const SLIDE_MS = 7000;

/**
 * Локальные вырезы товаров (прозрачные PNG, белый фон удалён) для
 * композиции слайда 01. Отсутствие записи → фолбэк на фото с площадки.
 */
const HERO_CUTOUTS: Record<string, string> = {
  "boxer-15-kva": "/images/hero/boxer-15.png",
  "boxer-s-15-kva": "/images/hero/boxer-s-15.png",
};

/** Тень+свечение для парящих товаров */
const CUTOUT_SHADOW: CSSProperties = {
  filter:
    "drop-shadow(0 18px 22px rgba(0,0,0,0.5)) drop-shadow(0 0 26px rgba(242,130,50,0.16))",
};

export default function HeroSlider({ products = [] }: { products?: HeroProduct[] }) {
  const slideCount = 2;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Автосмена; интервал пересоздаётся при ручном переключении, отсчёт каждый раз с нуля
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % slideCount), SLIDE_MS);
    return () => clearInterval(id);
  }, [active, paused, slideCount]);

  return (
    <section
      className="hero-grid diag-lines relative overflow-hidden bg-brand-950 text-paper"
      aria-roledescription="карусель"
      aria-label="Баннеры главной"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-glow absolute inset-0" />

      {/* «Призрачное» слово фоном, как в референсе */}
      <div
        aria-hidden="true"
        className="ghost-word pointer-events-none absolute -right-6 top-10 hidden select-none text-[10rem] xl:block"
      >
        Makelsan
      </div>

      <div className="relative mx-auto max-w-site px-4 sm:px-6 lg:px-8">
        {/* Слайды лежат в одной ячейке grid: контейнер по самому высокому слайду, без прыжков высоты */}
        <div className="grid">
          {Array.from({ length: slideCount }, (_, i) => (
            <div
              key={i}
              inert={active !== i}
              aria-hidden={active !== i}
              className={`col-start-1 row-start-1 transition-opacity duration-700 ease-out ${
                active === i ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {i === 0 ? (
                <SlideBrand active={active === i} products={products} />
              ) : (
                <SlideSolutions active={active === i} />
              )}
            </div>
          ))}
        </div>

        {/* Вертикальная нумерация слайдов справа (desktop), как в референсе */}
        <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex">
          {Array.from({ length: slideCount }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Слайд ${i + 1} из ${slideCount}`}
              aria-current={active === i}
              className={`section-num text-xl transition ${
                active === i
                  ? "text-accent-400"
                  : "text-paper/25 hover:text-paper/60"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </div>

        {/* Точки-переключатели (мобильные) */}
        <div className="relative flex justify-center gap-2 pb-6 lg:hidden">
          {Array.from({ length: slideCount }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Слайд ${i + 1} из ${slideCount}`}
              aria-current={active === i}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                active === i
                  ? "w-8 bg-accent-400"
                  : "w-2.5 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Слайд 1: промо бренда + парящие товары ─── */

function SlideBrand({ active, products = [] }: { active: boolean; products?: HeroProduct[] }) {
  const boxer = products[0];
  const second = products[1];

  /** Короткое имя для выносок: без «Источник бесперебойного питания» и бренда */
  const shortName = (name: string) =>
    name
      .replace(/^Источник бесперебойного питания\s*/i, "")
      .replace(/^MAKELSAN\s*/i, "");

  /** Локальный вырез; если для slug нет PNG — фото с площадки */
  const cutout = (p: HeroProduct) => HERO_CUTOUTS[p.slug];

  const price = (p: HeroProduct) =>
    p.priceKopecks !== null ? formatPriceShort(p.priceKopecks) : "цена по запросу";

  return (
    <div
      className={`grid gap-12 pb-16 pt-16 transition-all duration-700 ease-out sm:pb-16 sm:pt-16 lg:grid-cols-2 lg:items-center lg:pb-20 lg:pt-20 ${
        active ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <div>
        <div className="section-num text-6xl text-accent-400 sm:text-7xl" data-reveal="up">01</div>
        <div className="label-caps mt-4 text-accent-400" data-reveal="up" data-reveal-delay="60">
          Источники бесперебойного питания MAKELSAN
        </div>
        <h1 className="heading-caps mt-5 text-4xl sm:text-6xl lg:text-[4.2rem]" data-reveal="heading" data-reveal-delay="100">
          Промышленное бесперебойное питание для бизнеса и производства
        </h1>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-paper/65" data-reveal="up" data-reveal-delay="180">
          Профессиональные ИБП Makelsan — от 10 кВА до 1 МВА: серверные и ЦОД,
          медицина и лаборатории, промышленность и энергетика. On-line системы
          двойного преобразования. Официальный магазин бренда, доставка по всей России.
        </p>
        <div className="mt-8 flex flex-wrap gap-3" data-reveal="up" data-reveal-delay="240">
          <Link
            href="/catalog"
            className="flex items-center gap-2 bg-accent-400 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-brand-950 transition hover:bg-accent-300"
          >
            Перейти в каталог <IconArrowRight />
          </Link>
          <Link
            href="/#series"
            className="flex items-center gap-2 border border-white/20 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-paper/85 transition hover:border-accent-400 hover:text-accent-400"
          >
            Серии ИБП
          </Link>
        </div>

        <div className="mt-10 grid max-w-xl grid-cols-2 gap-6 border-t border-white/15 pt-8 sm:grid-cols-3" data-reveal="up" data-reveal-delay="300">
          <div>
            <div className="section-num text-4xl text-accent-400">6</div>
            <div className="mt-1 text-xs leading-snug text-paper/55">
              серий ИБП в каталоге
            </div>
          </div>
          <div>
            <div className="section-num text-4xl text-accent-400">10–1000</div>
            <div className="mt-1 text-xs leading-snug text-paper/55">
              кВА — диапазон мощностей
            </div>
          </div>
          <div>
            <div className="section-num text-4xl text-accent-400">2 года</div>
            <div className="mt-1 text-xs leading-snug text-paper/55">
              гарантии на оборудование
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: композиция из парящих товаров с выносками */}
      <div className="relative hidden h-[430px] select-none pr-10 lg:block" data-reveal="img" data-reveal-delay="200">
        {/* оранжевое свечение позади товаров */}
        <div aria-hidden="true" className="absolute left-[36%] top-[30%] h-72 w-72 rounded-full bg-accent-400/20 blur-[90px]" />

        {/* тонкие рамки-квадраты в стиле SQUADRO */}
        <div aria-hidden="true" className="absolute left-[22%] top-[18%] aspect-square w-[44%] border border-white/10" />
        <div aria-hidden="true" className="absolute right-[4%] top-[8%] aspect-square w-[26%] border border-white/15" />
        <div aria-hidden="true" className="absolute left-[21%] top-[17%] h-2 w-2 bg-accent-400" />
        <div aria-hidden="true" className="absolute bottom-[14%] right-[12%] h-2 w-2 bg-accent-400" />

        {/* BOXER 15 — центральный */}
        {boxer && (
          <Link
            href={`/product/${boxer.slug}`}
            className="absolute left-[24%] top-[6%] w-[40%] transition hover:brightness-110"
            style={CUTOUT_SHADOW}
            title={boxer.name}
          >
            <span className="hero-float block">
              {cutout(boxer) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cutout(boxer)} alt={boxer.name} className="w-full" />
              ) : (
                <ProductImage path={boxer.image} alt={boxer.name} className="w-full" />
              )}
            </span>
          </Link>
        )}
        {/* BOXER S — справа ниже */}
        {second && (
          <Link
            href={`/product/${second.slug}`}
            className="absolute right-[6%] top-[16%] w-[24%] transition hover:brightness-110"
            style={CUTOUT_SHADOW}
            title={second.name}
          >
            <span className="hero-float block [animation-delay:-1.6s]">
              {cutout(second) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cutout(second)} alt={second.name} className="w-full" />
              ) : (
                <ProductImage path={second.image} alt={second.name} className="w-full" />
              )}
            </span>
          </Link>
        )}

        {/* выноски-аннотации (текстовые дубли ссылок — только для чтения) */}
        {boxer && (
          <span aria-hidden="true" className="absolute left-[2%] top-[36%]">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-accent-400" />
              <span className="h-px w-14 bg-gradient-to-r from-accent-400/80 to-accent-400/0" />
            </span>
            <span className="label-caps mt-2 block text-[11px] text-paper/80">
              {shortName(boxer.name)}
            </span>
            <span className="section-num mt-0.5 block text-lg text-accent-400">
              {price(boxer)}
            </span>
          </span>
        )}
        {second && (
          <span aria-hidden="true" className="absolute bottom-[4%] right-[6%]">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-accent-400" />
              <span className="h-px w-14 bg-gradient-to-r from-accent-400/80 to-accent-400/0" />
            </span>
            <span className="label-caps mt-2 block text-[11px] text-paper/80">
              {shortName(second.name)}
            </span>
            <span className="section-num mt-0.5 block text-lg text-accent-400">
              {price(second)}
            </span>
          </span>
        )}
      </div>

      {/* Mobile: упрощённый ряд вырезов */}
      <div className="relative flex items-end justify-center gap-6 lg:hidden">
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-400/15 blur-[70px]" />
        {products.slice(0, 2).map((p) => (
          <Link
            key={p.slug}
            href={`/product/${p.slug}`}
            className="group relative flex w-36 flex-col items-center text-center"
          >
            <span className="flex w-full items-center justify-center" style={CUTOUT_SHADOW}>
              {cutout(p) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cutout(p)} alt={p.name} className="max-h-44 w-auto" />
              ) : (
                <ProductImage path={p.image} alt={p.name} className="h-40 w-full" />
              )}
            </span>
            <span className="label-caps mt-3 block text-[10px] text-paper/80">{shortName(p.name)}</span>
            <span className="section-num mt-0.5 block text-sm text-accent-400">
              {price(p)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Слайд 2: решения по отраслям ─── */

function SlideSolutions({ active }: { active: boolean }) {
  const items = [
    { href: "/solutions/cod", title: "ЦОД и серверные", desc: "Трёхфазные on-line ИБП для непрерывности IT-инфраструктуры" },
    { href: "/solutions/medicina", title: "Медицина", desc: "Чистое питание медицинского оборудования и лабораторий" },
    { href: "/solutions/promyshlennost", title: "Промышленность", desc: "ИБП для станков, производственных линий и АСУ ТП" },
    { href: "/solutions/sensitive", title: "Точная электроника", desc: "Защита измерительных комплексов, связи и вещания" },
  ];

  return (
    <div
      className={`grid gap-12 pb-16 pt-16 transition-all duration-700 ease-out sm:pb-16 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pb-20 lg:pt-20 ${
        active ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <div>
        <div className="section-num text-6xl text-accent-400 sm:text-7xl">02</div>
        <div className="label-caps mt-4 text-accent-400">Решения по отраслям</div>
        <h2 className="heading-caps mt-5 text-4xl sm:text-5xl lg:text-[3.6rem]">
          Подберём ИБП под вашу задачу
        </h2>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-paper/65">
          От серверной на 10 кВА до мегаваттной системы питания ЦОД — каталог
          разделён по областям применения, чтобы выбор занял пару минут.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/solutions"
            className="flex items-center gap-2 bg-accent-400 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-brand-950 transition hover:bg-accent-300"
          >
            Все решения <IconArrowRight />
          </Link>
          <Link
            href="/kb"
            className="flex items-center gap-2 border border-white/20 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-paper/85 transition hover:border-accent-400 hover:text-accent-400"
          >
            Как выбрать ИБП
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="border border-white/10 bg-brand-900/60 p-5 transition hover:border-accent-400/50 hover:bg-brand-800"
          >
            <div className="text-sm font-bold">{s.title}</div>
            <p className="mt-2 text-xs leading-relaxed text-paper/60">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
