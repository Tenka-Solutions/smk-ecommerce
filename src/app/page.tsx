import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { categories, getFeaturedProducts } from "@/lib/products";

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      {/* Hero */}
      <section className="bg-[#3d464d] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center gap-6">
          <span className="bg-[#ffd333]/20 text-[#ffd333] text-sm font-semibold px-4 py-1.5 rounded-full">
            Región del Biobío, Chile
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight max-w-2xl">
            Vending y café automático para tu{" "}
            <span className="text-[#ffd333]">empresa</span>
          </h1>
          <p className="text-white/70 text-lg max-w-xl leading-relaxed">
            Máquinas vending, café premium y servicios de mantenimiento.
            Todo lo que necesitas en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              href="/shop"
              className="bg-[#ffd333] hover:bg-[#e6be2e] text-[#3d464d] font-bold px-8 py-3 rounded-lg transition-colors"
            >
              Ver tienda
            </Link>
            <Link
              href="/contacto"
              className="border border-white/30 hover:border-white/60 text-white font-medium px-8 py-3 rounded-lg transition-colors"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-[#3d464d] mb-8 text-center">
          ¿Qué estás buscando?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md hover:border-[#ffd333] border border-transparent transition-all group"
            >
              <span className="text-4xl block mb-3">{cat.icon}</span>
              <span className="text-sm font-semibold text-[#3d464d] group-hover:text-[#ffd333] transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#3d464d]">
            Productos destacados
          </h2>
          <Link
            href="/shop"
            className="text-sm font-semibold text-[#ffd333] hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#ffd333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3d464d] mb-3">
            ¿Quieres una máquina en tu negocio?
          </h2>
          <p className="text-[#3d464d]/70 mb-6 max-w-lg mx-auto">
            Te asesoramos sin costo. Cuéntanos qué necesitas y te armamos una
            propuesta a medida.
          </p>
          <Link
            href="/contacto"
            className="bg-[#3d464d] hover:bg-[#2e353b] text-white font-bold px-8 py-3 rounded-lg transition-colors inline-block"
          >
            Solicitar cotización
          </Link>
        </div>
      </section>
    </>
  );
}
