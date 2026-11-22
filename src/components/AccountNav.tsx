import Link from "next/link";

const ITEMS = [
  { href: "/account", label: "Обзор" },
  { href: "/account/orders", label: "Мои заказы" },
  { href: "/account/profile", label: "Профиль" },
];

export default function AccountNav({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav className="space-y-1">
      {ITEMS.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className="block px-4 py-2.5 text-sm font-medium text-muted transition hover:bg-white hover:text-ink"
        >
          {i.label}
        </Link>
      ))}
      {isAdmin && (
        <Link
          href="/admin"
          className="block px-4 py-2.5 text-sm font-bold text-accent-600 transition hover:bg-white"
        >
          Панель управления →
        </Link>
      )}
    </nav>
  );
}
