import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/account/ProfileForm";
import { getAuthenticatedUser } from "@/modules/auth/server";
import { getProfileForUser } from "@/modules/profile/service";

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const profile = (await getProfileForUser(user.id)) ?? {
    id: user.id,
    fullName: null,
    phone: null,
    companyName: null,
    rut: null,
  };

  return (
    <div className="page-shell py-10">
      <p className="section-kicker">Mi cuenta</p>
      <h1 className="mt-3 text-4xl font-semibold">Editar perfil</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-muted)]">
        Mantén tus datos actualizados para agilizar tus próximos pedidos.
      </p>
      <div className="mt-8 max-w-3xl">
        <ProfileForm initial={profile} email={user.email ?? ""} />
      </div>
    </div>
  );
}
