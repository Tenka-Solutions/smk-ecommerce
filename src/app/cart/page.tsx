"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice, getCategoryIcon } from "@/lib/products";
import QuantitySelector from "@/components/ui/QuantitySelector";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <span className="text-6xl block mb-6">🛒</span>
        <h1 className="text-2xl font-bold text-[#3d464d] mb-3">
          Tu carrito está vacío
        </h1>
        <p className="text-[#6c757d] mb-8">
          Agrega productos desde la tienda para comenzar tu compra.
        </p>
        <Link
          href="/shop"
          className="bg-[#ffd333] hover:bg-[#e6be2e] text-[#3d464d] font-bold px-8 py-3 rounded-lg transition-colors inline-block"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-[#3d464d] mb-8">Tu carrito</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center"
            >
              <div className="bg-[#f5f5f5] rounded-lg w-16 h-16 flex items-center justify-center shrink-0">
                <span className="text-2xl">{getCategoryIcon(item.category)}</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#3d464d] leading-snug">{item.name}</p>
                <p className="text-sm text-[#6c757d] mt-0.5">
                  {formatPrice(item.price)} c/u
                </p>
              </div>

              <div className="flex items-center gap-4 sm:gap-6">
                <QuantitySelector
                  quantity={item.quantity}
                  onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                  onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                />
                <p className="font-bold text-[#3d464d] w-24 text-right">
                  {formatPrice(item.price * item.quantity)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-[#6c757d] hover:text-red-500 transition-colors p-1"
                  aria-label="Eliminar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold text-[#3d464d] mb-4">Resumen del pedido</h2>

            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-[#6c757d]">
                  <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                  <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#ced4da] pt-4 mb-6">
              <div className="flex justify-between font-bold text-[#3d464d] text-lg">
                <span>Total</span>
                <span>{formatPrice(totalPrice())}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-[#ffd333] hover:bg-[#e6be2e] text-[#3d464d] font-bold py-3 rounded-lg transition-colors text-center"
            >
              Proceder al pago
            </Link>
            <Link
              href="/shop"
              className="block w-full text-center text-sm text-[#6c757d] hover:text-[#3d464d] mt-3 transition-colors"
            >
              ← Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
