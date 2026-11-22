"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, getSession } from "@/lib/auth";

export type FormState = { error?: string; ok?: boolean };

export async function registerAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const accountType = formData.get("accountType") === "B2B" ? "B2B" : "B2C";
  const companyName = String(formData.get("companyName") ?? "").trim();
  const inn = String(formData.get("inn") ?? "").trim();
  const next = String(formData.get("next") ?? "/account");

  if (!name || !email || !password) return { error: "Заполните обязательные поля" };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Некорректный e-mail" };
  if (password.length < 6) return { error: "Пароль должен быть не короче 6 символов" };
  if (password !== confirm) return { error: "Пароли не совпадают" };
  if (accountType === "B2B" && !companyName)
    return { error: "Укажите название организации" };

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Пользователь с таким e-mail уже зарегистрирован" };

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 10),
      name,
      phone: phone || null,
      accountType,
      companyName: accountType === "B2B" ? companyName : null,
      inn: accountType === "B2B" ? inn || null : null,
    },
  });

  await createSession({
    uid: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    accountType: user.accountType,
  });

  redirect(next);
}

export async function loginAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/account");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Неверный e-mail или пароль" };
  }

  await createSession({
    uid: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    accountType: user.accountType,
  });

  redirect(next || (user.role === "ADMIN" ? "/admin" : "/account"));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: "Требуется вход" };

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const accountType = formData.get("accountType") === "B2B" ? "B2B" : "B2C";
  const companyName = String(formData.get("companyName") ?? "").trim();
  const inn = String(formData.get("inn") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");

  if (!name) return { error: "Укажите имя" };
  if (newPassword && newPassword.length < 6)
    return { error: "Новый пароль должен быть не короче 6 символов" };

  await prisma.user.update({
    where: { id: session.uid },
    data: {
      name,
      phone: phone || null,
      accountType,
      companyName: accountType === "B2B" ? companyName || null : null,
      inn: accountType === "B2B" ? inn || null : null,
      city: city || null,
      address: address || null,
      ...(newPassword ? { passwordHash: await bcrypt.hash(newPassword, 10) } : {}),
    },
  });

  await createSession({
    uid: session.uid,
    email: session.email,
    name,
    role: session.role,
    accountType,
  });

  return { ok: true };
}
