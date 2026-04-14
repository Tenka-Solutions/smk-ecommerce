"use client";

import Link from "next/link";
import { formatClp } from "@/lib/format/currency";
import { useCartStore } from "@/lib/cart-store";

export function CartSummary() {
  const subtotal = useCartStore((store) => store.subtotal());

  return (
    <aside className="panel-card rounded-[2rem] p-6">
      <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
        Resumen
      </h2>
      <div className="mt-6 space-y-3 text-sm text-[var(--color-muted)]">
        <div className="flex items-center justify-between gap-4">
          <span>Subtotal</span>
          <span className="font-semibold text-[var(--color-ink)]">
            {formatClp(subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>IVA</span>
          <span className="font-semibold text-[var(--color-ink)]">
            Incluido
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Despacho</span>
          <span className="font-semibold text-[var(--color-ink)]">
            Por confirmar
          </span>
        </div>
      </div>
      <div className="mt-6 rounded-[1.5rem] bg-[var(--color-accent)] px-5 py-4 text-white">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold uppercase tracking-[0.18em]">
            Total
          </span>
          <span className="text-2xl font-semibold">{formatClp(subtotal)}</span>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
        El despacho se confirma después de la compra según cobertura y comuna.
      </p>
      <Link href="/checkout" className="button-primary mt-6 w-full px-5 py-3">
        Continuar al checkout
      </Link>
    </aside>
  );
}
