"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SessionPayload } from "@/lib/auth";
import { Logo, IconUser } from "@/components/icons";
import CartLinkClient from "@/components/CartLinkClient";
import CatalogMenu, { type CatalogCategory } from "@/components/CatalogMenu";
import { logoutAction } from "@/actions/auth";

/**
 * Фиксируемая строка хедера: липнет к верху при скролле (топлайн над ней
 * уезжает), а при скролле становится полупрозрачной.
 * Контент (сессия) приходит пропсами из серверного Header.
 */
export default function HeaderBar({
  session,
  catalog,
}: {
  session: SessionPayload | null;
  catalog: CatalogCategory[];
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-white/10 text-paper transition-colors duration-300 ${
        scrolled ? "bg-brand-950/60 backdrop-blur-md" : "bg-brand-950"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-site items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-10 w-10" />
          <span className="font-display text-xl font-semibold uppercase leading-none tracking-[0.08em]">
            MAKELSAN<span className="text-accent-400">Маркет</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-paper/65 lg:flex">
          <CatalogMenu categories={catalog} />
          <Link href="/#series" className="transition hover:text-accent-400">Серии</Link>
          <Link href="/solutions" className="transition hover:text-accent-400">Решения</Link>
          <Link href="/documentation" className="transition hover:text-accent-400">Документация</Link>
          <Link href="/contacts" className="transition hover:text-accent-400">Контакты</Link>
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          {session?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="hidden border border-accent-400/40 px-3 py-1.5 text-xs font-semibold text-accent-400 transition hover:bg-accent-400/10 sm:block"
            >
              Панель управления
            </Link>
          )}

          <CartLinkClient />

          {session ? (
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-paper/85 transition hover:text-accent-400"
              >
                <IconUser className="h-5 w-5" />
                <span className="hidden max-w-32 truncate sm:block">{session.name}</span>
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="hidden border border-white/15 px-3 py-1.5 text-xs text-paper/60 transition hover:border-white/30 hover:text-paper md:block"
                >
                  Выйти
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 bg-accent-400 px-3.5 py-2 text-sm font-semibold text-brand-950 transition hover:bg-accent-300"
            >
              <IconUser className="h-4.5 w-4.5" />
              <span className="hidden sm:block">Войти</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
