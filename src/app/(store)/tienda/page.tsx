import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductCard } from "@/components/catalog/ProductCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import {
  getCatalogCategories,
  getCatalogProducts,
} from "@/modules/catalog/repository";

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    sort?: "featured" | "price-asc" | "price-desc" | "name";
  }>;
}) {
  const params = await searchParams;
  const [categories, products] = await Promise.all([
    getCatalogCategories(),
    getCatalogProducts({
      query: params.q,
      category: params.categoria,
      sort: params.sort ?? "featured",
    }),
  ]);

  return (
    <div className="page-shell pt-5">
      <div className="max-w-3xl">
        <p className="section-kicker">Tienda</p>
      </div>
      <div className="mt-4">
        <CatalogFilters categories={categories} />
      </div>
      <div className="mt-3">
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
