"use client";

import Image from "next/image";
import { formatClp } from "@/lib/format/currency";
import { useCartStore } from "@/lib/cart-store";

export function OrderSummary() {
  const items = useCartStore((store) => store.items);
  const subtotal = useCartStore((store) => store.subtotal());

  return (
    <aside className="panel-card rounded-[2rem] p-6">
      <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
        Resumen del pedido
      </h2>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-[1.4rem] border border-[var(--color-border)] bg-white/80 p-3"
          >
            <div className="relative h-14 w-14 overflow-hidden rounded-[1rem] bg-[var(--color-surface-strong)]">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="56px"
                className="object-contain p-2"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-[var(--color-muted)]">
                {item.quantity} unidad{item.quantity === 1 ? "" : "es"}
              </p>
            </div>
            <span className="text-sm font-semibold">
              {formatClp(item.priceClpTaxInc * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-6 space-y-3 text-sm text-[var(--color-muted)]">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-[var(--color-ink)]">
            {formatClp(subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>IVA</span>
          <span className="font-semibold text-[var(--color-ink)]">Incluido</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Despacho</span>
          <span className="font-semibold text-[var(--color-ink)]">
            Por confirmar
          </span>
        </div>
      </div>
      <div className="mt-6 rounded-[1.5rem] bg-[var(--color-accent)] px-5 py-4 text-white">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-[0.18em]">
            Total
          </span>
          <span className="text-2xl font-semibold">{formatClp(subtotal)}</span>
        </div>
      </div>
    </aside>
  );
}
