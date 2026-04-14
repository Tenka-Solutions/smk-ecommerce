import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductCard } from "@/components/catalog/ProductCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { getCatalogProducts } from "@/modules/catalog/repository";
import { CatalogCategorySlug } from "@/modules/catalog/types";

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categoria?: CatalogCategorySlug;
    sort?: "featured" | "price-asc" | "price-desc" | "name";
  }>;
}) {
  const params = await searchParams;
  const products = await getCatalogProducts({
    query: params.q,
    category: params.categoria,
    sort: params.sort ?? "featured",
  });

  return (
    <div className="page-shell py-10">
      <div className="max-w-3xl">
        <p className="section-kicker">Tienda</p>
        <h1 className="mt-3 text-4xl font-semibold">Catálogo SMK Vending</h1>
        <p className="mt-4 text-base leading-8 text-[var(--color-muted)]">
          Precios en CLP con IVA incluido. Despacho disponible en Chile con
          coordinación posterior a la compra.
        </p>
      </div>
      <div className="mt-8">
        <CatalogFilters />
      </div>
      <div className="mt-8">
        {products.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No encontramos coincidencias"
            description="Ajusta la búsqueda o vuelve al catálogo completo para seguir explorando."
            actionHref="/tienda"
            actionLabel="Limpiar filtros"
          />
        )}
      </div>
    </div>
  );
}
