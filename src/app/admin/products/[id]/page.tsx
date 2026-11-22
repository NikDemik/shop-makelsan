import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/ProductForm";
import { effectivePriceKopecks } from "@/lib/format";

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const product = await prisma.product.findUnique({
    where: { id: (await params).id },
    include: { series: true },
  });
  if (!product) notFound();

  const eff = effectivePriceKopecks(product);

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-muted transition hover:text-accent-600">
        ← Все товары
      </Link>
      <h1 className="mt-3 text-2xl heading-caps">
        Цена товара <span className="text-base text-muted">{product.name}</span>
      </h1>
      <p className="mt-1 text-sm text-muted">
        Серия: {product.series?.name ?? "—"} ·{" "}
        <Link href={`/product/${product.slug}`} className="text-accent-600 hover:underline">
          открыть на витрине
        </Link>
      </p>
      <div className="mt-6">
        <ProductForm
          initial={{
            id: product.id,
            name: product.name,
            article: product.article,
            slug: product.slug,
            priceUsd: product.priceUsd,
            priceRub: eff !== null ? (eff / 100).toFixed(2) : "",
            isOverridden: product.priceOverrideKopecks !== null,
          }}
        />
      </div>
    </div>
  );
}
