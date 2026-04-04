"use client";

import { useCartStore } from "@/lib/cart-store";
import { Product } from "@/lib/products";
import { toast } from "sonner";

interface Props {
  product: Product;
  className?: string;
}

export default function AddToCartButton({ product, className }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd() {
    addItem(product);
    toast.success(`${product.name} agregado al carrito`);
  }

  return (
    <button
      onClick={handleAdd}
      className={
        className ??
        "bg-[#ffd333] hover:bg-[#e6be2e] text-[#3d464d] font-bold px-8 py-3 rounded-lg transition-colors w-full sm:w-auto"
      }
    >
      Agregar al carrito
    </button>
  );
}
