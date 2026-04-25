"use client";

import { useState } from "react";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { useCartStore } from "@/lib/cart-store";

export function CartQuoteSection() {
  const items = useCartStore((store) => store.items);
  const [open, setOpen] = useState(false);

  if (!items.length) return null;

  const productIds = items.map((item) => item.id);

  return (
    <section className="mt-10">
      <div className="panel-card flex flex-col gap-4 rounded-[2rem] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="section-kicker">Cotización</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
            ¿Prefieres una propuesta a medida?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-placeholder)]">
            Solicita una cotización con los productos de tu carrito y te
            contactaremos con una propuesta comercial.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="button-secondary px-5 py-3 text-sm sm:shrink-0"
        >
          {open ? "Cerrar formulario" : "Solicitar cotización"}
        </button>
      </div>

      {open ? (
        <div className="mt-4">
          <QuoteForm productIds={productIds} />
        </div>
      ) : null}
    </section>
  );
}
