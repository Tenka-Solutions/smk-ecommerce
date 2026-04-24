import Link from "next/link";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import { TrustSignals } from "@/components/home/TrustSignals";
import { CtaBanner } from "@/components/home/CtaBanner";
import { getCatalogCategories, getFeaturedCatalogProducts } from "@/modules/catalog/repository";

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCatalogCategories(),
    getFeaturedCatalogProducts(8),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-[var(--color-hero)] text-[var(--color-hero-foreground)]">
        <div className="page-shell pb-12 pt-8 sm:pb-16 sm:pt-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[0.74rem] font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">
                Ecommerce oficial
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight text-[var(--color-hero-foreground)] sm:text-4xl lg:text-5xl">
                Máquinas de café, café e insumos para tu negocio
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-[var(--color-hero-muted)] sm:text-base">
                Precios con IVA incluido · Despacho Chile
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link href="/tienda" className="button-gold px-6 py-3 text-sm">
                Comprar productos
              </Link>
              <Link
                href="/cotizar"
                className="inline-flex items-center justify-content rounded-full border border-[var(--color-hero-border)] px-6 py-3 text-sm font-semibold text-[var(--color-hero-foreground)] hover:border-[var(--color-primary)]"
              >
                Solicitar cotización
              </Link>
            </div>
          </div>

          <HeroCarousel products={featuredProducts} />
        </div>
      </section>

      {/* Categories */}
      <CategoriesGrid categories={categories} />

      {/* Trust Signals */}
      <TrustSignals />

      {/* CTA Banner */}
      <CtaBanner />
    </div>
  );
}
