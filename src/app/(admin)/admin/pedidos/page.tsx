import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { formatClp } from "@/lib/format/currency";
import { listOrdersForAdmin } from "@/modules/orders/service";

export default async function AdminOrdersPage() {
  const orders = await listOrdersForAdmin();

  return (
    <div className="grid gap-6">
      <section className="panel-card rounded-[2rem] p-6 sm:p-8">
        <p className="section-kicker">Operacion</p>
        <h1 className="mt-3 text-4xl font-semibold">Pedidos</h1>
        <p className="mt-4 text-sm leading-8 text-[var(--color-muted)]">
          Revisa la ultima actividad comercial y valida el estado del pago y la
          preparacion de cada orden.
        </p>
      </section>

      <AdminDataTable
        headers={["Orden", "Monto", "Pago", "Estado", "Creado"]}
        rows={orders.map((order) => [
          order.orderNumber,
          formatClp(order.totalTaxInc),
          <StatusBadge key={`${order.id}-payment`} status={order.paymentStatus} />,
          <StatusBadge key={`${order.id}-order`} status={order.orderStatus} />,
          order.createdAt
            ? new Date(order.createdAt).toLocaleString("es-CL")
            : "-",
        ])}
      />
    </div>
  );
}
