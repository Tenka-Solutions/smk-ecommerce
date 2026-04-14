import Link from "next/link";
import { getAuthenticatedUser } from "@/modules/auth/server";

export default async function AccountPage() {
  const user = await getAuthenticatedUser();

  return (
    <div className="page-shell py-10">
      <p className="section-kicker">Mi cuenta</p>
      <h1 className="mt-3 text-4xl font-semibold">Hola{user?.email ? `, ${user.email}` : ""}</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-muted)]">
        Desde aquí podrás revisar tus pedidos asociados a tu cuenta.
      </p>
      <Link href="/mi-cuenta/pedidos" className="button-primary mt-8 px-6 py-3">
        Ver historial de pedidos
      </Link>
    </div>
  );
}
