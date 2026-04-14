import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-[72vh] items-center py-16">
      <div className="panel-card mx-auto max-w-2xl rounded-[2rem] px-8 py-14 text-center">
        <p className="section-kicker">404</p>
        <h1 className="mt-4 text-4xl font-semibold">
          La pagina que buscas no esta disponible
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
          Puede haber cambiado de ruta o ya no formar parte del ecommerce.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="button-primary px-6 py-3">
            Ir al inicio
          </Link>
          <Link href="/tienda" className="button-secondary px-6 py-3">
            Ver tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
