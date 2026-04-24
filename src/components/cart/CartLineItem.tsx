"use client";

import Image from "next/image";
import Link from "next/link";
import { formatClp } from "@/lib/format/currency";
import { CartItem, useCartStore } from "@/lib/cart-store";

export function CartLineItem({ item }: { item: CartItem }) {
  const removeItem = useCartStore((store) => store.removeItem);
  const updateQuantity = useCartStore((store) => store.updateQuantity);

  return (
    <article className="surface-card rounded-[1.75rem] p-4">
      <div className="flex gap-4">
        <div className="relative h-22 w-22 shrink-0 overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] sm:h-24 sm:w-24">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="96px"
            className="object-contain p-3"
          />
        </div>

        <div className="min-w-0 flex-1">
          <Link
            href={`/productos/${item.slug}`}
            className="line-clamp-2 text-base font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] sm:text-lg"
          >
            {item.name}
          </Link>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {formatClp(item.priceClpTaxInc)} por unidad
          </p>
          <p className="mt-3 text-xl font-semibold text-[var(--color-ink)]">
            {formatClp(item.priceClpTaxInc * item.quantity)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
        <div className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--input)]">
          <button
            type="button"
            className="px-4 py-2 text-base text-[var(--color-muted)]"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            -
          </button>
          <span className="min-w-10 px-2 text-center text-sm font-semibold">
            {item.quantity}
          </span>
          <button
            type="button"
            className="px-4 py-2 text-base text-[var(--color-muted)]"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => removeItem(item.id)}
          className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-muted)] hover:border-[rgba(155,66,59,0.16)] hover:text-[var(--color-danger)]"
        >
          Quitar
        </button>
      </div>
    </article>
  );
}
