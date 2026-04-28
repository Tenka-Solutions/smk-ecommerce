"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cart-store";
import { CatalogProduct } from "@/modules/catalog/types";

export function AddToCartButton({ product }: { product: CatalogProduct }) {
  const [isAdding, setIsAdding] = useState(false);
  const lastInteractionRef = useRef(0);
  const isUnavailable = ["sold_out", "draft", "hidden"].includes(
    product.availabilityStatus
  );

  function handleAdd(
    event?:
      | React.MouseEvent<HTMLButtonElement>
      | React.TouchEvent<HTMLButtonElement>
  ) {
    event?.preventDefault();
    event?.stopPropagation();

    if (isUnavailable || isAdding) {
      return;
    }

    const now = Date.now();

    if (now - lastInteractionRef.current < 350) {
      return;
    }

    lastInteractionRef.current = now;
    setIsAdding(true);

    try {
      useCartStore.getState().addItem(product);
      toast.success(`${product.name} agregado al carrito`);
    } catch {
      toast.error("No pudimos agregar el producto. Intenta nuevamente.");
    } finally {
      window.setTimeout(() => {
        setIsAdding(false);
      }, 180);
    }
  }

  return (
    <button
      type="button"
      disabled={isUnavailable || isAdding}
      onClick={handleAdd}
      onTouchEnd={handleAdd}
      className="button-primary relative z-10 w-full select-none px-5 py-3 text-sm [touch-action:manipulation] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isUnavailable
        ? "No disponible"
        : isAdding
          ? "Agregando..."
          : "Agregar al carrito"}
    </button>
  );
}
