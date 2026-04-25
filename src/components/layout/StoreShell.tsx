import Image from "next/image";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

export function StoreShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="w-full bg-black" aria-label="Beneficios de compra">
        <Image
          src="/banner_hubcafe_strip.png"
          alt="Despacho a todo Chile, precios con IVA incluido y asesoría personalizada"
          width={1818}
          height={125}
          priority
          sizes="100vw"
          className="block h-auto w-full"
        />
      </section>
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
