import Link from "next/link";
import { EmptyState } from "@/components/feedback/EmptyState";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { formatClp } from "@/lib/format/currency";
import { getAuthenticatedUser } from "@/modules/auth/server";
import { listOrdersForUser } from "@/modules/orders/service";

export default async function AccountOrdersPage() {
  const user = await getAuthenticatedUser();
  const orders = user ? await listOrdersForUser(user.id) : [];

  return (
    <div className="page-shell py-10">
      <p className="section-kicker">Mi cuenta</p>
      <h1 className="mt-3 text-4xl font-semibold">Historial de pedidos</h1>
      <div className="mt-8">
        {orders.length ? (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/mi-cuenta/pedidos/${order.orderNumber}`}
                className="surface-card rounded-[1.5rem] px-5 py-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      Total {formatClp(order.totalTaxInc)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.paymentStatus} />
                    <StatusBadge status={order.orderStatus} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aun no tienes pedidos asociados"
            description="Los pedidos hechos con tu cuenta apareceran aqui automaticamente."
          />
        )}
      </div>
    </div>
  );
}
