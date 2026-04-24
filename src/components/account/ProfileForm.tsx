"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Profile } from "@/modules/profile/service";

interface Props {
  initial: Profile;
  email: string;
}

export function ProfileForm({ initial, email }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: initial.fullName ?? "",
    phone: initial.phone ?? "",
    companyName: initial.companyName ?? "",
    rut: initial.rut ?? "",
  });
  const [isPending, startTransition] = useTransition();

  function setField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "No pudimos guardar los cambios.");
        return;
      }
      toast.success("Perfil actualizado");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="panel-card rounded-[2rem] p-6 sm:p-8">
      <div>
        <p className="section-kicker">Datos personales</p>
        <h2 className="mt-3 text-2xl font-semibold">Tu perfil</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
          Esta información se usa para tus pedidos y facturación.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            Correo electrónico
          </label>
          <input className="form-input" value={email} disabled readOnly />
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            El correo de tu cuenta no se puede cambiar desde aquí.
          </p>
        </div>

        {(
          [
            ["fullName", "Nombre completo", "Juan Pérez"],
            ["phone", "Teléfono", "+56 9 1234 5678"],
            ["companyName", "Empresa (opcional)", "SMK Vending"],
            ["rut", "RUT (opcional)", "12.345.678-9"],
          ] as const
        ).map(([name, label, placeholder]) => (
          <div key={name}>
            <label className="mb-2 block text-sm font-medium">{label}</label>
            <input
              className="form-input"
              value={form[name]}
              placeholder={placeholder}
              onChange={(event) => setField(name, event.target.value)}
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="button-primary mt-8 w-full px-6 py-3 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
