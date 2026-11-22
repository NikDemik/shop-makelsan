import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { IconMail, IconPhone } from "@/components/icons";
import HeaderBar from "@/components/HeaderBar";
import type { CatalogCategory } from "@/components/CatalogMenu";
import { SITE_EMAIL, SITE_PHONE, SITE_PHONE_HREF } from "@/lib/seo";

/**
 * Категории выпадающего меню «Каталог» — по диапазону мощности серий.
 * Широкие серии (например, Модульные 10–2000 кВА) попадают в несколько категорий.
 */
function buildCatalogCategories(
  series: { slug: string; name: string; powerMin: number | null; powerMax: number | null }[]
): CatalogCategory[] {
  const cats: CatalogCategory[] = [
    { label: "До 10 кВА", series: [] },
    { label: "10–100 кВА", series: [] },
    { label: "Свыше 100 кВА", series: [] },
  ];
  for (const s of series) {
    const min = s.powerMin;
    const max = s.powerMax;
    let placed = false;
    if (max !== null && max <= 10) {
      cats[0].series.push(s);
      placed = true;
    }
    if (max !== null && max > 10 && min !== null && min <= 100) {
      cats[1].series.push(s);
      placed = true;
    }
    if (max !== null && max > 100) {
      cats[2].series.push(s);
      placed = true;
    }
    // Серия без данных о мощности — в среднюю группу
    if (!placed) cats[1].series.push(s);
  }
  return cats;
}

export default async function Header() {
  const [session, seriesList] = await Promise.all([
    getSession(),
    // В меню показываем только серии с активными товарами
    prisma.series.findMany({
      orderBy: { sortOrder: "asc" },
      where: { products: { some: { active: true } } },
      select: { slug: true, name: true, powerMin: true, powerMax: true },
    }),
  ]);
  const catalog = buildCatalogCategories(seriesList);

  return (
    <>
      {/* Topline с контактами: не фиксируется, уезжает при скролле */}
      <div className="bg-brand-900 text-paper">
        <div className="mx-auto flex h-9 max-w-site items-center justify-end gap-5 px-4 text-xs sm:px-6 lg:px-8">
          <a
            href={SITE_PHONE_HREF}
            className="flex items-center gap-1.5 text-paper/60 transition hover:text-accent-400"
          >
            <IconPhone className="h-3.5 w-3.5" />
            {SITE_PHONE}
          </a>
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="flex items-center gap-1.5 text-paper/60 transition hover:text-accent-400"
          >
            <IconMail className="h-3.5 w-3.5" />
            {SITE_EMAIL}
          </a>
        </div>
      </div>

      <HeaderBar session={session} catalog={catalog} />
    </>
  );
}
