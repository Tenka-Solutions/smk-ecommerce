import { QuoteForm } from "@/components/forms/QuoteForm";

export default function QuotePage() {
  return (
    <div className="page-shell py-10">
      <div className="max-w-3xl">
        <p className="section-kicker">Cotización</p>
        <h1 className="mt-3 text-4xl font-semibold">Solicita una propuesta comercial</h1>
        <p className="mt-4 text-base leading-8 text-[var(--color-muted)]">
          Usa este formulario si necesitas evaluar equipos, volumen de compra o
          una solución comercial a medida.
        </p>
      </div>
      <div className="mt-8 max-w-4xl">
        <QuoteForm />
      </div>
    </div>
  );
}
