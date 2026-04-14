import Link from "next/link";
import { ProductCard } from "@/components/catalog/ProductCard";
import { getCatalogCategories, getFeaturedCatalogProducts } from "@/modules/catalog/repository";
import { siteConfig } from "@/modules/shared/site";

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCatalogCategories(),
    getFeaturedCatalogProducts(6),
  ]);

  return (
    <div className="">
      <section className="page-shell pt-2 sm:pt-6">
        <div className="panel-card overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,#1d1a17_0%,#2a241e_45%,#6d4a2d_100%)] px-5 text-white sm:px-10">
          <div className="max-w-full text-black">
            <span className="inline-flex rounded-full border border-white/10 bg-white/10  pt-4 text-sm font-medium">
              Ecommerce oficial
            </span>
            <h1 className="max-w-5xl mt-3 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Máquinas de café, café e insumos para vender y operar mejor en Chile.
            </h1>
          <div className=" flex flex-col gap-20 sm:flex-row mb-5">
            <p className="hidden lg:flex mt-5 max-w-xl text-base leading-8 sm:text-lg">
              Compra online con precios fijos, IVA incluido y una experiencia
              clara para empresas, oficinas, cafeterías, minimarkets y negocios.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/tienda" className="button-primary px-6 py-3">
                Comprar productos
              </Link>
              <Link
                href="/cotizar"
                className="button-secondary border-white/15 bg-white/10 px-6 py-3 text-white hover:bg-white/15"
              >
                Solicitar cotización
              </Link>
            </div>
          </div>
          </div>
        </div>
      </section>

      <section className="page-shell mt-5">
        <div className="mb-5">
          <p className="section-kicker">Categorías</p>
        </div>
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scroll-smooth touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categorias/${category.slug}`}
              className="surface-card min-w-[88%] snap-start rounded-[1.75rem] px-5 py-6 hover:-translate-y-0.5 lg:min-w-0"
            >
              <h3 className="text-xl font-semibold text-[var(--color-ink)]">
                {category.name}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-shell mt-16">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Destacados</p>
            <h2 className="mt-3 text-3xl font-semibold">Productos recomendados</h2>
          </div>
          <Link
            href="/tienda"
            className="text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-strong)]"
          >
            Ver catálogo completo
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="page-shell mt-16">
        <div className="grid gap-4 lg:grid-cols-4">
          {siteConfig.businessSegments.map((segment) => (
            <article
              key={segment}
              className="surface-card rounded-[1.75rem] px-5 py-6"
            >
              <h3 className="text-xl font-semibold">{segment}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                Soluciones de café, autoservicio e insumos adaptadas a la
                operación y al ritmo comercial de cada tipo de cliente.
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
