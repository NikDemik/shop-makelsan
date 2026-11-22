"use client";

import { useActionState, useState } from "react";
import { updateProfileAction, type FormState } from "@/actions/auth";

type Props = {
  user: {
    name: string;
    phone: string | null;
    accountType: "B2C" | "B2B";
    companyName: string | null;
    inn: string | null;
    city: string | null;
    address: string | null;
  };
};

const inputCls =
  "w-full border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent-400";

export default function ProfileForm({ user }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfileAction, {});
  const [type, setType] = useState<"B2C" | "B2B">(user.accountType);

  return (
    <form action={action} className="space-y-6">
      <div className="border border-line bg-white p-6">
        <h2 className="text-lg font-bold">Личные данные</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-muted">Имя и фамилия *</span>
            <input name="name" required defaultValue={user.name} className={`mt-1.5 ${inputCls}`} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted">Телефон</span>
            <input name="phone" defaultValue={user.phone ?? ""} placeholder="+7 (___) ___-__-__" className={`mt-1.5 ${inputCls}`} />
          </label>
        </div>

        <div className="mt-5">
          <span className="text-xs font-semibold text-muted">Тип покупателя</span>
          <div className="mt-2 grid grid-cols-2 gap-3">
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
        </div>

        {type === "B2B" && (
          <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-muted">Организация</span>
              <input name="companyName" defaultValue={user.companyName ?? ""} className={`mt-1.5 ${inputCls}`} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted">ИНН</span>
              <input name="inn" defaultValue={user.inn ?? ""} className={`mt-1.5 ${inputCls}`} />
            </label>
          </div>
        )}

        <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-muted">Город</span>
            <input name="city" defaultValue={user.city ?? ""} className={`mt-1.5 ${inputCls}`} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted">Адрес</span>
            <input name="address" defaultValue={user.address ?? ""} className={`mt-1.5 ${inputCls}`} />
          </label>
        </div>
      </div>

      <div className="border border-line bg-white p-6">
        <h2 className="text-lg font-bold">Смена пароля</h2>
        <p className="mt-1 text-xs text-muted">Оставьте поле пустым, чтобы не менять пароль.</p>
        <label className="mt-4 block max-w-sm">
          <span className="text-xs font-semibold text-muted">Новый пароль</span>
          <input name="newPassword" type="password" minLength={6} className={`mt-1.5 ${inputCls}`} />
        </label>
      </div>

      {state.error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">{state.error}</div>
      )}
      {state.ok && !state.error && (
        <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
          Профиль сохранён.
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-accent-400 px-8 py-3.5 text-sm font-bold text-brand-950 transition hover:bg-accent-300 disabled:opacity-60"
      >
        {pending ? "Сохраняем…" : "Сохранить изменения"}
      </button>
    </form>
  );
}
