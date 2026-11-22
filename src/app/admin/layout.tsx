import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";

export const metadata = { title: "Панель управления", robots: { index: false, follow: false } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (session.role !== "ADMIN") redirect("/account");

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-site px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
          <AdminNav />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
