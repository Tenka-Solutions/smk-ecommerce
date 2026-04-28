export default function AdminCategoriesLoading() {
  return (
    <div className="grid gap-6">
      <section className="panel-card rounded-[2rem] p-6 sm:p-8">
        <div className="h-3 w-28 rounded-full bg-[var(--color-surface-strong)]" />
        <div className="mt-5 h-10 w-72 rounded-full bg-[var(--color-surface-strong)]" />
        <div className="mt-5 h-4 max-w-2xl rounded-full bg-[var(--color-surface-strong)]" />
      </section>

      <section className="grid gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-card)]"
          />
        ))}
      </section>
    </div>
  );
}
