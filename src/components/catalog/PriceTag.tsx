import { formatClp } from "@/lib/format/currency";

export function PriceTag({ value }: { value: number }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
        Precio final
      </p>
      <p className="mt-1 text-2xl font-semibold text-[var(--color-ink)]">
        {formatClp(value)}
      </p>
      <p className="mt-1 text-xs text-[var(--color-muted)]">IVA incluido</p>
    </div>
  );
}
