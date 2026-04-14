import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; reference?: string; mode?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="page-shell flex min-h-[70vh] items-center py-16">
      <ClearCartOnMount />
      <div className="panel-card mx-auto max-w-2xl rounded-[2rem] px-8 py-14 text-center">
        <p className="section-kicker">Compra exitosa</p>
        <h1 className="mt-4 text-4xl font-semibold">
          Tu pedido fue registrado correctamente
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
          Orden {params.order ?? "generada"}
          {params.reference ? ` · Ref. ${params.reference}` : ""}.
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
          Te contactaremos por correo con el seguimiento de la compra y la
          coordinacion del despacho.
        </p>
      </div>
    </div>
  );
}
