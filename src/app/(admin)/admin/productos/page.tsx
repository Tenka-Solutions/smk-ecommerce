import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { formatClp } from "@/lib/format/currency";
import { getAdminCatalogSnapshot } from "@/modules/catalog/repository";

export default async function AdminProductsPage() {
  const snapshot = await getAdminCatalogSnapshot();

  return (
    <div className="grid gap-6">
      <section className="panel-card rounded-[2rem] p-6 sm:p-8">
        <p className="section-kicker">Catalogo</p>
        <h1 className="mt-3 text-4xl font-semibold">Productos</h1>
        <p className="mt-4 text-sm leading-8 text-[var(--color-muted)]">
          Fuente activa: {snapshot.source === "supabase" ? "Supabase" : "Seed local"}.
          Cuando el panel quede conectado a storage, este listado podra editarse
          desde CRUD real.
        </p>
      </section>

      <AdminDataTable
        headers={["Producto", "Categoria", "Precio", "Disponibilidad", "Publicado"]}
        rows={snapshot.products.map((product) => [
          product.name,
          product.categorySlug,
          formatClp(product.priceClpTaxInc),
          <StatusBadge key={`${product.id}-availability`} status={product.availabilityStatus} />,
          <StatusBadge key={`${product.id}-publication`} status={product.publicationStatus} />,
        ])}
      />
    </div>
  );
}
