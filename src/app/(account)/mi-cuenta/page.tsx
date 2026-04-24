import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { getAuthenticatedUser } from "@/modules/auth/server";
import { getProfileForUser } from "@/modules/profile/service";
import { listOrdersForUser } from "@/modules/orders/service";

export default async function AccountPage() {
  const user = await getAuthenticatedUser();
  const [profile, orders] = user
    ? await Promise.all([
        getProfileForUser(user.id),
        listOrdersForUser(user.id),
      ])
    : [null, []];

  const displayName =
    profile?.fullName?.trim() ||
    (user?.email ? user.email.split("@")[0] : "cliente");

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="page-shell py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="section-kicker">Mi cuenta</p>
          <h1 className="mt-3 text-4xl font-semibold">Hola, {displayName}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
            Aquí puedes revisar tu historial de pedidos, editar tus datos y
            cerrar tu sesión.
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Link
          href="/mi-cuenta/pedidos"
          className="surface-card rounded-[1.75rem] p-6 transition hover:-translate-y-0.5"
        >
          <p className="section-kicker">Pedidos</p>
          <p className="mt-3 text-2xl font-semibold">{orders.length}</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {orders.length === 1 ? "pedido asociado" : "pedidos asociados"}
          </p>
          <p className="mt-4 text-sm font-semibold text-[var(--color-accent)]">
            Ver historial →
          </p>
        </Link>

        <Link
          href="/mi-cuenta/perfil"
          className="surface-card rounded-[1.75rem] p-6 transition hover:-translate-y-0.5"
        >
          <p className="section-kicker">Perfil</p>
          <p className="mt-3 text-lg font-semibold leading-tight">
            {profile?.fullName?.trim() || "Completa tus datos"}
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {profile?.phone?.trim() || "Agrega tu teléfono para un despacho más rápido"}
          </p>
          <p className="mt-4 text-sm font-semibold text-[var(--color-accent)]">
            Editar perfil →
          </p>
        </Link>

        <div className="surface-card rounded-[1.75rem] p-6">
          <p className="section-kicker">Cuenta</p>
          <p className="mt-3 text-sm font-semibold leading-tight text-[var(--color-ink)]">
            {user?.email}
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Sesión iniciada con Supabase
          </p>
        </div>
      </div>

      {recentOrders.length ? (
        <section className="mt-12">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold">Pedidos recientes</h2>
            <Link
              href="/mi-cuenta/pedidos"
              className="text-sm font-semibold text-[var(--color-accent)]"
            >
              Ver todos →
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/mi-cuenta/pedidos/${order.orderNumber}`}
                className="surface-card flex items-center justify-between gap-4 rounded-[1.5rem] px-5 py-4"
              >
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {order.paymentStatus} · {order.orderStatus}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[var(--color-accent)]">
                  Ver detalle →
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
