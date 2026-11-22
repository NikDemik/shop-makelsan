import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Оформление заказа",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/checkout");

  const user = await prisma.user.findUnique({ where: { id: session.uid } });
  if (!user) redirect("/login?next=/checkout");

  return (
    <div className="mx-auto max-w-site px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="heading-caps text-3xl sm:text-5xl">Оформление заказа</h1>
      <div className="mt-8">
        <CheckoutForm
          user={{
            name: user.name,
            email: user.email,
            phone: user.phone,
            accountType: user.accountType,
            companyName: user.companyName,
            inn: user.inn,
            city: user.city,
            address: user.address,
          }}
        />
      </div>
    </div>
  );
}
