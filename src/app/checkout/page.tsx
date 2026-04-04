"use client";

import { useCartStore } from "@/lib/cart-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import OrderSummary from "@/components/checkout/OrderSummary";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const router = useRouter();

  useEffect(() => {
    if (items.length === 0) router.replace("/cart");
  }, [items, router]);

  if (items.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-[#3d464d] mb-8">Finalizar compra</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        <CheckoutForm />
        <div className="sticky top-24">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
