import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import AddToCart from "@/components/AddToCart";
import CompareButton from "@/components/CompareButton";
import { formatKva, formatPrice, formatPriceShort } from "@/lib/format";

export type ProductCardData = {
  slug: string;
  article: string | null;
  name: string;
  powerKva: number | null;
  type: string | null;
  priceKopecks: number | null;
  saleKopecks: number | null;
  image: string | null;
  seriesName: string | null;
  seriesSlug: string | null;
};

export default function ProductCard({
  p,
  revealDelay,
}: {
  p: ProductCardData;
  /** Ступенчатая задержка появления при скролле, мс (для сеток) */
  revealDelay?: number;
}) {
  const hasPrice = p.priceKopecks !== null;
  const saleMode = hasPrice && p.saleKopecks !== null;

  return (
    <div
      className="group flex flex-col border border-line bg-white p-5 transition hover:border-accent-400/60 hover:shadow-[0_8px_30px_rgba(180,86,14,0.1)]"
      data-reveal="up"
      data-reveal-delay={revealDelay}
    >
      <div className="flex items-center justify-between gap-2">
        {p.seriesName && p.seriesSlug ? (
          <Link
            href={`/catalog/${p.seriesSlug}`}
            className="label-caps text-accent-600 transition hover:text-accent-500"
          >
            {p.seriesName}
          </Link>
        ) : (
          <span className="label-caps text-muted">ИБП Makelsan</span>
        )}
        {saleMode && (
          <span className="bg-accent-400 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-950">
            Акция
          </span>
        )}
      </div>

      <Link href={`/product/${p.slug}`} className="mt-3 flex h-44 items-center justify-center overflow-hidden bg-paper">
        <ProductImage
          path={p.image}
          alt={p.name}
          className="h-full w-full transition duration-300 group-hover:scale-[1.05]"
        />
      </Link>

      <Link href={`/product/${p.slug}`} className="mt-4 block text-sm font-bold leading-snug text-ink transition hover:text-accent-600">
        {p.name}
      </Link>
      <div className="mt-1.5 text-xs text-muted">
        {p.powerKva !== null && `${formatKva(p.powerKva)} · `}
        {p.type === "двойного преобразования (on-line)" ? "On-line" : p.type === "линейно-интерактивный (line-interactive)" ? "Линейно-интерактивный" : p.type}
        {p.article && ` · арт. ${p.article}`}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-4">
        {hasPrice ? (
          <div className="leading-tight">
            {saleMode ? (
              <>
                <div className="section-num text-xl text-accent-600">
                  {formatPriceShort(p.saleKopecks!)}
                </div>
                <div className="text-xs text-muted line-through">
                  {formatPrice(p.priceKopecks!)}
                </div>
              </>
            ) : (
              <span className="section-num text-xl">
                {formatPriceShort(p.priceKopecks!)}
              </span>
            )}
          </div>
        ) : (
          <Link
            href={`/product/${p.slug}`}
            className="bg-brand-950 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-paper transition hover:bg-brand-800"
          >
            Цена по запросу
          </Link>
        )}
        <div className="flex items-center gap-2">
          <CompareButton
            compact
            item={{
              slug: p.slug,
              name: p.name,
              article: p.article ?? "",
              powerKva: p.powerKva,
              type: p.type,
              priceKopecks: p.priceKopecks,
              seriesName: p.seriesName,
            }}
          />
          {hasPrice && (
            <AddToCart
              code={p.slug}
              name={p.name}
              article={p.article ?? ""}
              priceKopecks={saleMode ? p.saleKopecks! : p.priceKopecks!}
              compact
            />
          )}
        </div>
      </div>
    </div>
  );
}
