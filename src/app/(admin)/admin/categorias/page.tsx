import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { getAdminCatalogSnapshot } from "@/modules/catalog/repository";

export default async function AdminCategoriesPage() {
  const snapshot = await getAdminCatalogSnapshot();

  return (
    <div className="grid gap-6">
      <section className="panel-card rounded-[2rem] p-6 sm:p-8">
        <p className="section-kicker">Catalogo</p>
        <h1 className="mt-3 text-4xl font-semibold">Categorias</h1>
        <p className="mt-4 text-sm leading-8 text-[var(--color-muted)]">
          Ordena, publica y estructura las lineas comerciales que navegan los
          clientes en la tienda.
        </p>
      </section>

      <AdminDataTable
        headers={["Categoria", "Slug", "Orden", "Visible"]}
        rows={snapshot.categories.map((category) => [
          category.name,
          category.slug,
          String(category.sortOrder),
          <StatusBadge
            key={`${category.id}-visibility`}
            status={category.isVisible ? "paid" : "cancelled"}
          />,
        ])}
      />
    </div>
  );
}
