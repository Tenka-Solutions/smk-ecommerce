import Link from "next/link";
import { OrderSubmitButton } from "@/components/admin/OrderSubmitButton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { formatClp } from "@/lib/format/currency";
import {
  ADMIN_ORDER_STATUSES,
  getAdminOrderDetail,
  getAdminOrdersPageData,
  isArchiveableOrderStatus,
} from "@/modules/orders/admin";
import type {
  AdminArchivedFilter,
  AdminOrderDetail,
  AdminOrderListItem,
  AdminOrderStatus,
} from "@/modules/orders/admin";
import {
  archiveOrderAction,
  unarchiveOrderAction,
  updateOrderAction,
} from "@/app/(admin)/admin/pedidos/actions";

type SearchParams = Promise<{
  q?: string;
  estadoPedido?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  archivado?: string;
  detalle?: string;
  estado?: string;
}>;

const pageMessages: Record<string, { tone: "success" | "danger"; text: string }> =
  {
    guardado: {
      tone: "success",
      text: "Pedido actualizado correctamente.",
    },
    archivado: {
      tone: "success",
      text: "Pedido archivado. No aparecera en el listado principal.",
    },
    desarchivado: {
      tone: "success",
      text: "Pedido restaurado al listado principal.",
    },
    error: {
      tone: "danger",
      text: "No pudimos completar la accion. Revisa permisos, estado del pedido o configuracion de Supabase.",
    },
  };

const orderStatusLabels: Record<AdminOrderStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  processing: "En proceso",
  preparing: "En preparacion",
  shipped: "Enviado",
  completed: "Completado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  rejected: "Rechazado",
};

function toOrderStatus(value?: string): AdminOrderStatus | undefined {
  return ADMIN_ORDER_STATUSES.includes(value as AdminOrderStatus)
    ? (value as AdminOrderStatus)
    : undefined;
}

function toArchivedFilter(value?: string): AdminArchivedFilter {
  return ["active", "archived", "all"].includes(value ?? "")
    ? (value as AdminArchivedFilter)
    : "active";
}

function buildOrdersHref(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  return `/admin/pedidos${query.size ? `?${query.toString()}` : ""}`;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function cleanPhone(value: string | null) {
  if (!value) {
    return null;
  }

  const digits = value.replace(/\D/g, "");
  return digits || null;
}

function getWhatsAppHref(phone: string | null) {
  const digits = cleanPhone(phone);

  if (!digits) {
    return null;
  }

  const normalized = digits.startsWith("56")
    ? digits
    : digits.length === 9
      ? `56${digits}`
      : digits;

  return `https://wa.me/${normalized}`;
}

function getPhoneHref(phone: string | null) {
  const digits = cleanPhone(phone);
  return digits ? `tel:+${digits}` : null;
}

function getMailHref(order: AdminOrderListItem) {
  const subject = encodeURIComponent(`Pedido ${order.orderNumber}`);
  return `mailto:${order.customerEmail}?subject=${subject}`;
}

function getAddressLine(order: AdminOrderDetail) {
  if (!order.shippingAddress) {
    return "Direccion no registrada";
  }

  const { street, number, apartment } = order.shippingAddress;
  return [street, number, apartment ? `Depto/Of. ${apartment}` : null]
    .filter(Boolean)
    .join(" ");
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[1.25rem] bg-[var(--color-surface-strong)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ContactActions({ order }: { order: AdminOrderListItem }) {
  const whatsappHref = getWhatsAppHref(order.phone);
  const phoneHref = getPhoneHref(order.phone);

  return (
    <div className="flex flex-wrap gap-2">
      <a href={getMailHref(order)} className="button-secondary px-4 py-2 text-xs">
        Enviar correo
      </a>
      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="button-secondary px-4 py-2 text-xs"
        >
          WhatsApp
        </a>
      ) : null}
      {phoneHref ? (
        <a href={phoneHref} className="button-secondary px-4 py-2 text-xs">
          Llamar
        </a>
      ) : null}
    </div>
  );
}

function OrderCard({
  order,
  detailHref,
  isSelected,
}: {
  order: AdminOrderListItem;
  detailHref: string;
  isSelected: boolean;
}) {
  return (
    <article
      className={`grid gap-4 rounded-[1.75rem] border p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center ${
        isSelected
          ? "border-[color-mix(in_srgb,var(--color-primary)_45%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-primary)_8%,var(--color-card)_92%)]"
          : "border-[var(--color-border)] bg-[var(--color-card)]"
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">
            {order.orderNumber}
          </h3>
          <StatusBadge status={order.orderStatus} />
          <StatusBadge status={order.paymentStatus} />
          {order.archivedAt ? <StatusBadge status="archived" /> : null}
        </div>
        <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
          {order.customerName}
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {order.customerEmail} · {order.phone ?? "sin telefono"}
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
          {formatDateTime(order.createdAt)}
          {order.companyName ? ` · ${order.companyName}` : ""}
        </p>
      </div>

      <div className="grid gap-3 md:min-w-44 md:justify-items-end">
        <div className="text-left md:text-right">
          <p className="text-lg font-semibold text-[var(--color-price)]">
            {formatClp(order.totalTaxInc)}
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Pago {order.paymentProvider ?? "por confirmar"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          <ContactActions order={order} />
          <Link href={detailHref} className="button-primary px-4 py-2 text-xs">
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  );
}

function DetailLine({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <div className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
        {value || "-"}
      </div>
    </div>
  );
}

function OrderDetailPanel({
  order,
  canMutate,
  returnTo,
}: {
  order: AdminOrderDetail;
  canMutate: boolean;
  returnTo: string;
}) {
  const canArchive = isArchiveableOrderStatus(order.orderStatus);
  const paymentMethod =
    order.paymentProvider ?? order.paymentAttemptProvider ?? "Por confirmar";

  return (
    <section className="panel-card rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="section-kicker">Detalle del pedido</p>
          <h2 className="mt-3 text-3xl font-semibold">{order.orderNumber}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge status={order.orderStatus} />
            <StatusBadge status={order.paymentStatus} />
            {order.archivedAt ? <StatusBadge status="archived" /> : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <ContactActions order={order} />
          <Link href="/admin/pedidos" className="button-secondary px-4 py-2 text-xs">
            Cerrar detalle
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailLine label="Fecha" value={formatDateTime(order.createdAt)} />
        <DetailLine label="Metodo de pago" value={paymentMethod} />
        <DetailLine label="Referencia pago" value={order.paymentAttemptReference} />
        <DetailLine label="Total" value={formatClp(order.totalTaxInc)} />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <section className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <h3 className="text-xl font-semibold">Productos comprados</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--color-border)] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                    <th className="py-3 pr-4 font-semibold">Producto</th>
                    <th className="py-3 pr-4 font-semibold">Cant.</th>
                    <th className="py-3 pr-4 font-semibold">Unitario</th>
                    <th className="py-3 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {order.items.map((item) => (
                    <tr key={`${item.productId ?? item.name}-${item.sku ?? ""}`}>
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-[var(--color-ink)]">
                          {item.name}
                        </p>
                        <p className="text-xs text-[var(--color-muted-foreground)]">
                          SKU {item.sku ?? "sin SKU"}
                        </p>
                      </td>
                      <td className="py-3 pr-4">{item.quantity}</td>
                      <td className="py-3 pr-4">
                        {formatClp(item.unitPriceTaxInc)}
                      </td>
                      <td className="py-3 font-semibold">
                        {formatClp(item.lineTotalTaxInc)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <h3 className="text-xl font-semibold">Datos del cliente</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <DetailLine label="Nombre" value={order.customerName} />
              <DetailLine label="Correo" value={order.customerEmail} />
              <DetailLine label="Telefono" value={order.phone ?? "No registrado"} />
              <DetailLine label="RUT" value={order.rut ?? "No registrado"} />
              <DetailLine
                label="Empresa"
                value={order.companyName ?? order.businessName ?? "No registrada"}
              />
              <DetailLine
                label="Giro"
                value={order.businessActivity ?? "No registrado"}
              />
              <DetailLine label="Direccion" value={getAddressLine(order)} />
              <DetailLine
                label="Comuna / Region"
                value={
                  order.shippingAddress
                    ? `${order.shippingAddress.comuna}, ${order.shippingAddress.region}`
                    : "No registrada"
                }
              />
              <DetailLine
                label="Referencias"
                value={order.shippingAddress?.references ?? "Sin referencias"}
              />
              <DetailLine
                label="Observaciones"
                value={order.shippingAddress?.deliveryNotes ?? "Sin observaciones"}
              />
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-5">
          <section className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <h3 className="text-xl font-semibold">Estado y nota interna</h3>
            <form action={updateOrderAction} className="mt-4 grid gap-4">
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="returnTo" value={returnTo} />

              <label className="grid gap-2 text-sm font-semibold">
                Estado del pedido
                <select
                  name="orderStatus"
                  defaultValue={order.orderStatus}
                  className="form-input"
                  disabled={!canMutate}
                >
                  {ADMIN_ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {orderStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Nota interna
                <textarea
                  name="internalNote"
                  defaultValue={order.internalNote ?? ""}
                  className="form-input min-h-32"
                  placeholder="Nota visible solo en administracion."
                  disabled={!canMutate}
                />
              </label>

              <OrderSubmitButton
                disabled={!canMutate}
                className="button-primary px-5 py-3 text-sm"
                confirmWhenField="orderStatus"
                confirmWhenValue="cancelled"
                confirmMessage="Vas a marcar este pedido como cancelado. ¿Quieres continuar?"
              >
                Guardar cambios
              </OrderSubmitButton>
            </form>
          </section>

          <section className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <h3 className="text-xl font-semibold">Totales</h3>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[var(--color-muted-foreground)]">Subtotal</span>
                <strong>{formatClp(order.subtotalTaxInc)}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[var(--color-muted-foreground)]">IVA</span>
                <strong>{formatClp(order.taxAmount)}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[var(--color-muted-foreground)]">Despacho</span>
                <strong>
                  {order.shippingAmount > 0
                    ? formatClp(order.shippingAmount)
                    : order.shippingLabel}
                </strong>
              </div>
              <div className="flex justify-between gap-4 border-t border-[var(--color-border)] pt-3 text-base">
                <span>Total</span>
                <strong className="text-[var(--color-price)]">
                  {formatClp(order.totalTaxInc)}
                </strong>
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <h3 className="text-xl font-semibold">Archivado visual</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">
              Archivar limpia el panel sin borrar el pedido ni sus productos.
            </p>

            {order.archivedAt ? (
              <form action={unarchiveOrderAction} className="mt-4">
                <input type="hidden" name="orderId" value={order.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <OrderSubmitButton
                  disabled={!canMutate}
                  className="button-secondary px-5 py-3 text-sm"
                  confirmMessage="Este pedido volvera al listado principal. ¿Quieres desarchivarlo?"
                >
                  Desarchivar pedido
                </OrderSubmitButton>
              </form>
            ) : (
              <form action={archiveOrderAction} className="mt-4">
                <input type="hidden" name="orderId" value={order.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <OrderSubmitButton
                  disabled={!canMutate || !canArchive}
                  className="button-secondary px-5 py-3 text-sm"
                  confirmMessage="El pedido se ocultara del listado principal, pero no se borrara. ¿Quieres archivarlo?"
                >
                  Archivar pedido
                </OrderSubmitButton>
                {!canArchive ? (
                  <p className="mt-3 text-xs leading-5 text-[var(--color-muted-foreground)]">
                    Solo se archivan pedidos pendientes, cancelados o rechazados.
                  </p>
                ) : null}
              </form>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const archivedFilter = toArchivedFilter(params.archivado);
  const filters = {
    query: params.q,
    orderStatus: toOrderStatus(params.estadoPedido),
    dateFrom: params.fechaDesde,
    dateTo: params.fechaHasta,
    archived: archivedFilter,
  };
  const pageData = await getAdminOrdersPageData(filters);
  const detailOrder = params.detalle
    ? await getAdminOrderDetail(params.detalle)
    : null;
  const message = params.estado ? pageMessages[params.estado] : null;
  const baseParams = {
    q: params.q,
    estadoPedido: params.estadoPedido,
    fechaDesde: params.fechaDesde,
    fechaHasta: params.fechaHasta,
    archivado: params.archivado,
  };
  const returnTo = buildOrdersHref({
    ...baseParams,
    detalle: params.detalle,
  });

  return (
    <div className="grid gap-6">
      <section className="panel-card rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="section-kicker">Operacion</p>
            <h1 className="mt-3 text-4xl font-semibold">Pedidos</h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--color-muted-foreground)]">
              Seguimiento comercial de pedidos, contacto con clientes, notas
              internas y archivado visual sin borrar registros.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <SummaryCard label="Cargados" value={pageData.totalOrders} />
          <SummaryCard label="Vista actual" value={pageData.orders.length} />
          <SummaryCard label="Activos" value={pageData.visibleOrders} />
          <SummaryCard label="Archivados" value={pageData.archivedOrders} />
        </div>
      </section>

      {message ? (
        <div
          className={`rounded-[1.5rem] border p-4 text-sm font-medium ${
            message.tone === "success"
              ? "border-[color-mix(in_srgb,var(--color-success)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,var(--color-card)_90%)] text-[var(--color-success)]"
              : "border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,var(--color-card)_90%)] text-[var(--color-danger)]"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      {pageData.warning ? (
        <div className="rounded-[1.5rem] border border-[color-mix(in_srgb,var(--color-warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,var(--color-card)_90%)] p-4 text-sm leading-7 text-[var(--color-warning)]">
          {pageData.warning}
        </div>
      ) : null}

      <section className="panel-card rounded-[2rem] p-5 sm:p-6">
        <form className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_190px_170px_170px_180px_auto_auto] xl:items-end">
          <label className="grid gap-2 text-sm font-semibold">
            Buscar pedido o cliente
            <input
              name="q"
              defaultValue={params.q ?? ""}
              className="form-input"
              placeholder="SMK-..., nombre, correo o telefono"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Estado
            <select
              name="estadoPedido"
              defaultValue={params.estadoPedido ?? ""}
              className="form-input"
            >
              <option value="">Todos</option>
              {ADMIN_ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {orderStatusLabels[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Desde
            <input
              name="fechaDesde"
              type="date"
              defaultValue={params.fechaDesde ?? ""}
              className="form-input"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Hasta
            <input
              name="fechaHasta"
              type="date"
              defaultValue={params.fechaHasta ?? ""}
              className="form-input"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Archivado
            <select
              name="archivado"
              defaultValue={archivedFilter}
              className="form-input"
            >
              <option value="active">No archivados</option>
              <option value="archived">Archivados</option>
              <option value="all">Todos</option>
            </select>
          </label>

          <button type="submit" className="button-primary px-6 py-3 text-sm">
            Filtrar
          </button>

          <Link href="/admin/pedidos" className="button-secondary px-6 py-3 text-sm">
            Limpiar
          </Link>
        </form>
      </section>

      {detailOrder ? (
        <OrderDetailPanel
          order={detailOrder}
          canMutate={pageData.canMutate}
          returnTo={returnTo}
        />
      ) : params.detalle ? (
        <div className="rounded-[1.5rem] border border-[color-mix(in_srgb,var(--color-warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,var(--color-card)_90%)] p-4 text-sm leading-7 text-[var(--color-warning)]">
          No encontramos el pedido seleccionado. Puede haber sido filtrado o no
          estar disponible.
        </div>
      ) : null}

      <section className="grid gap-3">
        {pageData.orders.length > 0 ? (
          pageData.orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              detailHref={buildOrdersHref({
                ...baseParams,
                detalle: order.id,
              })}
              isSelected={params.detalle === order.id}
            />
          ))
        ) : (
          <EmptyState
            title="No encontramos pedidos"
            description="Ajusta los filtros o revisa pedidos archivados si quieres recuperar ordenes ocultas del listado principal."
          />
        )}
      </section>
    </div>
  );
}
