export default function ShippingPolicyPage() {
  return (
    <div className="page-shell py-10">
      <p className="section-kicker">Despachos</p>
      <h1 className="mt-3 text-4xl font-semibold">Política de despacho</h1>
      <div className="mt-6 max-w-4xl text-sm leading-8 text-[var(--color-muted)]">
        <p>
          Todos los pedidos se despachan dentro de Chile. El costo de envío se
          informa como “Por confirmar” y se coordina luego de la compra según
          comuna, volumen, producto y condiciones logísticas.
        </p>
        <p className="mt-4">
          No contamos con retiro en tienda para esta primera versión del
          ecommerce.
        </p>
      </div>
    </div>
  );
}
