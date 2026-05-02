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
    <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max gap-2 py-1">
        {coffeeSupplyFilters.map((filter) => {
          const isActive = activeFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              disabled={isPending}
              onClick={() => selectFilter(filter.value)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-70 ${
                isActive
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-[0_12px_30px_-22px_var(--color-primary)]"
                  : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-ink)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
