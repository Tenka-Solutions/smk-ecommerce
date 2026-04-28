import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="panel-card rounded-[2rem] px-6 py-14 text-center">
      <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--color-muted-foreground)]">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="button-primary mt-6 px-6 py-3">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
