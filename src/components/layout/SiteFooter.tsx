import Link from "next/link";
import { siteConfig } from "@/modules/shared/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-[rgba(228,195,173,0.08)] bg-[var(--color-dark)]">
      <div className="page-shell grid gap-10 py-12 md:grid-cols-[1.1fr_0.9fr_0.8fr]">
        <div>
          <p className="font-[var(--font-display)] text-2xl font-semibold tracking-[-0.05em] text-white">
            SMK <span className="text-[var(--color-gold)]">Vending</span>
          </p>
          <p className="mt-4 max-w-md text-sm leading-7 text-[rgba(228,195,173,0.6)]">
            Ecommerce de máquinas, café e insumos para clientes empresa y
            clientes finales en Chile.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[rgba(228,195,173,0.4)]">
            Navegación
          </p>
          <div className="mt-4 grid gap-2 text-sm text-[rgba(228,195,173,0.6)]">
            <Link href="/tienda" className="hover:text-white">
              Tienda
            </Link>
            <Link href="/cotizar" className="hover:text-white">
              Cotizar
            </Link>
            <Link href="/despachos" className="hover:text-white">
              Política de despacho
            </Link>
            <Link href="/faq" className="hover:text-white">
              Preguntas frecuentes
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[rgba(228,195,173,0.4)]">
            Contacto
          </p>
          <div className="mt-4 grid gap-2 text-sm text-[rgba(228,195,173,0.6)]">
            <a
              href={`mailto:${siteConfig.contact.salesEmail}`}
              className="hover:text-white"
            >
              {siteConfig.contact.salesEmail}
            </a>
            <a
              href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`}
              className="hover:text-white"
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
