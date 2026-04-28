import { CatalogProduct } from "@/modules/catalog/types";

const badgeStyles: Record<CatalogProduct["availabilityStatus"], string> = {
  available:
    "bg-[color-mix(in_srgb,var(--color-success)_16%,var(--color-card)_84%)] text-[var(--color-success)]",
  check_availability:
    "bg-[color-mix(in_srgb,var(--color-warning)_18%,var(--color-card)_82%)] text-[var(--color-warning)]",
  sold_out:
    "bg-[color-mix(in_srgb,var(--color-danger)_16%,var(--color-card)_84%)] text-[var(--color-danger)]",
  draft:
    "bg-[color-mix(in_srgb,var(--color-muted-foreground)_16%,var(--color-card)_84%)] text-[var(--color-muted-foreground)]",
  hidden:
    "bg-[color-mix(in_srgb,var(--color-muted-foreground)_16%,var(--color-card)_84%)] text-[var(--color-muted-foreground)]",
};

const badgeLabels: Record<CatalogProduct["availabilityStatus"], string> = {
  available: "Disponible",
  check_availability: "Consultar disponibilidad",
  sold_out: "Agotado",
  draft: "Borrador",
  hidden: "Oculto",
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
