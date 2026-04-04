"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <span className="text-6xl block mb-6">⚠️</span>
      <h1 className="text-2xl font-bold text-[#3d464d] mb-3">
        Algo salió mal
      </h1>
      <p className="text-[#6c757d] mb-8">
        Ocurrió un error inesperado. Puedes intentarlo nuevamente o volver a la tienda.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={reset}
          className="bg-[#ffd333] hover:bg-[#e6be2e] text-[#3d464d] font-bold px-8 py-3 rounded-lg transition-colors"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="border border-[#3d464d] text-[#3d464d] hover:bg-[#3d464d] hover:text-white font-medium px-8 py-3 rounded-lg transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
