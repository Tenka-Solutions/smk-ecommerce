import { notFound } from "next/navigation";
import { CoffeeSupplyFilterBar } from "@/components/catalog/CoffeeSupplyFilterBar";
import { ProductCard } from "@/components/catalog/ProductCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { isCoffeeSupplyCategory } from "@/modules/catalog/filters";
import {
  getCatalogCategories,
  getCatalogCategoryBySlug,
  getCatalogProducts,
} from "@/modules/catalog/repository";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const [category, categories] = await Promise.all([
    getCatalogCategoryBySlug(slug),
    getCatalogCategories(),
  ]);

  if (!category) {
    notFound();
  }

  const showCoffeeSupplyFilters = isCoffeeSupplyCategory(slug, categories);
  const products = await getCatalogProducts({
    category: slug,
    coffeeSupplyFilter: showCoffeeSupplyFilters ? query.filtro : undefined,
  });

  return (
    <div className="page-shell py-10">
      <p className="section-kicker">Categoría</p>
      <h1 className="mt-3 text-4xl font-semibold">{category.name}</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-muted-foreground)]">
        {category.description}
      </p>
      {showCoffeeSupplyFilters ? (
        <div className="mt-6">
          <CoffeeSupplyFilterBar />
        </div>
      ) : null}
      {products.length ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No hay productos publicados en esta categoria"
            description="Cuando un producto quede publicado desde el admin aparecera automaticamente en esta vista."
            actionHref="/tienda"
            actionLabel="Volver a tienda"
          />
        </div>
      )}
    </div>
  );
}
