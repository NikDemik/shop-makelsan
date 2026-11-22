import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Вход", robots: { index: false, follow: false } };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/account";

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 py-12">
      <div className="w-full border border-line bg-white p-8">
        <div className="label-caps text-accent-600">Личный кабинет</div>
        <h1 className="mt-2 text-2xl heading-caps">Вход</h1>
        <p className="mt-1.5 text-sm text-muted">
          Для оформления заказов, истории покупок и B2B-документов.
        </p>
        <div className="mt-6">
          <Suspense>
            <LoginForm next={next} />
          </Suspense>
        </div>
        <div className="mt-6 bg-paper p-4 text-xs leading-relaxed text-muted">
          <span className="font-bold text-ink">Демо-доступы:</span><br />
          Администратор: <span className="font-mono">admin@makelsan-ups.ru / admin123</span><br />
          Покупатель — зарегистрируйтесь на сайте.
        </div>
      </div>
    </div>
  );
}
