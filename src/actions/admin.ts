"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { OrderStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Доступ запрещён");
  return session;
}

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  const allowed: OrderStatus[] = ["NEW", "CONFIRMED", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];
  if (!id || !allowed.includes(status)) return;

  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function toggleProductActiveAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return;
  await prisma.product.update({ where: { id }, data: { active: !p.active } });
  revalidatePath("/admin/products");
  revalidatePath("/catalog");
}

export type ProductFormState = { error?: string; ok?: boolean };

/**
 * Сохранение цены товара. Каталог наполняется синхронизацией с API, поэтому
 * админ управляет только ценой (руб.) и публикацией. Пустая цена → «по запросу».
 */
export async function saveProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Не указан товар" };

  const priceRubRaw = String(formData.get("priceRub") ?? "").trim().replace(",", ".");
  const priceRub = priceRubRaw === "" ? null : Number(priceRubRaw);

  if (priceRub !== null && (!Number.isFinite(priceRub) || priceRub < 0)) {
    return { error: "Некорректная цена" };
  }

  await prisma.product.update({
    where: { id },
    data: {
      priceOverrideKopecks:
        priceRub !== null && priceRub > 0 ? Math.round(priceRub * 100) : null,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  revalidatePath("/product");
  return { ok: true };
}
