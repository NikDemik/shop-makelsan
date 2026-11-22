import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Картинки товаров по слагам — для клиентской корзины */
export async function POST(req: NextRequest) {
  let slugs: string[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body.slugs)) {
      slugs = body.slugs.filter((s: unknown): s is string => typeof s === "string").slice(0, 100);
    }
  } catch {
    // ignore
  }

  if (!slugs.length) return NextResponse.json({ images: {} });

  const products = await prisma.product.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, image: true },
  });

  const images: Record<string, string> = {};
  for (const p of products) {
    if (p.image) images[p.slug] = p.image;
  }

  return NextResponse.json({ images });
}
