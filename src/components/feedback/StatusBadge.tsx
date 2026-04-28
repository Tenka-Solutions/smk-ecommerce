"use client";

const statusToneClassNames = {
  warning:
    "border-[color-mix(in_srgb,var(--color-warning)_42%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-warning)_22%,var(--color-card)_78%)] text-[var(--color-card-foreground)]",
  success:
    "border-[color-mix(in_srgb,var(--color-success)_40%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-success)_18%,var(--color-card)_82%)] text-[var(--color-card-foreground)]",
  danger:
    "border-[color-mix(in_srgb,var(--color-danger)_40%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-danger)_18%,var(--color-card)_82%)] text-[var(--color-card-foreground)]",
  muted:
    "border-[color-mix(in_srgb,var(--color-muted-foreground)_38%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-surface-strong)_72%,var(--color-card)_28%)] text-[var(--color-card-foreground)]",
  secondary:
    "border-[color-mix(in_srgb,var(--color-secondary)_40%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-secondary)_18%,var(--color-card)_82%)] text-[var(--color-card-foreground)]",
} as const;

const statusMap = {
  pending: {
    label: "Pendiente",
    className: statusToneClassNames.warning,
  },
  paid: {
    label: "Pagado",
    className: statusToneClassNames.success,
  },
  rejected: {
    label: "Rechazado",
    className: statusToneClassNames.danger,
  },
  cancelled: {
    label: "Cancelado",
    className: statusToneClassNames.muted,
  },
  preparing: {
    label: "En preparacion",
    className: statusToneClassNames.warning,
  },
  processing: {
    label: "En proceso",
    className: statusToneClassNames.warning,
  },
  shipped: {
    label: "Enviado",
    className: statusToneClassNames.secondary,
  },
  completed: {
    label: "Completado",
    className: statusToneClassNames.success,
  },
  delivered: {
    label: "Entregado",
    className: statusToneClassNames.success,
  },
  new: {
    label: "Nueva",
    className: statusToneClassNames.warning,
  },
  reviewed: {
    label: "Revisada",
    className: statusToneClassNames.secondary,
  },
  closed: {
    label: "Cerrada",
    className: statusToneClassNames.muted,
  },
  available: {
    label: "Disponible",
    className: statusToneClassNames.success,
  },
  check_availability: {
    label: "Consultar",
    className: statusToneClassNames.warning,
  },
  sold_out: {
    label: "Agotado",
    className: statusToneClassNames.danger,
  },
  draft: {
    label: "Borrador",
    className: statusToneClassNames.muted,
  },
  hidden: {
    label: "Oculto",
    className: statusToneClassNames.muted,
  },
  published: {
    label: "Publicado",
    className: statusToneClassNames.success,
  },
  archived: {
    label: "Archivado",
    className: statusToneClassNames.muted,
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
      className: statusToneClassNames.secondary,
    } as const);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
