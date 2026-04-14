"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { publicNavigation } from "@/modules/shared/site";

export function SiteHeader() {
  const pathname = usePathname();
  const totalItems = useCartStore((store) => store.totalItems());

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[rgba(245,241,235,0.9)] backdrop-blur">
      <div className="page-shell flex h-18 items-center justify-between gap-6">
        <Link href="/" className="shrink-0">
          <span className="font-[var(--font-display)] text-xl font-semibold tracking-[-0.06em] text-[var(--color-ink)]">
            SMK <span className="text-[var(--color-accent)]">Vending</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {publicNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium ${
                  isActive
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)] sm:inline-flex">
            Mi cuenta
          </Link>
          <Link
            href="/carrito"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/80 text-[var(--color-ink)]"
            aria-label="Carrito"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M3 4h2l.6 3m0 0L7 15h10l3-8H5.6zM9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
              />
            </svg>
            {totalItems > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-bold text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
