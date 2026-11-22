"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerAction, type FormState } from "@/actions/auth";

const inputCls =
  "w-full border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent-400";

export default function RegisterForm({ next, defaultB2B }: { next: string; defaultB2B: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(registerAction, {});
  const [type, setType] = useState<"B2C" | "B2B">(defaultB2B ? "B2B" : "B2C");

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div className="grid grid-cols-2 gap-3">
        {(
          [
            { v: "B2C", t: "Физическое лицо" },
            { v: "B2B", t: "Организация" },
          ] as const
        ).map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => setType(o.v)}
            className={`border p-3.5 text-sm font-bold transition ${
              type === o.v ? "border-accent-400 bg-accent-400/5" : "border-line hover:border-accent-400/50"
            }`}
          >
            {o.t}
          </button>
        ))}
      </div>
      <input type="hidden" name="accountType" value={type} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold text-muted">Имя и фамилия *</span>
          <input name="name" required className={`mt-1.5 ${inputCls}`} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted">Телефон</span>
          <input name="phone" placeholder="+7 (___) ___-__-__" className={`mt-1.5 ${inputCls}`} />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-muted">E-mail *</span>
        <input name="email" type="email" required className={`mt-1.5 ${inputCls}`} />
      </label>

      {type === "B2B" && (
        <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-muted">Организация *</span>
            <input name="companyName" required={type === "B2B"} className={`mt-1.5 ${inputCls}`} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted">ИНН</span>
            <input name="inn" className={`mt-1.5 ${inputCls}`} />
          </label>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold text-muted">Пароль *</span>
          <input name="password" type="password" required minLength={6} className={`mt-1.5 ${inputCls}`} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted">Повторите пароль *</span>
          <input name="confirm" type="password" required minLength={6} className={`mt-1.5 ${inputCls}`} />
        </label>
      </div>

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
        {pending ? "Создаём аккаунт…" : "Зарегистрироваться"}
      </button>

      <p className="text-center text-sm text-muted">
        Уже есть аккаунт?{" "}
        <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-accent-600 hover:underline">
          Войти
        </Link>
      </p>
    </form>
  );
}
