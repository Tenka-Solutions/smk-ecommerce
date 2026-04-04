import { products, formatPrice, getCategoryIcon, getCategoryLabel } from "@/lib/products";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) return {};
  return {
    title: `${product.name} | Yellow Box`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: `${product.description} — ${formatPrice(product.price)}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="text-sm text-[#6c757d] mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-[#3d464d]">Inicio</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#3d464d]">Tienda</Link>
        <span>/</span>
        <span className="text-[#3d464d] font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="bg-white rounded-2xl h-80 flex items-center justify-center shadow-sm">
          <span className="text-8xl">{getCategoryIcon(product.category)}</span>
        </div>

        <div className="flex flex-col justify-center">
          {product.badge && (
            <span className="inline-block bg-[#ffd333] text-[#3d464d] text-xs font-bold px-3 py-1 rounded-full mb-3 self-start">
              {product.badge}
            </span>
          )}
          <p className="text-sm text-[#6c757d] uppercase tracking-wide font-medium mb-2">
            {getCategoryLabel(product.category)}
          </p>
          <h1 className="text-3xl font-bold text-[#3d464d] mb-4">{product.name}</h1>
          <p className="text-[#6c757d] text-base leading-relaxed mb-6">
            {product.description}
          </p>
          <p className="text-4xl font-bold text-[#3d464d] mb-8">
            {formatPrice(product.price)}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <AddToCartButton product={product} />
            <Link
              href="/contacto"
              className="border border-[#3d464d] text-[#3d464d] hover:bg-[#3d464d] hover:text-white font-medium px-8 py-3 rounded-lg transition-colors text-center"
            >
              Solicitar cotización
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[#3d464d] mb-6">Productos relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/shop/${p.id}`}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex gap-4 items-center"
              >
                <span className="text-3xl">{getCategoryIcon(p.category)}</span>
                <div>
                  <p className="text-sm font-semibold text-[#3d464d]">{p.name}</p>
                  <p className="text-sm text-[#6c757d]">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
