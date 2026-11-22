import { getSession } from "@/lib/auth";
import AccountNav from "@/components/AccountNav";

export const metadata = { title: "Личный кабинет", robots: { index: false, follow: false } };

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="mx-auto max-w-site px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:items-start">
        <aside className="border border-line bg-paper/60 p-4">
          <div className="border-b border-line px-4 pb-3">
            <div className="text-xs text-muted">Личный кабинет</div>
            <div className="mt-0.5 truncate text-sm font-bold">{session?.name}</div>
          </div>
          <div className="pt-3">
            <AccountNav isAdmin={session?.role === "ADMIN"} />
          </div>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
