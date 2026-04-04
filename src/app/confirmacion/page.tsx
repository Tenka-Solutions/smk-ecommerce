"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useCartStore } from "@/lib/cart-store";

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const clearCart = useCartStore((s) => s.clearCart);

  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <span className="text-7xl block mb-6">🎉</span>
      <h1 className="text-3xl font-bold text-[#3d464d] mb-3">
        ¡Pago recibido!
      </h1>
      <p className="text-[#6c757d] mb-6 leading-relaxed">
        Tu pedido fue procesado exitosamente. Nos pondremos en contacto contigo
        para coordinar la entrega.
      </p>

      {paymentId && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8 text-sm text-[#6c757d]">
          <p>
            ID de pago:{" "}
            <span className="font-mono font-semibold text-[#3d464d]">{paymentId}</span>
          </p>
          {status && (
            <p className="mt-1">
              Estado:{" "}
              <span className="font-semibold text-[#3d464d] capitalize">{status}</span>
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/shop"
          className="bg-[#ffd333] hover:bg-[#e6be2e] text-[#3d464d] font-bold px-8 py-3 rounded-lg transition-colors"
        >
          Seguir comprando
        </Link>
        <Link
          href="/"
          className="border border-[#3d464d] text-[#3d464d] hover:bg-[#3d464d] hover:text-white font-medium px-8 py-3 rounded-lg transition-colors"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense>
      <ConfirmacionContent />
    </Suspense>
  );
}
