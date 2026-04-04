import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="text-8xl font-bold text-[#ffd333] mb-4">404</p>
      <h1 className="text-2xl font-bold text-[#3d464d] mb-3">
        Página no encontrada
      </h1>
      <p className="text-[#6c757d] mb-8">
        La página que buscas no existe.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="bg-[#ffd333] hover:bg-[#e6be2e] text-[#3d464d] font-bold px-8 py-3 rounded-lg transition-colors"
        >
          Ir al inicio
        </Link>
        <Link
          href="/shop"
          className="border border-[#3d464d] text-[#3d464d] hover:bg-[#3d464d] hover:text-white font-medium px-8 py-3 rounded-lg transition-colors"
        >
          Ver tienda
        </Link>
      </div>
    </div>
  );
}
