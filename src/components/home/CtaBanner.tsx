import Link from "next/link";

export function CtaBanner() {
  return (
    <section className="bg-[var(--color-hero)] px-4 py-16 text-center text-[var(--color-hero-foreground)] sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-xl">
        <h2 className="text-2xl font-semibold text-[var(--color-hero-foreground)] sm:text-3xl">
          ¿Necesitas una cotización?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-hero-muted)] sm:text-base">
          Te armamos una propuesta a medida para tu negocio
        </p>
        <Link
          href="/cotizar"
          className="button-gold mt-8 inline-flex px-8 py-3 text-sm"
        >
          Solicitar cotización
        </Link>
      </div>
    </section>
  );
}
