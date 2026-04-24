"use client";

import Link from "next/link";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatClp } from "@/lib/format/currency";
import { useCartStore } from "@/lib/cart-store";

export default function CartPage() {
  const items = useCartStore((store) => store.items);
  const hasHydrated = useCartStore((store) => store.hasHydrated);
  const subtotal = useCartStore((store) => store.subtotal());

  return (
    <div className="page-shell py-6 pb-32 sm:py-10 xl:pb-10">
      <div className="max-w-3xl">
        <p className="section-kicker">Carrito</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
          Resumen de compra
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted)] sm:mt-4 sm:text-base sm:leading-8">
          Revisa tus productos antes de continuar. Los precios ya incluyen IVA
          y el despacho se confirma despues.
        </p>
      </div>

      <div className="mt-8">
        {!hasHydrated ? (
          <div className="panel-card rounded-[2rem] p-6 text-sm text-[var(--color-muted)]">
            Cargando carrito...
          </div>
        ) : items.length ? (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="order-2 space-y-4 xl:order-1">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-[var(--color-ink)] sm:text-xl">
                  Productos en tu carrito
                </h2>
                <span className="rounded-full bg-[var(--color-surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
                  {items.length} item{items.length === 1 ? "" : "s"}
                </span>
              </div>

              {items.map((item) => (
                <CartLineItem key={item.id} item={item} />
              ))}

              <Link
                href="/tienda"
                className="inline-flex text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-strong)]"
              >
                Seguir comprando
              </Link>
            </div>

            <div className="order-1 xl:sticky xl:top-24 xl:order-2 xl:self-start">
              <CartSummary />
            </div>
          </div>
        ) : (
          <EmptyState
            title="Tu carrito esta vacio"
            description="Explora el catalogo y agrega productos para continuar con tu compra."
            actionHref="/tienda"
            actionLabel="Ir a la tienda"
          />
        )}
      </div>

      {hasHydrated && items.length ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--card)_96%,transparent)] px-4 py-4 shadow-[0_-18px_40px_-28px_rgba(29,26,23,0.35)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Total
              </p>
              <p className="truncate text-xl font-semibold text-[var(--color-ink)]">
                {formatClp(subtotal)}
              </p>
            </div>
            <Link
              href="/checkout"
              className="button-primary min-h-12 shrink-0 px-5 py-3 text-sm"
            >
              Ir a pagar
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
