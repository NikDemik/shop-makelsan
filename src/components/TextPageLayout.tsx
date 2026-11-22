import type { ReactNode } from "react";
import TocNav, { type TocItem } from "@/components/TocNav";

/**
 * Обёртка текстовых страниц: контейнер max-w-site (1440px),
 * слева — навигация по разделу (leftNav), справа — оглавление страницы (toc).
 * На экранах <xl колонки скрываются, оглавление выводится как «Содержание»
 * перед контентом. Без toc/leftNav колонка центрируется на читабельной ширине.
 */
export default function TextPageLayout({
  leftNav,
  toc,
  children,
}: {
  leftNav?: ReactNode;
  toc?: TocItem[];
  children: ReactNode;
}) {
  const hasToc = !!toc && toc.length > 0;
  const hasLeft = !!leftNav;

  const gridCls = hasLeft
    ? hasToc
      ? "grid gap-10 xl:grid-cols-[minmax(0,230px)_minmax(0,1fr)_minmax(0,230px)]"
      : "grid gap-10 xl:grid-cols-[minmax(0,230px)_minmax(0,1fr)]"
    : "mx-auto max-w-3xl";

  return (
    <div className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:px-8">
      <div className={gridCls}>
        {hasLeft && (
          <aside className="hidden xl:block">
            <div className="sticky top-24">{leftNav}</div>
          </aside>
        )}

        <div className={hasLeft && !hasToc ? "mx-auto w-full max-w-3xl min-w-0" : "min-w-0"}>
          {hasToc && (
            <details className="mb-8 border border-line bg-white p-5 xl:hidden">
              <summary className="cursor-pointer text-sm font-bold">Содержание</summary>
              <div className="mt-3">
                <TocNav items={toc} />
              </div>
            </details>
          )}
          {children}
        </div>

        {hasToc && (
          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <div className="label-caps text-muted">На этой странице</div>
              <div className="mt-3">
                <TocNav items={toc} />
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
