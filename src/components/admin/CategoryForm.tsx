"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveCategoryAction } from "@/app/(admin)/admin/categorias/actions";
import { slugifyProductName } from "@/modules/catalog/admin-schema";
import type { CategoryFormState } from "@/modules/catalog/admin-schema";
import type { AdminCatalogCategory } from "@/modules/catalog/admin";

const initialState: CategoryFormState = {
  status: "idle",
};

function FormFieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-[var(--color-danger)]">{message}</p>;
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="button-primary px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Guardando..." : "Guardar categoria"}
    </button>
  );
}

function valueOrFallback<T>(value: T | undefined, fallback: T) {
  return value ?? fallback;
}

export function CategoryForm({
  categories,
  category,
  canMutate,
  cancelHref,
  defaultParentId,
}: {
  categories: AdminCatalogCategory[];
  category?: AdminCatalogCategory | null;
  canMutate: boolean;
  cancelHref: string;
  defaultParentId?: string;
}) {
  const [state, formAction] = useActionState(saveCategoryAction, initialState);
  const stateValues = state.values;
  const initialName = valueOrFallback(stateValues?.name, category?.name ?? "");
  const initialSlug = valueOrFallback(stateValues?.slug, category?.slug ?? "");
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [slugEdited, setSlugEdited] = useState(Boolean(category?.slug));
  const parentOptions = categories.filter(
    (entry) => !entry.parentId && entry.id !== category?.id
  );
  const defaultParentValue = valueOrFallback(
    stateValues?.parentId,
    category?.parentId ?? defaultParentId ?? ""
  );

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextName = event.target.value;
    setName(nextName);

    if (!slugEdited) {
      setSlug(slugifyProductName(nextName));
    }
  }

  function handleSlugChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSlug(event.target.value);
    setSlugEdited(true);
  }

  return (
    <form action={formAction} className="panel-card rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="section-kicker">Categoria</p>
          <h2 className="mt-3 text-3xl font-semibold">
            {category ? "Editar categoria" : "Crear categoria"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted-foreground)]">
            Una categoria sin padre aparece como linea principal; al seleccionar
            una categoria padre se crea o edita como subcategoria.
          </p>
        </div>

        <Link href={cancelHref} className="button-secondary px-5 py-3 text-sm">
          Cancelar
        </Link>
      </div>

      {state.status === "error" && state.message ? (
        <div className="mt-6 rounded-[1.25rem] border border-[color-mix(in_srgb,var(--color-danger)_40%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-danger)_16%,var(--color-card)_84%)] p-4 text-sm font-medium text-[var(--color-card-foreground)]">
          {state.message}
        </div>
      ) : null}

      {!canMutate ? (
        <div className="mt-6 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4 text-sm leading-7 text-[var(--color-muted-foreground)]">
          Tu rol puede ver categorias, pero no crear ni editar.
        </div>
      ) : null}

      <input
        type="hidden"
        name="categoryId"
        value={category?.id ?? stateValues?.categoryId ?? ""}
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Nombre *
          <input
            name="name"
            value={name}
            onChange={handleNameChange}
            className="form-input"
            placeholder="Ej: Capuchinos"
            disabled={!canMutate}
          />
          <FormFieldError message={state.fieldErrors?.name} />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Slug *
          <input
            name="slug"
            value={slug}
            onChange={handleSlugChange}
            className="form-input"
            placeholder="capuchinos"
            disabled={!canMutate}
          />
          <FormFieldError message={state.fieldErrors?.slug} />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Categoria padre
          <select
            name="parentId"
            defaultValue={defaultParentValue ?? ""}
            className="form-input"
            disabled={!canMutate}
          >
            <option value="">Sin padre, categoria principal</option>
            {parentOptions.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.name}
                {!parent.isActive ? " (inactiva)" : ""}
              </option>
            ))}
          </select>
          <FormFieldError message={state.fieldErrors?.parentId} />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Orden
          <input
            name="sortOrder"
            type="number"
            step="1"
            defaultValue={valueOrFallback(
              stateValues?.sortOrder,
              category?.sortOrder ?? 0
            )}
            className="form-input"
            disabled={!canMutate}
          />
          <FormFieldError message={state.fieldErrors?.sortOrder} />
        </label>

        <label className="grid gap-2 text-sm font-semibold lg:col-span-2">
          Descripcion
          <textarea
            name="description"
            defaultValue={valueOrFallback(
              stateValues?.description,
              category?.description ?? ""
            )}
            className="form-input min-h-28"
            placeholder="Descripcion breve para navegacion y SEO."
            disabled={!canMutate}
          />
          <FormFieldError message={state.fieldErrors?.description} />
        </label>

        <label className="grid gap-2 text-sm font-semibold lg:col-span-2">
          URL de imagen
          <input
            name="imageUrl"
            defaultValue={valueOrFallback(
              stateValues?.imageUrl,
              category?.imageUrl ?? ""
            ) ?? ""}
            className="form-input"
            placeholder="Opcional. Mantiene compatibilidad con rutas existentes."
            disabled={!canMutate}
          />
          <FormFieldError message={state.fieldErrors?.imageUrl} />
        </label>
      </div>

      <label className="mt-5 flex items-start gap-3 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4 text-sm font-semibold">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={valueOrFallback(
            stateValues?.isActive,
            category?.isActive ?? true
          )}
          className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
          disabled={!canMutate}
        />
        <span>
          Categoria activa
          <span className="mt-1 block text-xs font-normal leading-6 text-[var(--color-muted-foreground)]">
            Desactivar oculta la categoria sin borrarla fisicamente.
          </span>
        </span>
      </label>

      <div className="mt-8 flex flex-col gap-3 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className="button-secondary px-6 py-3 text-sm">
          Cancelar
        </Link>
        <SubmitButton disabled={!canMutate} />
      </div>
    </form>
  );
}
