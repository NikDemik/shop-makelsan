"use client";

import { useEffect, useState } from "react";

export type TocChild = { id: string; title: string };
export type TocItem = TocChild & { children?: TocChild[] };

/** Оглавление страницы с подсветкой текущего блока при прокрутке */
export default function TocNav({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const ids = items.flatMap((i) => [i.id, ...(i.children?.map((c) => c.id) ?? [])]);
    if (ids.length === 0) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      // h-16 (шапка) + запас
      const offset = 120;
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) current = id;
      }
      // Доскроллили до низа — подсвечиваем последний пункт
      if (
        window.innerHeight + Math.round(window.scrollY) >=
        document.documentElement.scrollHeight - 2
      ) {
        current = ids[ids.length - 1];
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  const linkCls = (id: string, extra = "") =>
    [
      "block border-l-2 py-1 transition",
      extra,
      id === activeId
        ? "-ml-px border-accent-500 font-semibold text-accent-600"
        : "-ml-px border-transparent text-muted hover:border-line hover:text-ink",
    ].join(" ");

  return (
    <ul className="space-y-1.5 border-l border-line text-sm">
      {items.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} className={linkCls(item.id, "pl-3")}>
            {item.title}
          </a>
          {item.children && item.children.length > 0 && (
            <ul className="mt-1 space-y-1 text-xs">
              {item.children.map((child) => (
                <li key={child.id}>
                  <a href={`#${child.id}`} className={linkCls(child.id, "pl-6")}>
                    {child.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
