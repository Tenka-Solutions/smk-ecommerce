"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cart-store";
import { CatalogProduct } from "@/modules/catalog/types";

export function AddToCartButton({ product }: { product: CatalogProduct }) {
  const addItem = useCartStore((store) => store.addItem);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={product.availabilityStatus === "sold_out" || isPending}
      onClick={() =>
        startTransition(() => {
          addItem(product);
          toast.success(`${product.name} agregado al carrito`);
        })
      }
      className="button-primary w-full px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
    >
      {product.availabilityStatus === "sold_out"
        ? "No disponible"
        : "Agregar al carrito"}
    </button>
  );
}
