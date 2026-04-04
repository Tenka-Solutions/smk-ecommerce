"use client";

import { useCartStore } from "@/lib/cart-store";
import { formatPrice, getCategoryIcon } from "@/lib/products";

export default function OrderSummary() {
  const { items, totalPrice } = useCartStore();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-[#3d464d] mb-4">Tu pedido</h2>

      <ul className="divide-y divide-[#f5f5f5]">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <div className="bg-[#f5f5f5] rounded-lg w-10 h-10 flex items-center justify-center shrink-0 text-lg">
              {getCategoryIcon(item.category)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#3d464d] truncate">{item.name}</p>
              <p className="text-xs text-[#6c757d]">× {item.quantity}</p>
            </div>
            <span className="text-sm font-semibold text-[#3d464d] shrink-0">
              {formatPrice(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-[#ced4da] mt-2 pt-4 flex justify-between font-bold text-[#3d464d] text-lg">
        <span>Total</span>
        <span>{formatPrice(totalPrice())}</span>
      </div>

      <p className="text-xs text-[#6c757d] mt-3 text-center">
        Serás redirigido a MercadoPago para completar el pago de forma segura.
      </p>
    </div>
  );
}
