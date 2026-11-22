"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type FormState } from "@/actions/auth";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="text-xs font-semibold text-muted">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1.5 w-full border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent-400"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-muted">Пароль</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1.5 w-full border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent-400"
        />
      </label>

      {state.error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-accent-400 py-3.5 text-sm font-bold text-brand-950 transition hover:bg-accent-300 disabled:opacity-60"
      >
        {pending ? "Входим…" : "Войти"}
      </button>

      <p className="text-center text-sm text-muted">
        Нет аккаунта?{" "}
        <Link
          href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-accent-600 hover:underline"
        >
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}
