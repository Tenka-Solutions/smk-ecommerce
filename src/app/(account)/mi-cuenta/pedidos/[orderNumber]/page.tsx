import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { formatClp } from "@/lib/format/currency";
import { getAuthenticatedUser } from "@/modules/auth/server";
import { getOrderByOrderNumberForUser } from "@/modules/orders/service";

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const user = await getAuthenticatedUser();

  if (!user) {
    notFound();
  }

  const order = await getOrderByOrderNumberForUser(user.id, orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <div className="page-shell py-10">
      <p className="section-kicker">Mi cuenta</p>
      <h1 className="mt-3 text-4xl font-semibold">Pedido {order.orderNumber}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge status={order.paymentStatus} />
        <StatusBadge status={order.orderStatus} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="panel-card rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold">Detalle</h2>
          <div className="mt-6 space-y-4">
            {order.items.map((item) => (
              <div
                key={`${item.name}-${item.quantity}`}
                className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {item.quantity} unidad{item.quantity === 1 ? "" : "es"}
                  </p>
                </div>
                <p className="font-semibold">
                  {formatClp(item.lineTotalTaxInc)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <aside className="panel-card rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold">Resumen</h2>
          <div className="mt-6 space-y-3 text-sm text-[var(--color-muted)]">
            <div className="flex items-center justify-between gap-4">
              <span>Cliente</span>
              <span className="font-semibold text-[var(--color-ink)]">
                {order.customerName}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Email</span>
              <span className="font-semibold text-[var(--color-ink)]">
                {order.customerEmail}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Despacho</span>
              <span className="font-semibold text-[var(--color-ink)]">
                {order.shippingLabel}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Total</span>
              <span className="font-semibold text-[var(--color-ink)]">
                {formatClp(order.totalTaxInc)}
              </span>
            </div>
          </div>
          {order.shippingAddress ? (
            <div className="mt-6 rounded-[1.5rem] bg-[var(--color-surface-strong)] p-4 text-sm leading-7 text-[var(--color-muted)]">
              <p className="font-semibold text-[var(--color-ink)]">
                Direccion de envio
              </p>
              <p className="mt-2">
                {order.shippingAddress.street} {order.shippingAddress.number}
              </p>
              <p>
                {order.shippingAddress.comuna}, {order.shippingAddress.region}
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
