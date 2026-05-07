"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
} from "framer-motion";
import { toast } from "sonner";

import { formatClp } from "@/lib/format/currency";
import { useCartStore } from "@/lib/cart-store";
import type { CatalogProduct } from "@/modules/catalog/types";

interface HeroCarouselProps {
  products: CatalogProduct[];
}

const SPEED = 0.45;
const LOOP_WIDTH = 2000;

export function HeroCarousel({ products }: HeroCarouselProps) {
  const addItem = useCartStore((store) => store.addItem);

  const x = useMotionValue(-800);

  const isDragging = useRef(false);

  if (!products.length) return null;

  const carouselProducts = [
    ...products,
    { id: "spacer-1" } as CatalogProduct,
    ...products,
    { id: "spacer-2" } as CatalogProduct,
    ...products,
  ];

  function handleAdd(product: CatalogProduct) {
    addItem(product);
    toast.success(`${product.name} agregado al carrito`);
  }

  useAnimationFrame(() => {
    if (isDragging.current) return;

    let next = x.get() - SPEED;

    // seamless wrapping
    if (next <= -LOOP_WIDTH) {
      next += LOOP_WIDTH;
    }

    if (next >= 0) {
      next -= LOOP_WIDTH;
    }

    x.set(next);
  });

  return (
    <div className="mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_6%,black_92%,transparent_100%)]">
      <motion.div
        drag="x"
        dragElastic={0.02}
        dragMomentum={false}
        style={{
          x,
          touchAction: "pan-y",
        }}
        onDragStart={() => {
          isDragging.current = true;
        }}
        onDragEnd={() => {
          // normalize immediately after release
          let current = x.get();

          while (current <= -LOOP_WIDTH) {
            current += LOOP_WIDTH;
          }

          while (current >= 0) {
            current -= LOOP_WIDTH;
          }

          x.set(current);

          isDragging.current = false;
        }}
        className="flex w-max gap-4 pb-2 cursor-grab active:cursor-grabbing"
      >
        {carouselProducts.map((product, index) => {
          if (product.id.toString().startsWith("spacer")) {
            return (
              <div
                key={product.id}
                className="w-12 shrink-0"
                aria-hidden="true"
              />
            );
          }

          return (
            <article
              key={`${product.id}-${index}`}
              className="w-[220px] shrink-0 rounded-[1.25rem] border border-[var(--color-hero-border)] bg-[var(--color-hero-card)] p-3 sm:w-[240px] select-none"
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
                  onClick={() => handleAdd(product)}
                  className="button-gold relative z-10 mt-3 w-full px-4 py-2 text-xs"
                >
                  Agregar
                </button>
              </div>
            </article>
          );
        })}
      </motion.div>

      <p className="mt-3 text-center text-xs text-[var(--color-hero-muted)]">
        Arrastra para explorar productos
      </p>
    </div>
  );
}