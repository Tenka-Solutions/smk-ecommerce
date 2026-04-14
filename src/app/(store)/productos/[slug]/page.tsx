import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { AvailabilityBadge } from "@/components/catalog/AvailabilityBadge";
import { PriceTag } from "@/components/catalog/PriceTag";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { getCatalogProductBySlug } from "@/modules/catalog/repository";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="page-shell py-10">
      <div className="mb-6">
        <Link href="/tienda" className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]">
          ← Volver a la tienda
        </Link>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <ProductGallery images={product.gallery} name={product.name} />
        <div className="panel-card rounded-[2rem] p-6 sm:p-8">
          <AvailabilityBadge status={product.availabilityStatus} />
          <h1 className="mt-4 text-4xl font-semibold">{product.name}</h1>
          <p className="mt-4 text-base leading-8 text-[var(--color-muted)]">
            {product.longDescription}
          </p>
          <div className="mt-6">
            <PriceTag value={product.priceClpTaxInc} />
          </div>
          <div className="mt-6 grid gap-3 text-sm text-[var(--color-muted)]">
            {product.highlights.map((highlight) => (
              <div key={highlight} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <AddToCartButton product={product} />
            <Link href="/cotizar" className="button-secondary px-5 py-3 text-sm">
              Cotizar este producto
            </Link>
          </div>
          <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
            Despacho: por confirmar según comuna y condiciones logísticas.
          </p>
        </div>
      </div>
    </div>
  );
}
