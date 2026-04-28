"use client";

import Link from "next/link";
import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveProductAction } from "@/app/(admin)/admin/productos/actions";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";
import {
  ADMIN_PRODUCT_STATUSES,
  ADMIN_PUBLICATION_STATUSES,
  slugifyProductName,
} from "@/modules/catalog/admin-schema";
import type { ProductFormState } from "@/modules/catalog/admin-schema";
import type {
  AdminCatalogCategory,
  AdminCatalogProduct,
} from "@/modules/catalog/admin";

const initialState: ProductFormState = {
  status: "idle",
};

const availabilityStatusLabels: Record<
  (typeof ADMIN_PRODUCT_STATUSES)[number],
  string
> = {
  available: "Disponible",
  check_availability: "Consultar disponibilidad",
  sold_out: "Agotado",
};

const publicationStatusLabels: Record<
  (typeof ADMIN_PUBLICATION_STATUSES)[number],
  string
> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
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
      {pending ? "Guardando..." : "Guardar producto"}
    </button>
  );
}

function valueOrFallback<T>(value: T | undefined, fallback: T) {
  return value ?? fallback;
}

function getCategoryLabel(
  category: AdminCatalogCategory,
  categories: AdminCatalogCategory[]
) {
  if (!category.parentId) {
    return category.name;
  }

  const parent = categories.find((entry) => entry.id === category.parentId);
  return parent ? `${parent.name} / ${category.name}` : category.name;
}

export function ProductForm({
  categories,
  product,
  canMutate,
  cancelHref,
}: {
  categories: AdminCatalogCategory[];
  product?: AdminCatalogProduct | null;
  canMutate: boolean;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(saveProductAction, initialState);
  const stateValues = state.values;
  const initialName = valueOrFallback(stateValues?.name, product?.name ?? "");
  const initialSlug = valueOrFallback(stateValues?.slug, product?.slug ?? "");
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [slugEdited, setSlugEdited] = useState(Boolean(product?.slug));
  const defaultCategoryId = valueOrFallback(
    stateValues?.categoryId,
    product?.categoryId ?? ""
  );
  const defaultStatus = valueOrFallback(
    stateValues?.availabilityStatus,
    product?.availabilityStatus ?? "sold_out"
  );
  const defaultPublicationStatus = valueOrFallback(
    stateValues?.publicationStatus,
    product?.publicationStatus ?? "draft"
  );
  const parentCategories = categories.filter((category) => !category.parentId);
  const childCategories = categories.filter((category) => category.parentId);
  const orphanChildren = childCategories.filter(
    (category) => !categories.some((parent) => parent.id === category.parentId)
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
          <p className="section-kicker">Producto</p>
          <h2 className="mt-3 text-3xl font-semibold">
            {product ? "Editar producto" : "Crear producto"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted-foreground)]">
            Los cambios se guardan en Supabase y se reflejan en la tienda cuando
            el producto queda publicado. Usa borrador u oculto para preparar
            productos sin mostrarlos al cliente.
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
          Tu rol puede ver el catalogo, pero no crear ni editar productos.
        </div>
      ) : null}

      <input
        type="hidden"
        name="productId"
        value={product?.id ?? stateValues?.productId ?? ""}
      />

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Nombre *
              <input
                name="name"
                value={name}
                onChange={handleNameChange}
                className="form-input"
                placeholder="Ej: Mokador Oro Blend"
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
                placeholder="mokador-oro-blend"
                disabled={!canMutate}
              />
              <FormFieldError message={state.fieldErrors?.slug} />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-2 text-sm font-semibold">
              SKU
              <input
                name="sku"
                defaultValue={valueOrFallback(stateValues?.sku, product?.sku ?? "") ?? ""}
                className="form-input"
                placeholder="Opcional, debe ser unico"
                disabled={!canMutate}
              />
              <FormFieldError message={state.fieldErrors?.sku} />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              EAN
              <input
                name="ean"
                defaultValue={valueOrFallback(stateValues?.ean, product?.ean ?? "") ?? ""}
                className="form-input"
                placeholder="Opcional"
                disabled={!canMutate}
              />
              <FormFieldError message={state.fieldErrors?.ean} />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Marca
              <input
                name="brand"
                defaultValue={valueOrFallback(stateValues?.brand, product?.brand ?? "") ?? ""}
                className="form-input"
                placeholder="Ej: Caprimo"
                disabled={!canMutate}
              />
              <FormFieldError message={state.fieldErrors?.brand} />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Categoria *
              <select
                name="categoryId"
                defaultValue={defaultCategoryId}
                className="form-input"
                disabled={!canMutate}
              >
                <option value="">Selecciona una categoria</option>
                {parentCategories.map((parent) => (
                  <optgroup
                    key={parent.id}
                    label={`${parent.name}${!parent.isActive ? " (inactiva)" : ""}`}
                  >
                    <option value={parent.id}>
                      {parent.name}
                      {!parent.isActive ? " (inactiva)" : ""}
                    </option>
                    {categories
                      .filter((category) => category.parentId === parent.id)
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {getCategoryLabel(category, categories)}
                          {!category.isActive ? " (inactiva)" : ""}
                        </option>
                      ))}
                  </optgroup>
                ))}
                {orphanChildren.map((category) => (
                  <option key={category.id} value={category.id}>
                    {getCategoryLabel(category, categories)}
                    {!category.isActive ? " (inactiva)" : ""}
                  </option>
                ))}
              </select>
              <FormFieldError message={state.fieldErrors?.categoryId} />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold">
            Descripcion corta
            <textarea
              name="shortDescription"
              defaultValue={valueOrFallback(
                stateValues?.shortDescription,
                product?.shortDescription ?? ""
              )}
              className="form-input min-h-28"
              placeholder="Resumen comercial visible en tarjetas y SEO."
              disabled={!canMutate}
            />
            <FormFieldError message={state.fieldErrors?.shortDescription} />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Descripcion larga
            <textarea
              name="longDescription"
              defaultValue={valueOrFallback(
                stateValues?.longDescription,
                product?.longDescription ?? ""
              )}
              className="form-input min-h-36"
              placeholder="Detalle del producto. Puedes dejar placeholders pendientes si falta informacion real."
              disabled={!canMutate}
            />
            <FormFieldError message={state.fieldErrors?.longDescription} />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Precio neto CLP
              <input
                name="netPriceClp"
                type="number"
                min="0"
                step="1"
                defaultValue={valueOrFallback(
                  stateValues?.netPriceClp,
                  product?.netPriceClp ?? 0
                )}
                className="form-input"
                disabled={!canMutate}
              />
              <FormFieldError message={state.fieldErrors?.netPriceClp} />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Precio bruto CLP
              <input
                name="grossPriceClp"
                type="number"
                min="0"
                step="1"
                defaultValue={valueOrFallback(
                  stateValues?.grossPriceClp,
                  product?.grossPriceClp ?? product?.priceClpTaxInc ?? 0
                )}
                className="form-input"
                disabled={!canMutate}
              />
              <FormFieldError message={state.fieldErrors?.grossPriceClp} />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-2 text-sm font-semibold">
              Disponibilidad
              <select
                name="availabilityStatus"
                defaultValue={defaultStatus}
                className="form-input"
                disabled={!canMutate}
              >
                {ADMIN_PRODUCT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {availabilityStatusLabels[status]}
                  </option>
                ))}
              </select>
              <FormFieldError message={state.fieldErrors?.availabilityStatus} />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Publicacion
              <select
                name="publicationStatus"
                defaultValue={defaultPublicationStatus}
                className="form-input"
                disabled={!canMutate}
              >
                {ADMIN_PUBLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {publicationStatusLabels[status]}
                  </option>
                ))}
              </select>
              <FormFieldError message={state.fieldErrors?.publicationStatus} />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Stock
              <input
                name="stockQuantity"
                type="number"
                min="0"
                step="1"
                defaultValue={
                  stateValues?.stockQuantity ?? product?.stockQuantity ?? ""
                }
                className="form-input"
                placeholder="Opcional"
                disabled={!canMutate}
              />
              <FormFieldError message={state.fieldErrors?.stockQuantity} />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Orden
              <input
                name="sortOrder"
                type="number"
                step="1"
                defaultValue={valueOrFallback(
                  stateValues?.sortOrder,
                  product?.sortOrder ?? 0
                )}
                className="form-input"
                disabled={!canMutate}
              />
              <FormFieldError message={state.fieldErrors?.sortOrder} />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold">
            Highlights
            <textarea
              name="highlightsText"
              defaultValue={valueOrFallback(
                stateValues?.highlightsText,
                product?.highlights.join("\n") ?? ""
              )}
              className="form-input min-h-28"
              placeholder="Una caracteristica por linea"
              disabled={!canMutate}
            />
            <FormFieldError message={state.fieldErrors?.highlightsText} />
          </label>

          <label className="flex items-start gap-3 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4 text-sm font-semibold">
            <input
              name="isFeatured"
              type="checkbox"
              defaultChecked={valueOrFallback(
                stateValues?.isFeatured,
                product?.isFeatured ?? false
              )}
              className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
              disabled={!canMutate}
            />
            <span>
              Producto destacado
              <span className="mt-1 block text-xs font-normal leading-6 text-[var(--color-muted-foreground)]">
                Aparece con prioridad en listados y secciones destacadas.
              </span>
            </span>
          </label>
        </div>

        <aside className="grid content-start gap-5">
          <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-5">
            <h3 className="text-lg font-semibold">Imagen principal</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">
              Mantiene compatibilidad con rutas en public y permite subir nuevas
              imagenes a Supabase Storage.
            </p>
            <div className="mt-4">
              <ProductImageUploader
                name="primaryImagePath"
                initialValue={valueOrFallback(
                  stateValues?.primaryImagePath,
                  product?.primaryImagePath ?? ""
                )}
              />
            </div>
            <FormFieldError message={state.fieldErrors?.primaryImagePath} />
          </div>

          <label className="grid gap-2 text-sm font-semibold">
            Galeria opcional
            <textarea
              name="galleryImagesText"
              defaultValue={valueOrFallback(
                stateValues?.galleryImagesText,
                product?.galleryImages.join("\n") ?? ""
              )}
              className="form-input min-h-32"
              placeholder="Una URL o ruta por linea"
              disabled={!canMutate}
            />
          </label>

          <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-5 text-sm leading-7 text-[var(--color-muted-foreground)]">
            Si falta precio real, usa 0 temporalmente y deja el producto como
            borrador en publicacion o agotado hasta reemplazar el dato.
          </div>
        </aside>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className="button-secondary px-6 py-3 text-sm">
          Cancelar
        </Link>
        <SubmitButton disabled={!canMutate} />
      </div>
    </form>
  );
}
