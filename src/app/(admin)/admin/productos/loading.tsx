export default function AdminProductsLoading() {
  return (
    <div className="grid gap-6">
      <section className="panel-card rounded-[2rem] p-6 sm:p-8">
        <div className="h-3 w-28 rounded-full bg-[var(--color-surface-strong)]" />
        <div className="mt-5 h-10 w-64 rounded-full bg-[var(--color-surface-strong)]" />
        <div className="mt-5 h-4 max-w-2xl rounded-full bg-[var(--color-surface-strong)]" />
      </section>

      <section className="panel-card rounded-[2rem] p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px_220px_auto_auto]">
          {Array.from({ length: 5 }).map((_, index) => (
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

