import Link from "next/link";

export default function RejectedPage() {
  return (
    <div className="page-shell flex min-h-[70vh] items-center py-16">
      <div className="panel-card mx-auto max-w-2xl rounded-[2rem] px-8 py-14 text-center">
        <p className="section-kicker">Pago rechazado</p>
        <h1 className="mt-4 text-4xl font-semibold">No fue posible completar el pago</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
          Tu carrito se mantuvo intacto para que puedas reintentar o revisar la
          información antes de volver al checkout.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/checkout" className="button-primary px-6 py-3">
            Reintentar pago
          </Link>
          <Link href="/contacto" className="button-secondary px-6 py-3">
            Contacto comercial
          </Link>
        </div>
      </div>
    </div>
  );
}
