"use client";

const statusMap = {
  pending: {
    label: "Pendiente",
    className:
      "border-[color-mix(in_srgb,var(--color-warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_12%,var(--color-card)_88%)] text-[var(--color-warning)]",
  },
  paid: {
    label: "Pagado",
    className:
      "border-[color-mix(in_srgb,var(--color-success)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_12%,var(--color-card)_88%)] text-[var(--color-success)]",
  },
  rejected: {
    label: "Rechazado",
    className:
      "border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_12%,var(--color-card)_88%)] text-[var(--color-danger)]",
  },
  cancelled: {
    label: "Cancelado",
    className:
      "border-[color-mix(in_srgb,var(--color-muted-foreground)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-muted)_42%,var(--color-card)_58%)] text-[var(--color-muted-foreground)]",
  },
  preparing: {
    label: "En preparacion",
    className:
      "border-[color-mix(in_srgb,var(--color-warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_12%,var(--color-card)_88%)] text-[var(--color-warning)]",
  },
  processing: {
    label: "En proceso",
    className:
      "border-[color-mix(in_srgb,var(--color-warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_12%,var(--color-card)_88%)] text-[var(--color-warning)]",
  },
  shipped: {
    label: "Enviado",
    className:
      "border-[color-mix(in_srgb,var(--color-secondary)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-secondary)_12%,var(--color-card)_88%)] text-[var(--color-foreground)]",
  },
  completed: {
    label: "Completado",
    className:
      "border-[color-mix(in_srgb,var(--color-success)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_12%,var(--color-card)_88%)] text-[var(--color-success)]",
  },
  delivered: {
    label: "Entregado",
    className:
      "border-[color-mix(in_srgb,var(--color-success)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_12%,var(--color-card)_88%)] text-[var(--color-success)]",
  },
  new: {
    label: "Nueva",
    className:
      "border-[color-mix(in_srgb,var(--color-warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_12%,var(--color-card)_88%)] text-[var(--color-warning)]",
  },
  reviewed: {
    label: "Revisada",
    className:
      "border-[color-mix(in_srgb,var(--color-secondary)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-secondary)_12%,var(--color-card)_88%)] text-[var(--color-foreground)]",
  },
  closed: {
    label: "Cerrada",
    className:
      "border-[color-mix(in_srgb,var(--color-muted-foreground)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-muted)_42%,var(--color-card)_58%)] text-[var(--color-muted-foreground)]",
  },
  available: {
    label: "Disponible",
    className:
      "border-[color-mix(in_srgb,var(--color-success)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_12%,var(--color-card)_88%)] text-[var(--color-success)]",
  },
  check_availability: {
    label: "Consultar",
    className:
      "border-[color-mix(in_srgb,var(--color-warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_12%,var(--color-card)_88%)] text-[var(--color-warning)]",
  },
  sold_out: {
    label: "Agotado",
    className:
      "border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_12%,var(--color-card)_88%)] text-[var(--color-danger)]",
  },
  draft: {
    label: "Borrador",
    className:
      "border-[color-mix(in_srgb,var(--color-muted-foreground)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-muted)_42%,var(--color-card)_58%)] text-[var(--color-muted-foreground)]",
  },
  hidden: {
    label: "Oculto",
    className:
      "border-[color-mix(in_srgb,var(--color-muted-foreground)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-muted)_42%,var(--color-card)_58%)] text-[var(--color-muted-foreground)]",
  },
  published: {
    label: "Publicado",
    className:
      "border-[color-mix(in_srgb,var(--color-success)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_12%,var(--color-card)_88%)] text-[var(--color-success)]",
  },
  archived: {
    label: "Archivado",
    className:
      "border-[color-mix(in_srgb,var(--color-muted-foreground)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-muted)_42%,var(--color-card)_58%)] text-[var(--color-muted-foreground)]",
  },
} as const;

export function StatusBadge({
  status,
}: {
  status: keyof typeof statusMap | string;
}) {
  const config =
    statusMap[status as keyof typeof statusMap] ??
    ({
      label: status,
      className:
        "border-[color-mix(in_srgb,var(--color-secondary)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-secondary)_12%,var(--color-card)_88%)] text-[var(--color-foreground)]",
    } as const);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
