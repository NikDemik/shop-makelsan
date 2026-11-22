"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBox, IconChart, IconCart, IconUser, Logo, IconArrowRight } from "@/components/icons";

const NAV = [
  { href: "/admin", label: "Дашборд", icon: IconChart },
  { href: "/admin/orders", label: "Заказы", icon: IconCart },
  { href: "/admin/products", label: "Товары", icon: IconBox },
  { href: "/admin/users", label: "Пользователи", icon: IconUser },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border border-white/10 bg-brand-900/60 p-4 lg:sticky lg:top-20 lg:w-60">
      <div className="flex items-center gap-2.5 px-2 pb-3">
        <Logo className="h-8 w-8" />
        <div>
          <div className="text-sm font-extrabold text-paper">MAKELSAN Admin</div>
          <div className="text-[10px] uppercase tracking-widest text-paper/40">панель управления</div>
        </div>
      </div>
      <nav className="mt-2 space-y-1">
        {NAV.map((i) => {
          const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
          return (
            <Link
              key={i.href}
              href={i.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-accent-400 text-brand-950"
                  : "text-paper/60 hover:bg-white/5 hover:text-paper"
              }`}
            >
              <i.icon className="h-4.5 w-4.5" />
              {i.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/"
        className="mt-auto flex items-center gap-2 px-4 pt-4 text-xs text-paper/40 transition hover:text-accent-400"
      >
        На витрину <IconArrowRight className="h-3.5 w-3.5" />
      </Link>
    </aside>
  );
}
