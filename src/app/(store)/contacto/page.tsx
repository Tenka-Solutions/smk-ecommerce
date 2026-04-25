export default function ContactPage() {
  return (
    <div className="page-shell py-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel-card rounded-[2rem] p-8">
          <p className="section-kicker">Contacto</p>
          <h1 className="mt-3 text-4xl font-semibold">Canales comerciales</h1>
          <div className="mt-6 grid gap-4 text-sm text-[var(--color-muted)]">
            <div className="surface-card rounded-[1.5rem] p-5">
              <p className="font-semibold text-[var(--color-ink)]">Correo</p>
              <p className="mt-2">ventas@smkvending.cl</p>
            </div>
            <div className="surface-card rounded-[1.5rem] p-5">
              <p className="font-semibold text-[var(--color-ink)]">Cobertura</p>
              <p className="mt-2">Despachos y coordinación comercial en Chile.</p>
            </div>
          </div>
        </section>
        <section className="panel-card rounded-[2rem] p-8">
          <p className="section-kicker">Atención</p>
          <h2 className="mt-3 text-3xl font-semibold">¿Necesitas compra o cotización?</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
            Puedes comprar directamente desde la tienda o enviarnos tu
            requerimiento para una propuesta comercial.
          </p>
        </section>
      </div>
    </div>
  );
}
