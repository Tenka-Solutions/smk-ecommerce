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
    <div className="pb-18">
      <section className="page-shell pt-12 sm:pt-16">
        <div className="panel-card overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,#1d1a17_0%,#2a241e_45%,#6d4a2d_100%)] px-6 py-12 text-white sm:px-10 sm:py-16">
          <div className="max-w-3xl text-black">
            <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium">
              Ecommerce oficial SMK Vending
            </span>
            <h1 className=" mt-6 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Máquinas de café, café e insumos para vender y operar mejor en Chile.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 sm:text-lg">
              Compra online con precios en CLP, IVA incluido y una experiencia
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
            <div className="mt-10 grid gap-3 md:grid-cols-2">
              {siteConfig.trustSignals.map((signal) => (
                <div
                  key={signal}
                  className="rounded-[1.3rem] border border-white/10 bg-white/7 px-4 py-4 text-sm leading-6 text-white/78"
                >
                  {signal}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell mt-16">
        <div className="mb-8">
          <p className="section-kicker">Categorías</p>
          <h2 className="mt-3 text-3xl font-semibold">Líneas principales</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categorias/${category.slug}`}
              className="surface-card rounded-[1.75rem] px-5 py-6 hover:-translate-y-0.5"
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
