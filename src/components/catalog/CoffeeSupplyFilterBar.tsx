"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  coffeeSupplyFilters,
  getCoffeeSupplyFilter,
} from "@/modules/catalog/filters";

export function CoffeeSupplyFilterBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const activeFilter = getCoffeeSupplyFilter(searchParams.get("filtro"));

  function selectFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("filtro");
    } else {
      params.set("filtro", value);
    }

    startTransition(() => {
      router.push(`${pathname}${params.size ? `?${params.toString()}` : ""}`);
    });
  }

  return (
    <nav
      aria-label="Filtros de cafe e insumos"
      className="rounded-[2rem] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-card)_88%,var(--color-surface-strong)_12%)] p-2 shadow-[0_18px_42px_-36px_rgba(35,45,47,0.32)]"
    >
      <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max gap-3">
          {coffeeSupplyFilters.map((filter) => {
            const isActive = activeFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                disabled={isPending}
                aria-pressed={isActive}
                onClick={() => selectFilter(filter.value)}
                className={`inline-flex min-h-14 min-w-[9.5rem] items-center justify-center gap-3 rounded-full border px-5 text-sm font-semibold transition duration-200 disabled:cursor-wait disabled:opacity-70 sm:min-w-[10.75rem] ${
                  isActive
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-[0_18px_34px_-24px_var(--color-primary)]"
                    : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-ink)] shadow-[0_12px_26px_-28px_rgba(35,45,47,0.42)] hover:border-[color-mix(in_srgb,var(--color-primary)_58%,var(--color-border)_42%)] hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,var(--color-card)_92%)] hover:text-[var(--color-primary)]"
                }`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-[0.68rem] font-black tracking-[0.08em] ${
                    isActive
                      ? "border-[color-mix(in_srgb,var(--color-primary-foreground)_44%,transparent)] bg-[color-mix(in_srgb,var(--color-primary-foreground)_18%,transparent)] text-[var(--color-primary-foreground)]"
                      : "border-[color-mix(in_srgb,var(--color-secondary)_36%,var(--color-border)_64%)] bg-[color-mix(in_srgb,var(--color-surface-strong)_72%,var(--color-card)_28%)] text-[var(--color-secondary)]"
                  }`}
                  aria-hidden="true"
                >
                  {filter.mark}
                </span>
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
