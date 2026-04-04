"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { checkoutSchema, CheckoutFormData } from "@/lib/validations/checkout";
import { toast } from "sonner";

const REGIONS = [
  "Región de Arica y Parinacota",
  "Región de Tarapacá",
  "Región de Antofagasta",
  "Región de Atacama",
  "Región de Coquimbo",
  "Región de Valparaíso",
  "Región Metropolitana",
  "Región del Libertador General Bernardo O'Higgins",
  "Región del Maule",
  "Región de Ñuble",
  "Región del Biobío",
  "Región de La Araucanía",
  "Región de Los Ríos",
  "Región de Los Lagos",
  "Región de Aysén",
  "Región de Magallanes",
];

type FieldErrors = Partial<Record<keyof CheckoutFormData, string>>;

export default function CheckoutForm() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState<CheckoutFormData>({
    name: "",
    email: "",
    phone: "",
    rut: "",
    region: "",
    comuna: "",
    address: "",
    notes: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CheckoutFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof CheckoutFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, payer: result.data }),
      });

      if (!res.ok) throw new Error("Error al procesar el pago");

      const { init_point } = await res.json();
      clearCart();
      router.push(init_point);
    } catch (err) {
      toast.error("No se pudo iniciar el pago. Intenta nuevamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const field = (
    name: keyof CheckoutFormData,
    label: string,
    props?: React.InputHTMLAttributes<HTMLInputElement>
  ) => (
    <div>
      <label className="block text-sm font-medium text-[#3d464d] mb-1.5">
        {label}
      </label>
      <input
        name={name}
        value={form[name] ?? ""}
        onChange={handleChange}
        className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${
          errors[name]
            ? "border-red-400 focus:border-red-400 focus:ring-red-200"
            : "border-[#ced4da] focus:border-[#ffd333] focus:ring-[#ffd333]/25"
        }`}
        {...props}
      />
      {errors[name] && (
        <p className="mt-1 text-xs text-red-500">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
      <h2 className="text-lg font-bold text-[#3d464d]">Datos de contacto</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {field("name", "Nombre completo", { placeholder: "Juan Pérez" })}
        {field("rut", "RUT", { placeholder: "12.345.678-9" })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {field("email", "Correo electrónico", { type: "email", placeholder: "juan@empresa.cl" })}
        {field("phone", "Teléfono", { type: "tel", placeholder: "+56 9 1234 5678" })}
      </div>

      <div className="border-t border-[#f5f5f5] pt-5">
        <h2 className="text-lg font-bold text-[#3d464d] mb-5">Dirección de envío</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#3d464d] mb-1.5">Región</label>
            <select
              name="region"
              value={form.region}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition bg-white ${
                errors.region
                  ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                  : "border-[#ced4da] focus:border-[#ffd333] focus:ring-[#ffd333]/25"
              }`}
            >
              <option value="">Selecciona una región</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {errors.region && <p className="mt-1 text-xs text-red-500">{errors.region}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {field("comuna", "Comuna", { placeholder: "Concepción" })}
            {field("address", "Dirección", { placeholder: "Av. Ejemplo 123" })}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3d464d] mb-1.5">
              Notas del pedido{" "}
              <span className="text-[#6c757d] font-normal">(opcional)</span>
            </label>
            <textarea
              name="notes"
              value={form.notes ?? ""}
              onChange={handleChange}
              rows={3}
              placeholder="Instrucciones especiales, referencias, etc."
              className="w-full border border-[#ced4da] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ffd333] focus:ring-2 focus:ring-[#ffd333]/25 transition resize-none"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || items.length === 0}
        className="w-full bg-[#ffd333] hover:bg-[#e6be2e] disabled:opacity-60 disabled:cursor-not-allowed text-[#3d464d] font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Procesando...
          </>
        ) : (
          "Pagar con MercadoPago"
        )}
      </button>
    </form>
  );
}
