import Link from "next/link";
import type { CatalogCategory } from "@/modules/catalog/types";

interface CategoriesGridProps {
  categories: CatalogCategory[];
}

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <section className="rounded-t-[2rem] bg-[var(--color-surface)] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[80rem]">
        <p className="text-[0.74rem] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]">
          Categorías
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--color-heading)] sm:text-3xl">
          Explora por tipo de producto
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categorias/${category.slug}`}
              className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-card)] backdrop-blur transition-transform hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--color-card)_86%,var(--color-surface-soft)_14%)]"
            >
              <h3 className="text-lg font-semibold text-[var(--color-heading)]">
                {category.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
