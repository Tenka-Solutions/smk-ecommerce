"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { quoteRequestSchema } from "@/modules/quotes/schema";

const initialState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  message: "",
};

export function QuoteForm({ productIds = [] }: { productIds?: string[] }) {
  const [form, setForm] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  function updateField(name: keyof typeof initialState, value: string) {
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = quoteRequestSchema.safeParse({
      ...form,
      company: form.company || undefined,
      productIds,
    });

    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Revisa el formulario.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error ?? "No pudimos registrar tu solicitud.");
        return;
      }

      setForm(initialState);
      toast.success("Solicitud de cotización enviada correctamente.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="panel-card rounded-[2rem] p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          className="form-input"
          placeholder="Nombre"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
        />
        <input
          className="form-input"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
        />
        <input
          className="form-input"
          placeholder="Teléfono"
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
        />
        <input
          className="form-input"
          placeholder="Empresa (opcional)"
          value={form.company}
          onChange={(event) => updateField("company", event.target.value)}
        />
        <textarea
          className="form-input min-h-32 resize-none sm:col-span-2"
          placeholder="Cuéntanos qué necesitas: productos, volumen, comuna y contexto de uso."
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="button-primary mt-6 px-6 py-3 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Enviando..." : "Solicitar cotización"}
      </button>
    </form>
  );
}
