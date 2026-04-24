"use client";

import { useRef, useCallback, useState } from "react";
import Image from "next/image";
import type { CatalogProduct } from "@/modules/catalog/types";
import { useCartStore } from "@/lib/cart-store";
import { formatClp } from "@/lib/format/currency";
import { toast } from "sonner";

interface HeroCarouselProps {
  products: CatalogProduct[];
}

export function HeroCarousel({ products }: HeroCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDown: false, startX: 0, scrollLeft: 0, moved: false });
  const [isDragging, setIsDragging] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    dragRef.current = { isDown: true, startX: e.pageX, scrollLeft: el.scrollLeft, moved: false };
    setIsDragging(true);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDown) return;
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.pageX - dragRef.current.startX;
    if (Math.abs(dx) > 4) dragRef.current.moved = true;
    el.scrollLeft = dragRef.current.scrollLeft - dx;
  }, []);

  const onMouseUp = useCallback(() => {
    dragRef.current.isDown = false;
    setIsDragging(false);
  }, []);

  function handleAdd(e: React.MouseEvent, product: CatalogProduct) {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    addItem(product);
    toast.success(`${product.name} agregado al carrito`);
  }

  return (
    <div className="mt-8">
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className={`flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [scroll-snap-type:x_mandatory] [mask-image:linear-gradient(to_right,black_82%,transparent_100%)] ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      >
        {products.map((product) => (
          <article
            key={product.id}
            className="min-w-[220px] shrink-0 snap-start rounded-[1.25rem] border border-[var(--color-hero-border)] bg-[var(--color-hero-card)] p-3 sm:min-w-[240px]"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[var(--color-surface-soft)]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="240px"
                className="pointer-events-none object-contain p-4"
                draggable={false}
              />
            </div>
            <div className="mt-3 px-1">
              <h3 className="line-clamp-1 text-sm font-semibold text-[var(--color-hero-foreground)]">
                {product.name}
              </h3>
              <p className="mt-1 text-sm font-bold text-[var(--color-price)]">
                {formatClp(product.priceClpTaxInc)}
              </p>
              <button
                type="button"
                onClick={(e) => handleAdd(e, product)}
                className="button-gold mt-3 w-full px-4 py-2 text-xs"
              >
                Agregar
              </button>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-[var(--color-hero-muted)]">
        ← arrastra para ver más →
      </p>
    </div>
  );
}
