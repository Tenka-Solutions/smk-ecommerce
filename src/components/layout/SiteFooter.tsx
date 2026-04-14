import Link from "next/link";
import { siteConfig } from "@/modules/shared/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="page-shell grid gap-10 py-12 md:grid-cols-[1.1fr_0.9fr_0.8fr]">
        <div>
          <p className="font-[var(--font-display)] text-2xl font-semibold tracking-[-0.05em]">
            SMK <span className="text-[var(--color-accent)]">Vending</span>
          </p>
          <p className="mt-4 max-w-md text-sm leading-7 text-[var(--color-muted)]">
            Ecommerce de máquinas, café e insumos para clientes empresa y
            clientes finales en Chile.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Navegación
          </p>
          <div className="mt-4 grid gap-2 text-sm text-[var(--color-muted)]">
            <Link href="/tienda" className="hover:text-[var(--color-ink)]">
              Tienda
            </Link>
            <Link href="/cotizar" className="hover:text-[var(--color-ink)]">
              Cotizar
            </Link>
            <Link href="/despachos" className="hover:text-[var(--color-ink)]">
              Política de despacho
            </Link>
            <Link href="/faq" className="hover:text-[var(--color-ink)]">
              Preguntas frecuentes
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Contacto
          </p>
          <div className="mt-4 grid gap-2 text-sm text-[var(--color-muted)]">
            <a
              href={`mailto:${siteConfig.contact.salesEmail}`}
              className="hover:text-[var(--color-ink)]"
            >
              {siteConfig.contact.salesEmail}
            </a>
            <a
              href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`}
              className="hover:text-[var(--color-ink)]"
            >
              {siteConfig.contact.phone}
            </a>
            <span>{siteConfig.contact.region}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
