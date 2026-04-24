"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--card)_74%,transparent)] text-[var(--color-ink)] shadow-[0_10px_28px_-22px_rgba(0,0,0,0.55)] hover:border-[var(--color-gold)] focus:outline-none focus:ring-4 focus:ring-[var(--ring)] ${className}`}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
    >
      {isDark ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4.5 w-4.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4.5 w-4.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path d="M20.99 13.28A8 8 0 1 1 10.72 3.01 6 6 0 1 0 20.99 13.28Z" />
        </svg>
      )}
    </button>
  );
}

