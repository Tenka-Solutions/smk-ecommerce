import Link from "next/link";

export default function PagoFallidoPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <span className="text-7xl block mb-6">😔</span>
      <h1 className="text-2xl font-bold text-[#3d464d] mb-3">
        El pago no se completó
      </h1>
      <p className="text-[#6c757d] mb-8 leading-relaxed">
        Hubo un problema al procesar tu pago. Tu carrito fue conservado —
        puedes intentarlo nuevamente o contactarnos si el problema persiste.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/checkout"
          className="bg-[#ffd333] hover:bg-[#e6be2e] text-[#3d464d] font-bold px-8 py-3 rounded-lg transition-colors"
        >
          Reintentar pago
        </Link>
        <Link
          href="/contacto"
          className="border border-[#3d464d] text-[#3d464d] hover:bg-[#3d464d] hover:text-white font-medium px-8 py-3 rounded-lg transition-colors"
        >
          Contactar soporte
        </Link>
      </div>
    </div>
  );
}
