"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { catalogSeedCategories } from "@/modules/catalog/seed";

export function CatalogFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="surface-card grid gap-4 rounded-[1.8rem] p-4 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
      <input
        defaultValue={searchParams.get("q") ?? ""}
        placeholder="Buscar producto, categoría o atributo"
        className="form-input"
        onChange={(event) => updateParam("q", event.target.value)}
      />
      <select
        defaultValue={searchParams.get("categoria") ?? ""}
        className="form-input"
        onChange={(event) => updateParam("categoria", event.target.value)}
      >
        <option value="">Todas las categorías</option>
        {catalogSeedCategories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("sort") ?? "featured"}
        className="form-input"
        disabled={isPending}
        onChange={(event) => updateParam("sort", event.target.value)}
      >
        <option value="featured">Destacados</option>
        <option value="price-asc">Precio menor a mayor</option>
        <option value="price-desc">Precio mayor a menor</option>
        <option value="name">Nombre</option>
      </select>
    </div>
  );
}
