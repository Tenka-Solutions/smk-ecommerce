"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

export function ClearCartOnMount() {
  const clearCart = useCartStore((store) => store.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
