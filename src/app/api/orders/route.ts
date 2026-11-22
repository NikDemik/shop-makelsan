import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

type IncomingItem = { code: string; qty: number };

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const type = body.type === "B2B" ? "B2B" : "B2C";
  const customerName = String(body.customerName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const email = String(body.email ?? "").trim();
  const companyName = String(body.companyName ?? "").trim();
  const inn = String(body.inn ?? "").trim();
  const city = String(body.city ?? "").trim();
  const address = String(body.address ?? "").trim();
  const delivery = body.delivery === "tc" ? "tc" : "pickup";
  const payment = ["card", "receipt", "invoice"].includes(String(body.payment))
    ? String(body.payment)
    : "card";
  const comment = String(body.comment ?? "").trim();
  const rawItems = Array.isArray(body.items) ? (body.items as IncomingItem[]) : [];

  if (!customerName || !phone || !email) {
    return NextResponse.json({ error: "Заполните контактные данные" }, { status: 400 });
  }
  if (type === "B2B" && (!companyName || !inn)) {
    return NextResponse.json({ error: "Укажите реквизиты организации" }, { status: 400 });
  }
  if (delivery === "tc" && (!city || !address)) {
    return NextResponse.json({ error: "Укажите город и адрес доставки" }, { status: 400 });
  }
  const cleaned = rawItems.filter(
    (i) => typeof i.code === "string" && Number.isInteger(i.qty) && i.qty > 0
  );
  if (cleaned.length === 0) {
    return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
  }

  // Цены сверяем с базой: заказывать можно только товары с ценой в рублях
  const products = await prisma.product.findMany({
    where: { slug: { in: cleaned.map((i) => i.code) }, active: true },
  });

  const items = cleaned.flatMap((i) => {
    const p = products.find((x) => x.slug === i.code);
    if (!p || p.priceKopecks === null) return [];
    return [{ product: p, qty: Math.min(i.qty, 999), unitPrice: p.saleKopecks ?? p.priceKopecks }];
  });
  if (items.length === 0) {
    return NextResponse.json(
      { error: "Товары не найдены или цена формируется по запросу" },
      { status: 400 }
    );
  }

  const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const discount = type === "B2B" ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal - discount;

  const user = await prisma.user.findUnique({ where: { id: session.uid } });
  const orderType: "B2C" | "B2B" = user?.accountType === "B2B" || type === "B2B" ? "B2B" : "B2C";

  try {
    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const last = await tx.order.findFirst({ orderBy: { number: "desc" } });
      const lastNum = last ? parseInt(last.number.replace("IM-", ""), 10) : 10000;
      const number = `IM-${(Number.isNaN(lastNum) ? 10000 : lastNum) + 1}`;

      return tx.order.create({
        data: {
          number,
          userId: session.uid,
          type: orderType,
          customerName,
          phone,
          email,
          companyName: orderType === "B2B" ? companyName || user?.companyName || null : null,
          inn: orderType === "B2B" ? inn || user?.inn || null : null,
          city: city || null,
          address: address || null,
          delivery,
          payment,
          comment: comment || null,
          discountKopecks: discount,
          totalKopecks: total,
          items: {
            create: items.map((it) => ({
              productId: it.product.id,
              code: it.product.slug,
              name: it.product.name,
              qty: it.qty,
              priceKopecks: it.unitPrice,
            })),
          },
        },
      });
    });

    return NextResponse.json({ id: order.id, number: order.number });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка создания заказа";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
