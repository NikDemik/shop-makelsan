import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import ProfileForm from "@/components/ProfileForm";

export const metadata = { title: "Профиль" };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/profile");

  const user = await prisma.user.findUnique({ where: { id: session.uid } });
  if (!user) redirect("/login?next=/account/profile");

  return (
    <div>
      <h1 className="text-2xl heading-caps">Профиль</h1>
      <p className="mt-1.5 text-sm text-muted">E-mail: {user.email}</p>
      <div className="mt-6">
        <ProfileForm
          user={{
            name: user.name,
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
