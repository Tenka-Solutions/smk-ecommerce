export default function AdminOrdersLoading() {
  return (
    <div className="grid gap-6">
      <section className="panel-card rounded-[2rem] p-6 sm:p-8">
        <div className="h-3 w-28 rounded-full bg-[var(--color-surface-strong)]" />
        <div className="mt-5 h-10 w-64 rounded-full bg-[var(--color-surface-strong)]" />
        <div className="mt-5 h-4 max-w-3xl rounded-full bg-[var(--color-surface-strong)]" />
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-[1.25rem] bg-[var(--color-surface-strong)]"
            />
          ))}
        </div>
      </section>

      <section className="panel-card rounded-[2rem] p-5 sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_190px_170px_170px_180px_auto_auto]">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="h-12 rounded-[1.125rem] bg-[var(--color-surface-strong)]"
            />
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-36 rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-card)]"
          />
        ))}
      </section>
    </div>
  );
}
