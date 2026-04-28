import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import {
  QuoteRequestAdminRow,
  listQuoteRequestsForAdmin,
} from "@/modules/quotes/service";

export default async function AdminQuotesPage() {
  const quotes = await listQuoteRequestsForAdmin();

  return (
    <div className="grid gap-6">
      <section className="panel-card rounded-[2rem] p-6 sm:p-8">
        <p className="section-kicker">Comercial</p>
        <h1 className="mt-3 text-4xl font-semibold">Cotizaciones</h1>
        <p className="mt-4 text-sm leading-8 text-[var(--color-muted-foreground)]">
          Gestiona solicitudes entrantes sin interrumpir el flujo de compra
          directa del ecommerce.
        </p>
      </section>

      <AdminDataTable
        headers={["Nombre", "Email", "Telefono", "Estado", "Fecha"]}
        rows={quotes.map((quote: QuoteRequestAdminRow) => [
          quote.name,
          quote.email,
          quote.phone,
          <StatusBadge key={quote.id} status={quote.status} />,
          quote.created_at
            ? new Date(quote.created_at).toLocaleString("es-CL")
            : "-",
        ])}
      />
    </div>
  );
}
