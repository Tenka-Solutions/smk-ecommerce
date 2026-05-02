import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CoffeeSupplyFilterBar } from "@/components/catalog/CoffeeSupplyFilterBar";
import { ProductCard } from "@/components/catalog/ProductCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { isCoffeeSupplyCategory } from "@/modules/catalog/filters";
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
    filtro?: string;
    sort?: "featured" | "price-asc" | "price-desc" | "name";
  }>;
}) {
  const params = await searchParams;
  const categories = await getCatalogCategories();
  const showCoffeeSupplyFilters = Boolean(
    params.categoria && isCoffeeSupplyCategory(params.categoria, categories)
  );
  const products = await getCatalogProducts({
    query: params.q,
    category: params.categoria,
    coffeeSupplyFilter: showCoffeeSupplyFilters ? params.filtro : undefined,
    sort: params.sort ?? "featured",
  });

  return (
    <div className="page-shell pt-5">
      <div className="max-w-3xl">
        <p className="section-kicker">Tienda</p>
      </div>
      <div className="mt-4">
        <CatalogFilters categories={categories} />
      </div>
      {showCoffeeSupplyFilters ? (
        <div className="mt-3">
          <CoffeeSupplyFilterBar />
        </div>
      ) : null}
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
