import { CatalogProduct } from "@/modules/catalog/types";

const badgeStyles: Record<CatalogProduct["availabilityStatus"], string> = {
  available:
    "bg-[color-mix(in_srgb,var(--color-success)_14%,white_86%)] text-[var(--color-success)]",
  check_availability:
    "bg-[color-mix(in_srgb,var(--color-warning)_14%,white_86%)] text-[var(--color-warning)]",
  sold_out:
    "bg-[color-mix(in_srgb,var(--color-danger)_14%,white_86%)] text-[var(--color-danger)]",
};

const badgeLabels: Record<CatalogProduct["availabilityStatus"], string> = {
  available: "Disponible",
  check_availability: "Consultar disponibilidad",
  sold_out: "Agotado",
};

export function AvailabilityBadge({
  status,
}: {
  status: CatalogProduct["availabilityStatus"];
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[status]}`}
    >
      {badgeLabels[status]}
    </span>
  );
}
