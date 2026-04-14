import { notFound } from "next/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
import {
  getCatalogCategoryBySlug,
  getCatalogProductsByCategory,
} from "@/modules/catalog/repository";
import { CatalogCategorySlug } from "@/modules/catalog/types";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCatalogCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await getCatalogProductsByCategory(slug as CatalogCategorySlug);

  return (
    <div className="page-shell py-10">
      <p className="section-kicker">Categoría</p>
      <h1 className="mt-3 text-4xl font-semibold">{category.name}</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-muted)]">
        {category.description}
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
