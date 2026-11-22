"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SideNavItem = { href: string; title: string };

/** Левая колонка текстовых страниц: навигация по разделу */
export default function SideNav({ title, items }: { title: string; items: SideNavItem[] }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <nav aria-label={title}>
      <div className="label-caps text-muted">{title}</div>
      <ul className="mt-3 space-y-1 border-l border-line text-sm">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "-ml-px block border-l-2 border-accent-500 py-1.5 pl-3 font-semibold text-accent-600"
                    : "-ml-px block border-l-2 border-transparent py-1.5 pl-3 text-muted transition hover:border-line hover:text-ink"
                }
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
