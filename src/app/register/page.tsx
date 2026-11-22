import RegisterForm from "@/components/RegisterForm";

export const metadata = { title: "Регистрация", robots: { index: false, follow: false } };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/account";
  const isB2B = sp.type === "b2b";

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="border border-line bg-white p-8">
        <div className="label-caps text-accent-600">Личный кабинет</div>
        <h1 className="mt-2 text-2xl heading-caps">Регистрация</h1>
        <p className="mt-1.5 text-sm text-muted">
          Для организаций — безналичная оплата по счёту и скидка 5% на заказы.
        </p>
        <div className="mt-6">
          <RegisterForm next={next} defaultB2B={isB2B} />
        </div>
      </div>
    </div>
  );
}
