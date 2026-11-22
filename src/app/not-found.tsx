import Link from "next/link";

export const metadata = { title: "Страница не найдена" };

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="text-7xl section-num text-accent-600 sm:text-8xl">404</div>
      <h1 className="mt-6 text-2xl heading-caps sm:text-3xl">
        Страница не найдена
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
        Возможно, модель обновилась в каталоге или ссылка устарела.
        Найдите нужный ИБП в каталоге — или позвоните нам, поможем
        с подбором: 8 800 505-10-10.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/catalog"
          className="bg-accent-400 px-6 py-3 text-sm font-bold text-brand-950 transition hover:bg-accent-300"
        >
          Перейти в каталог
        </Link>
        <Link
          href="/"
          className="border border-line bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:border-accent-400"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
