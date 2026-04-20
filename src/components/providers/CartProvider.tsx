"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const hydrateCart = async () => {
      try {
        await useCartStore.persist.rehydrate();
      } catch {
        // ignore
      } finally {
        useCartStore.getState().setHasHydrated(true);
      }
    };

    void hydrateCart();
  }, []);

  return <>{children}</>;
}
