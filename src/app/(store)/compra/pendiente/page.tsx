import Link from "next/link";
import { redirect } from "next/navigation";
import { getPublicOrderPaymentStatus } from "@/modules/payments/public-status";

function buildResultHref(path: string, orderNumber: string) {
  const params = new URLSearchParams({ order: orderNumber });
  return `${path}?${params.toString()}`;
}

export default async function PendingPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{
    order?: string;
    status?: string;
    reason?: string;
  }>;
}) {
  const params = await searchParams;
  const payment = await getPublicOrderPaymentStatus(params.order);

  if (payment?.paymentStatus === "paid") {
    redirect(buildResultHref("/compra/exito", payment.orderNumber));
  }

  if (
    payment?.paymentStatus === "rejected" ||
    payment?.paymentStatus === "cancelled"
  ) {
    redirect(buildResultHref("/compra/rechazada", payment.orderNumber));
  }

  const canVerifyOrder = Boolean(params.order && payment);
  const title = canVerifyOrder
    ? "Pago pendiente de confirmacion"
    : "No pudimos verificar el pago";
  const description = canVerifyOrder
    ? "El pedido existe, pero todavia no recibimos confirmacion final de Flow. Puedes volver a revisar en unos minutos."
    : "No encontramos una confirmacion confiable para este retorno. Si el cargo aparece en tu banco, contacta al equipo comercial con el numero de pedido.";

  return (
    <div className="page-shell flex min-h-[70vh] items-center py-16">
      <div className="panel-card mx-auto max-w-2xl rounded-[2rem] px-8 py-14 text-center">
        <p className="section-kicker">Pago en revision</p>
        <h1 className="mt-4 text-4xl font-semibold">{title}</h1>
        {params.order ? (
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
            Orden {params.order}.
          </p>
        ) : null}
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
          {description}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={
              params.order
                ? buildResultHref("/compra/pendiente", params.order)
                : "/compra/pendiente"
            }
            className="button-primary px-6 py-3"
          >
            Revisar nuevamente
          </Link>
          <Link href="/contacto" className="button-secondary px-6 py-3">
            Contacto comercial
          </Link>
        </div>
      </div>
    </div>
  );
}
