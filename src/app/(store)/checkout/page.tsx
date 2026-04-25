import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { getAuthenticatedUser } from "@/modules/auth/server";

export default async function CheckoutPage() {
  const user = await getAuthenticatedUser();

  return (
    <div className="page-shell py-10">
      <div className="max-w-3xl">
        <p className="section-kicker">Checkout</p>
        <h1 className="mt-3 text-4xl font-semibold">Finaliza tu compra</h1>
        <p className="mt-4 text-base leading-8 text-[var(--color-placeholder)]">
          Compra como invitado o continúa con tu cuenta. El despacho se confirma
          después del pago.
        </p>
      </div>
      {!user ? (
        <div className="surface-card mt-6 rounded-[1.75rem] p-5 text-sm text-[var(--color-muted)]">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-[var(--color-accent)]">
            Ingresa con Google
          </Link>{" "}
          y asocia este pedido a tu historial.
        </div>
      ) : null}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <CheckoutForm authMode={user ? "google" : "guest"} />
        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
