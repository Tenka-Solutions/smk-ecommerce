"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cart-store";
import {
  checkoutCustomerSchema,
  checkoutPayloadSchema,
  checkoutShippingSchema,
  toCheckoutItemPayload,
} from "@/modules/checkout/schema";

type Errors = Record<string, string>;

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  rut: "",
  companyName: "",
  businessName: "",
  businessActivity: "",
  region: "",
  comuna: "",
  street: "",
  number: "",
  apartment: "",
  references: "",
  deliveryNotes: "",
};

export function CheckoutForm({
  authMode,
}: {
  authMode: "guest" | "google";
}) {
  const items = useCartStore((store) => store.items);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [isPending, startTransition] = useTransition();

  const customerPayload = useMemo(
    () => ({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      rut: form.rut || undefined,
      companyName: form.companyName || undefined,
      businessName: form.businessName || undefined,
      businessActivity: form.businessActivity || undefined,
    }),
    [form]
  );

  const shippingPayload = useMemo(
    () => ({
      region: form.region,
      comuna: form.comuna,
      street: form.street,
      number: form.number,
      apartment: form.apartment || undefined,
      references: form.references || undefined,
      deliveryNotes: form.deliveryNotes || undefined,
    }),
    [form]
  );

  function setField(name: string, value: string) {
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[name];
      return nextErrors;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const customerResult = checkoutCustomerSchema.safeParse(customerPayload);
    const shippingResult = checkoutShippingSchema.safeParse(shippingPayload);

    if (!customerResult.success || !shippingResult.success) {
      const nextErrors: Errors = {};

      customerResult.error?.issues.forEach((issue) => {
        nextErrors[String(issue.path[0])] = issue.message;
      });
      shippingResult.error?.issues.forEach((issue) => {
        nextErrors[String(issue.path[0])] = issue.message;
      });

      setErrors(nextErrors);
      return;
    }

    const payload = {
      customer: customerResult.data,
      shipping: shippingResult.data,
      items: toCheckoutItemPayload(items),
      authMode,
    };

    const validationResult = checkoutPayloadSchema.safeParse(payload);

    if (!validationResult.success) {
      toast.error("Revisa los datos del checkout antes de continuar.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/payments/getnet/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validationResult.data),
      });

      const data = await response.json();

      if (!response.ok || !data.redirectUrl) {
        toast.error(data.error ?? "No fue posible iniciar el pago.");
        return;
      }

      window.location.href = data.redirectUrl;
    });
  }

  return (
    <form onSubmit={handleSubmit} className="panel-card rounded-[2rem] p-6 sm:p-8">
      <div>
        <p className="section-kicker">Datos del cliente</p>
        <h2 className="mt-3 text-2xl font-semibold">Checkout</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
          Puedes comprar como invitado o continuar con tu cuenta. Los precios
          mostrados ya incluyen IVA.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          ["fullName", "Nombre completo", "Juan Pérez"],
          ["email", "Correo electrónico", "correo@empresa.cl"],
          ["phone", "Teléfono", "+56 9 1234 5678"],
          ["rut", "RUT (opcional)", "12.345.678-9"],
          ["companyName", "Empresa (opcional)", "SMK Vending"],
          ["businessName", "Razón social (opcional)", "SMK Vending SpA"],
          ["businessActivity", "Giro (opcional)", "Servicios de café"],
        ].map(([name, label, placeholder]) => (
          <div key={name} className={name === "businessActivity" ? "sm:col-span-2" : ""}>
            <label className="mb-2 block text-sm font-medium">{label}</label>
            <input
              className="form-input"
              value={form[name as keyof typeof form]}
              placeholder={placeholder}
              onChange={(event) => setField(name, event.target.value)}
            />
            {errors[name] ? (
              <p className="mt-2 text-xs text-[var(--color-danger)]">
                {errors[name]}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-[var(--color-border)] pt-8">
        <p className="section-kicker">Despacho</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ["region", "Región", "Región Metropolitana"],
            ["comuna", "Comuna", "Providencia"],
            ["street", "Dirección", "Av. Ejemplo"],
            ["number", "Número", "1234"],
            ["apartment", "Departamento / oficina (opcional)", "Of. 405"],
            ["references", "Referencias", "Recepción primer piso"],
          ].map(([name, label, placeholder]) => (
            <div key={name}>
              <label className="mb-2 block text-sm font-medium">{label}</label>
              <input
                className="form-input"
                value={form[name as keyof typeof form]}
                placeholder={placeholder}
                onChange={(event) => setField(name, event.target.value)}
              />
              {errors[name] ? (
                <p className="mt-2 text-xs text-[var(--color-danger)]">
                  {errors[name]}
                </p>
              ) : null}
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Observaciones de entrega
            </label>
            <textarea
              className="form-input min-h-28 resize-none"
              value={form.deliveryNotes}
              placeholder="Indicaciones para entrega, horario o acceso."
              onChange={(event) => setField("deliveryNotes", event.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={items.length === 0 || isPending}
        className="button-primary mt-8 w-full px-6 py-3 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Redirigiendo al pago..." : "Pagar con Getnet"}
      </button>
    </form>
  );
}
