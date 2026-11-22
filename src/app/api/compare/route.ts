import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { effectivePriceKopecks } from "@/lib/format";

/** Полные данные товаров по слагам — для страницы сравнения */
export async function POST(req: NextRequest) {
  let slugs: string[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body.slugs)) {
      slugs = body.slugs
        .filter((s: unknown): s is string => typeof s === "string")
        .slice(0, 8);
    }
  } catch {
    // ignore
  }

  if (!slugs.length) return NextResponse.json({ products: [] });

  const rows = await prisma.product.findMany({
    where: { slug: { in: slugs }, active: true },
    include: { series: { select: { name: true, slug: true } } },
  });
  const bySlug = new Map(rows.map((p) => [p.slug, p]));

  // Сохраняем порядок слагов из запроса — колонки сравнения не «прыгают»
  const products = slugs
    .filter((slug) => bySlug.has(slug))
    .map((slug) => {
      const p = bySlug.get(slug)!;
      const saleMode = p.priceOverrideKopecks === null && p.saleKopecks !== null;
      return {
        slug: p.slug,
        name: p.name,
        article: p.article,
        powerKva: p.powerKva,
        powerKw: p.powerKw,
        type: p.type,
        phasesIn: p.phasesIn,
        phasesOut: p.phasesOut,
        priceKopecks: effectivePriceKopecks(p),
        regularPriceKopecks: saleMode ? p.priceKopecks : null,
        image: p.image,
        deliveryDays: p.deliveryDays,
        seriesName: p.series?.name ?? null,
        seriesSlug: p.series?.slug ?? null,
        specs: (p.specs ?? {}) as Record<string, string>,
      };
    });

  return NextResponse.json({ products });
}
