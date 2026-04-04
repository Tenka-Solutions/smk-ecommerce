import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/shop/SearchBar";
import SortSelect from "@/components/shop/SortSelect";
import { categories, searchProducts, Category } from "@/lib/products";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>;
}

export default async function ShopPage({ searchParams }: Props) {
  const { category, q = "", sort } = await searchParams;
  const activeCategory = category as Category | undefined;
  const filtered = searchProducts(q, activeCategory, sort);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#3d464d] mb-2">Tienda</h1>
        <p className="text-[#6c757d]">
          {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
          {activeCategory
            ? ` en ${categories.find((c) => c.slug === activeCategory)?.label}`
            : ""}
          {q ? ` para "${q}"` : ""}
        </p>
      </div>

      {/* Search + sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1">
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>
        <Suspense>
          <SortSelect />
        </Suspense>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-56 shrink-0">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6c757d] mb-3">
            Categorías
          </h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/shop"
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !activeCategory
                    ? "bg-[#ffd333] text-[#3d464d]"
                    : "text-[#3d464d] hover:bg-white hover:shadow-sm"
                }`}
              >
                Todos
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat.slug
                      ? "bg-[#ffd333] text-[#3d464d]"
                      : "text-[#3d464d] hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-[#6c757d]">
              <p className="text-lg font-medium mb-2">Sin resultados</p>
              <p className="text-sm">Intenta con otra búsqueda o categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
