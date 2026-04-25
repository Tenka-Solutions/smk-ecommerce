"use client";

import Link from "next/link";
import { formatClp } from "@/lib/format/currency";
import { useCartStore } from "@/lib/cart-store";

export function CartSummary() {
  const subtotal = useCartStore((store) => store.subtotal());
  const totalItems = useCartStore((store) => store.totalItems());

  return (
    <aside className="panel-card rounded-[2rem] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Compra</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
            Resumen
          </h2>
        </div>
        <span className="inline-flex rounded-full bg-[var(--color-badge)] px-3 py-1 text-xs font-semibold text-[var(--color-badge-foreground)]">
          {totalItems} producto{totalItems === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-5 rounded-[1.6rem] bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-primary-hover)_100%)] px-5 py-5 text-[var(--color-primary-foreground)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--color-primary-foreground)_74%,transparent)]">
          Total a pagar
        </p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <span className="text-3xl font-semibold sm:text-4xl">
            {formatClp(subtotal)}
          </span>
          <span className="rounded-full bg-[color-mix(in_srgb,var(--color-primary-foreground)_14%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-foreground)]">
            IVA incluido
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm text-[var(--color-muted)]">
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

      <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
        El despacho se confirma después de la compra según cobertura y comuna.
      </p>

      <Link
        href="/checkout"
        className="button-primary mt-6 min-h-13 w-full px-5 py-3 text-base"
      >
        Continuar al checkout
      </Link>

      <p className="mt-3 text-center text-xs text-[var(--color-muted)]">
        Pago seguro y validado antes de la confirmación final.
      </p>
    </aside>
  );
}
