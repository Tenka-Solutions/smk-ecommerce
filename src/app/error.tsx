"use client";

import Link from "next/link";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[var(--color-page)] text-[var(--color-ink)]">
        <div className="page-shell flex min-h-screen items-center py-16">
          <div className="panel-card mx-auto max-w-2xl rounded-[2rem] px-8 py-14 text-center">
            <p className="section-kicker">Error</p>
            <h1 className="mt-4 text-4xl font-semibold">
              Ocurrio un problema inesperado
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
              {error.message ||
                "No pudimos completar la operacion. Intenta nuevamente en unos segundos."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={reset}
                className="button-primary px-6 py-3"
              >
                Reintentar
              </button>
              <Link href="/" className="button-secondary px-6 py-3">
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
