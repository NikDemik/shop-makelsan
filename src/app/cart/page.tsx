import type { Metadata } from "next";
import CartView from "@/components/CartView";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Корзина",
  robots: { index: false },
};

export default async function CartPage() {
  const session = await getSession();

  return (
    <div className="mx-auto max-w-site px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="heading-caps text-3xl sm:text-5xl" data-reveal="heading">Корзина</h1>
      <div className="mt-8">
        <CartView isB2B={session?.accountType === "B2B"} loggedIn={session !== null} />
      </div>
    </div>
  );
}
