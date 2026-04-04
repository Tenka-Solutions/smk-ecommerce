import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <span className="text-6xl block mb-6">🔍</span>
      <h1 className="text-2xl font-bold text-[#3d464d] mb-3">
        Producto no encontrado
      </h1>
      <p className="text-[#6c757d] mb-8">
        El producto que buscas no existe o fue eliminado.
      </p>
      <Link
        href="/shop"
        className="bg-[#ffd333] hover:bg-[#e6be2e] text-[#3d464d] font-bold px-8 py-3 rounded-lg transition-colors inline-block"
      >
        Ver tienda
      </Link>
    </div>
  );
}
