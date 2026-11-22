import Link from "next/link";
import { Logo, IconPhone, IconMail, IconPin } from "@/components/icons";
import { prisma } from "@/lib/prisma";
import { SITE_EMAIL, SITE_PHONE } from "@/lib/seo";

export default async function Footer() {
  const series = await prisma.series.findMany({
    orderBy: { sortOrder: "asc" },
    take: 6,
  });

  return (
    <footer id="contacts" className="border-t border-white/10 bg-brand-950 text-paper">
      <div className="mx-auto grid max-w-site gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo className="h-10 w-10" />
            <span className="font-display text-xl font-semibold uppercase leading-none tracking-[0.08em]">
              MAKELSAN<span className="text-accent-400">Маркет</span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-paper/55">
            Источники бесперебойного питания Makelsan для бизнеса,
            медицины и промышленности. Официальный магазин бренда, доставка по всей России.
          </p>
        </div>

        <div>
          <div className="label-caps text-accent-400">Каталог</div>
          <ul className="mt-4 space-y-2.5 text-sm text-paper/70">
            {series.map((s) => (
              <li key={s.id}>
                <Link href={`/catalog/${s.slug}`} className="transition hover:text-accent-400">
                  {s.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/catalog" className="font-medium text-accent-400 transition hover:text-accent-300">
                Все серии →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="label-caps text-accent-400">Покупателям</div>
          <ul className="mt-4 space-y-2.5 text-sm text-paper/70">
            <li><Link href="/delivery" className="transition hover:text-accent-400">Оплата и доставка</Link></li>
            <li><Link href="/warranty" className="transition hover:text-accent-400">Гарантия и сервис</Link></li>
            <li><Link href="/documentation" className="transition hover:text-accent-400">Документация</Link></li>
            <li><Link href="/kb" className="transition hover:text-accent-400">База знаний</Link></li>
            <li><Link href="/about" className="transition hover:text-accent-400">О бренде Makelsan</Link></li>
            <li><Link href="/register" className="transition hover:text-accent-400">Регистрация B2B</Link></li>
            <li><Link href="/account/orders" className="transition hover:text-accent-400">Мои заказы</Link></li>
          </ul>
        </div>

        <div>
          <div className="label-caps text-accent-400">Контакты</div>
          <ul className="mt-4 space-y-3 text-sm text-paper/70">
            <li className="flex items-center gap-2.5">
              <IconPhone className="h-4 w-4 text-accent-400" />
              <a href={`tel:${SITE_PHONE.replace(/[^+\d]/g, "")}`} className="transition hover:text-accent-400">
                {SITE_PHONE}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <IconMail className="h-4 w-4 text-accent-400" />
              <a href={`mailto:${SITE_EMAIL}`} className="transition hover:text-accent-400">{SITE_EMAIL}</a>
            </li>
            <li className="flex items-start gap-2.5">
              <IconPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
              <span>Москва, ул. Электрозаводская, д. 21, стр. 4<br />склад и шоурум, пн–пт 9:00–18:00</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-site flex-col gap-3 px-4 py-5 text-xs text-paper/40 sm:flex-row sm:flex-wrap sm:items-center sm:px-6 lg:px-8">
          <span>© 2026 MAKELSAN Маркет. Все права защищены.</span>
          <nav className="flex flex-wrap gap-x-5 gap-y-1.5">
            <Link href="/about" className="transition hover:text-paper/70">О бренде</Link>
            <Link href="/contacts" className="transition hover:text-paper/70">Контакты</Link>
            <Link href="/privacy" className="transition hover:text-paper/70">Политика конфиденциальности</Link>
          </nav>
          <span className="sm:ml-auto">Цены на сайте не являются публичной офертой.</span>
        </div>
      </div>
    </footer>
  );
}
