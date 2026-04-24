"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cart-store";
import { chileRegions } from "@/lib/chile-geo";
import {
  checkoutCustomerSchema,
  checkoutPayloadSchema,
  checkoutShippingSchema,
  toCheckoutItemPayload,
} from "@/modules/checkout/schema";

type Errors = Record<string, string>;

const initialForm = {
  documentType: "boleta" as "boleta" | "factura",
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
      documentType: form.documentType,
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

  const availableComunas = useMemo(() => {
    return chileRegions.find((region) => region.name === form.region)?.comunas ?? [];
  }, [form.region]);

  function handleRegionChange(value: string) {
    setForm((currentForm) => ({ ...currentForm, region: value, comuna: "" }));
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors.region;
      delete nextErrors.comuna;
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
      const response = await fetch("/api/payments/checkout/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validationResult.data, method: "flow" }),
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

      <div className="mt-8">
        <p className="mb-2 text-sm font-medium">Tipo de documento</p>
        <div className="inline-flex rounded-full border border-[var(--color-border)] p-1 text-sm">
          <button
            type="button"
            onClick={() => setField("documentType", "boleta")}
            className={`rounded-full px-4 py-1.5 transition ${
              form.documentType === "boleta"
                ? "bg-[var(--color-ink)] text-[var(--color-surface)]"
                : "text-[var(--color-muted)]"
            }`}
          >
            Boleta
          </button>
          <button
            type="button"
            onClick={() => setField("documentType", "factura")}
            className={`rounded-full px-4 py-1.5 transition ${
              form.documentType === "factura"
                ? "bg-[var(--color-ink)] text-[var(--color-surface)]"
                : "text-[var(--color-muted)]"
            }`}
          >
            Factura
          </button>
        </div>
        {form.documentType === "factura" ? (
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Para facturar necesitamos RUT, razón social y giro.
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {(
          [
            ["fullName", "Nombre completo", "Juan Pérez", true],
            ["email", "Correo electrónico", "correo@empresa.cl", true],
            ["phone", "Teléfono", "+56 9 1234 5678", true],
            [
              "rut",
              form.documentType === "factura" ? "RUT" : "RUT (opcional)",
              "12.345.678-9",
              form.documentType === "factura",
            ],
            ["companyName", "Empresa (opcional)", "SMK Vending", false],
            [
              "businessName",
              form.documentType === "factura"
                ? "Razón social"
                : "Razón social (opcional)",
              "SMK Vending SpA",
              form.documentType === "factura",
            ],
            [
              "businessActivity",
              form.documentType === "factura" ? "Giro" : "Giro (opcional)",
              "Servicios de café",
              form.documentType === "factura",
            ],
          ] as const
        ).map(([name, label, placeholder, required]) => (
          <div key={name} className={name === "businessActivity" ? "sm:col-span-2" : ""}>
            <label className="mb-2 block text-sm font-medium">
              {label}
              {required ? " *" : ""}
            </label>
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
          <div>
            <label className="mb-2 block text-sm font-medium">Región</label>
            <select
              className="form-input"
              value={form.region}
              onChange={(event) => handleRegionChange(event.target.value)}
            >
              <option value="">Selecciona una región</option>
              {chileRegions.map((region) => (
                <option key={region.name} value={region.name}>
                  {region.name}
                </option>
              ))}
            </select>
            {errors.region ? (
              <p className="mt-2 text-xs text-[var(--color-danger)]">
                {errors.region}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Comuna</label>
            <select
              className="form-input"
              value={form.comuna}
              disabled={!form.region}
              onChange={(event) => setField("comuna", event.target.value)}
            >
              <option value="">
                {form.region ? "Selecciona una comuna" : "Selecciona primero una región"}
              </option>
              {availableComunas.map((comuna) => (
                <option key={comuna} value={comuna}>
                  {comuna}
                </option>
              ))}
            </select>
            {errors.comuna ? (
              <p className="mt-2 text-xs text-[var(--color-danger)]">
                {errors.comuna}
              </p>
            ) : null}
          </div>

          {[
            ["street", "Dirección", "Av. Ejemplo"],
            ["number", "Número", "1234"],
            ["apartment", "Departamento / oficina (opcional)", "Of. 405"],
            ["references", "Referencias (opcional)", "Recepción primer piso"],
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
              Observaciones de entrega (opcional)
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
        {isPending ? "Redirigiendo al pago..." : "Pagar"}
      </button>
    </form>
  );
}
