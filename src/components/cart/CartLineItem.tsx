"use client";

import Image from "next/image";
import Link from "next/link";
import { formatClp } from "@/lib/format/currency";
import { CartItem, useCartStore } from "@/lib/cart-store";

export function CartLineItem({ item }: { item: CartItem }) {
  const removeItem = useCartStore((store) => store.removeItem);
  const updateQuantity = useCartStore((store) => store.updateQuantity);

  return (
    <article className="surface-card grid gap-4 rounded-[1.75rem] p-4 sm:grid-cols-[6rem_1fr_auto]">
      <div className="relative h-24 overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)]">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="96px"
          className="object-contain p-3"
        />
      </div>

      <div className="min-w-0">
        <Link
          href={`/productos/${item.slug}`}
          className="text-lg font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)]"
        >
          {item.name}
        </Link>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {formatClp(item.priceClpTaxInc)} por unidad
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:items-end">
        <div className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white">
          <button
            type="button"
            className="px-3 py-2 text-sm text-[var(--color-muted)]"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            -
          </button>
          <span className="px-3 text-sm font-semibold">{item.quantity}</span>
          <button
            type="button"
            className="px-3 py-2 text-sm text-[var(--color-muted)]"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            +
          </button>
        </div>
        <p className="text-lg font-semibold text-[var(--color-ink)]">
          {formatClp(item.priceClpTaxInc * item.quantity)}
        </p>
        <button
          type="button"
          onClick={() => removeItem(item.id)}
          className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-danger)]"
        >
          Quitar
        </button>
      </div>
    </article>
  );
}
