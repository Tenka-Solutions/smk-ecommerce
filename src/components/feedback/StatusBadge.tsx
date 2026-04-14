"use client";

const statusMap = {
  pending: {
    label: "Pendiente",
    className:
      "border-[rgba(154,106,58,0.16)] bg-[rgba(154,106,58,0.08)] text-[var(--color-warning)]",
  },
  paid: {
    label: "Pagado",
    className:
      "border-[rgba(61,122,74,0.16)] bg-[rgba(61,122,74,0.08)] text-[var(--color-success)]",
  },
  rejected: {
    label: "Rechazado",
    className:
      "border-[rgba(155,66,59,0.16)] bg-[rgba(155,66,59,0.08)] text-[var(--color-danger)]",
  },
  cancelled: {
    label: "Cancelado",
    className:
      "border-[rgba(111,102,93,0.16)] bg-[rgba(111,102,93,0.08)] text-[var(--color-muted)]",
  },
  preparing: {
    label: "En preparacion",
    className:
      "border-[rgba(154,106,58,0.16)] bg-[rgba(154,106,58,0.08)] text-[var(--color-warning)]",
  },
  shipped: {
    label: "Enviado",
    className:
      "border-[rgba(29,26,23,0.14)] bg-[rgba(29,26,23,0.06)] text-[var(--color-ink)]",
  },
  delivered: {
    label: "Entregado",
    className:
      "border-[rgba(61,122,74,0.16)] bg-[rgba(61,122,74,0.08)] text-[var(--color-success)]",
  },
  new: {
    label: "Nueva",
    className:
      "border-[rgba(154,106,58,0.16)] bg-[rgba(154,106,58,0.08)] text-[var(--color-warning)]",
  },
  reviewed: {
    label: "Revisada",
    className:
      "border-[rgba(29,26,23,0.14)] bg-[rgba(29,26,23,0.06)] text-[var(--color-ink)]",
  },
  closed: {
    label: "Cerrada",
    className:
      "border-[rgba(111,102,93,0.16)] bg-[rgba(111,102,93,0.08)] text-[var(--color-muted)]",
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
        "border-[rgba(29,26,23,0.14)] bg-[rgba(29,26,23,0.06)] text-[var(--color-ink)]",
    } as const);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
