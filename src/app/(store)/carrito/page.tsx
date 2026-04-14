"use client";

import Link from "next/link";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useCartStore } from "@/lib/cart-store";

export default function CartPage() {
  const items = useCartStore((store) => store.items);
  const hasHydrated = useCartStore((store) => store.hasHydrated);

  return (
    <div className="page-shell py-10">
      <div className="max-w-3xl">
        <p className="section-kicker">Carrito</p>
        <h1 className="mt-3 text-4xl font-semibold">Resumen de compra</h1>
        <p className="mt-4 text-base leading-8 text-[var(--color-muted)]">
          Revisa tus productos antes de continuar. Los precios ya incluyen IVA.
        </p>
      </div>
      <div className="mt-8">
        {!hasHydrated ? (
          <div className="panel-card rounded-[2rem] p-6 text-sm text-[var(--color-muted)]">
            Cargando carrito...
          </div>
        ) : items.length ? (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              {items.map((item) => (
                <CartLineItem key={item.id} item={item} />
              ))}
              <Link href="/tienda" className="inline-flex text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-strong)]">
                Seguir comprando
              </Link>
            </div>
            <div className="xl:sticky xl:top-24 xl:self-start">
              <CartSummary />
            </div>
          </div>
        ) : (
          <EmptyState
            title="Tu carrito está vacío"
            description="Explora el catálogo y agrega productos para continuar con tu compra."
            actionHref="/tienda"
            actionLabel="Ir a la tienda"
          />
        )}
      </div>
    </div>
  );
}
