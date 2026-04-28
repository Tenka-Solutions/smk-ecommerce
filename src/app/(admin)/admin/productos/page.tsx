import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { EmptyState } from "@/components/feedback/EmptyState";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { formatClp } from "@/lib/format/currency";
import {
  ADMIN_PRODUCT_STATUSES,
  ADMIN_PUBLICATION_STATUSES,
} from "@/modules/catalog/admin-schema";
import type {
  AdminProductStatus,
  AdminPublicationStatus,
} from "@/modules/catalog/admin-schema";
import { getAdminProductsPageData } from "@/modules/catalog/admin";
import type {
  AdminCatalogCategory,
  AdminCatalogProduct,
} from "@/modules/catalog/admin";
import { hideProductAction } from "@/app/(admin)/admin/productos/actions";

type SearchParams = Promise<{
  q?: string;
  categoria?: string;
  categoriaPadre?: string;
  subcategoria?: string;
  estadoProducto?: string;
  estadoDisponibilidad?: string;
  estadoPublicacion?: string;
  editar?: string;
  nuevo?: string;
  estado?: string;
}>;

const pageMessages: Record<string, { tone: "success" | "danger"; text: string }> =
  {
    guardado: {
      tone: "success",
      text: "Producto guardado. Si quedo publicado, ya puede aparecer en la tienda.",
    },
    oculto: {
      tone: "success",
      text: "Producto ocultado sin borrarlo fisicamente.",
    },
    error: {
      tone: "danger",
      text: "No pudimos completar la accion. Revisa permisos y configuracion de Supabase.",
    },
  };

function toProductStatus(value?: string): AdminProductStatus | undefined {
  return ADMIN_PRODUCT_STATUSES.includes(value as AdminProductStatus)
    ? (value as AdminProductStatus)
    : undefined;
}

function toPublicationStatus(value?: string): AdminPublicationStatus | undefined {
  return ADMIN_PUBLICATION_STATUSES.includes(value as AdminPublicationStatus)
    ? (value as AdminPublicationStatus)
    : undefined;
}

function buildProductsHref(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  return `/admin/productos${query.size ? `?${query.toString()}` : ""}`;
}

function getCategoryPath(product: AdminCatalogProduct) {
  return product.categoryParentName
    ? `${product.categoryParentName} / ${product.categoryName}`
    : product.categoryName;
}

function getCategoryOptionLabel(
  category: AdminCatalogCategory,
  categories: AdminCatalogCategory[]
) {
  if (!category.parentId) {
    return category.name;
  }

  const parent = categories.find((entry) => entry.id === category.parentId);
  return parent ? `${parent.name} / ${category.name}` : category.name;
}

function ProductAdminCard({
  product,
  canMutate,
}: {
  product: AdminCatalogProduct;
  canMutate: boolean;
}) {
  return (
    <article className="grid gap-4 rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-card)] p-4 md:grid-cols-[96px_minmax(0,1fr)_auto] md:items-center">
      <div className="overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)]">
        {product.primaryImagePath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.primaryImagePath}
            alt={product.name}
            className="h-24 w-full object-contain p-3"
          />
        ) : (
          <div className="flex h-24 items-center justify-center px-3 text-center text-xs text-[var(--color-muted-foreground)]">
            Sin imagen
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-lg font-semibold text-[var(--color-ink)]">
            {product.name}
          </h3>
          {product.isFeatured ? <StatusBadge status="published" /> : null}
        </div>

        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {getCategoryPath(product)}
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
          SKU {product.sku ?? "sin SKU"} · EAN {product.ean ?? "sin EAN"} ·
          Marca {product.brand ?? "sin marca"}
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-muted-foreground)]">
          {product.shortDescription || "Sin descripcion corta"}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge status={product.availabilityStatus} />
          <StatusBadge status={product.publicationStatus} />
          {product.stockQuantity !== null ? (
            <span className="inline-flex items-center rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-muted-foreground)]">
              Stock {product.stockQuantity}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 md:min-w-44 md:justify-items-end">
        <div className="text-left md:text-right">
          <p className="text-lg font-semibold text-[var(--color-price)]">
            {formatClp(product.grossPriceClp)}
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Neto {formatClp(product.netPriceClp)} · Orden {product.sortOrder}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          <Link
            href={buildProductsHref({ editar: product.id })}
            className="button-secondary px-4 py-2 text-xs"
          >
            Editar
          </Link>

          <form action={hideProductAction}>
            <input type="hidden" name="productId" value={product.id} />
            <button
              type="submit"
              disabled={!canMutate || product.availabilityStatus === "hidden"}
              className="button-secondary px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ocultar
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const selectedParentCategory = params.categoriaPadre;
  const selectedSubcategory = params.subcategoria ?? params.categoria;
  const filters = {
    query: params.q,
    parentCategoryId: selectedParentCategory,
    categoryId: selectedSubcategory,
    availabilityStatus: toProductStatus(
      params.estadoDisponibilidad ?? params.estadoProducto
    ),
    publicationStatus: toPublicationStatus(params.estadoPublicacion),
  };
  const pageData = await getAdminProductsPageData(filters);
  const allProductsData =
    params.editar &&
    !pageData.products.some((product) => product.id === params.editar)
      ? await getAdminProductsPageData()
      : pageData;
  const editingProduct = params.editar
    ? allProductsData.products.find((product) => product.id === params.editar) ??
      null
    : null;
  const shouldShowForm = Boolean(params.nuevo || editingProduct);
  const message = params.estado ? pageMessages[params.estado] : null;
  const parentCategories = pageData.categories.filter(
    (category) => !category.parentId
  );
  const subcategories = pageData.categories.filter((category) => {
    if (!category.parentId) {
      return false;
    }

    return selectedParentCategory
      ? category.parentId === selectedParentCategory
      : true;
  });

  return (
    <div className="grid gap-6">
      <section className="panel-card overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="section-kicker">Catalogo</p>
            <h1 className="mt-3 text-4xl font-semibold">Productos</h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--color-muted-foreground)]">
              Fuente activa:{" "}
              <strong>
                {pageData.source === "supabase" ? "Supabase" : "Seed local"}
              </strong>
              . Desde aqui el cliente puede crear, editar y ocultar productos
              sin tocar codigo.
            </p>
          </div>

          <Link
            href={buildProductsHref({ nuevo: "1" })}
            className="button-primary px-6 py-3 text-sm"
          >
            Crear producto
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.25rem] bg-[var(--color-surface-strong)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
              Total
            </p>
            <p className="mt-2 text-2xl font-semibold">{pageData.totalProducts}</p>
          </div>
          <div className="rounded-[1.25rem] bg-[var(--color-surface-strong)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
              Vista actual
            </p>
            <p className="mt-2 text-2xl font-semibold">{pageData.products.length}</p>
          </div>
          <div className="rounded-[1.25rem] bg-[var(--color-surface-strong)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
              Permisos
            </p>
            <p className="mt-2 text-sm font-semibold">
              {pageData.canMutate ? "Edicion habilitada" : "Solo lectura"}
            </p>
          </div>
        </div>
      </section>

      {message ? (
        <div
          className={`rounded-[1.5rem] border p-4 text-sm font-medium ${
            message.tone === "success"
              ? "border-[color-mix(in_srgb,var(--color-success)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,var(--color-card)_90%)] text-[var(--color-success)]"
              : "border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,var(--color-card)_90%)] text-[var(--color-danger)]"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      {pageData.warning ? (
        <div className="rounded-[1.5rem] border border-[color-mix(in_srgb,var(--color-warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,var(--color-card)_90%)] p-4 text-sm leading-7 text-[var(--color-warning)]">
          {pageData.warning}
        </div>
      ) : null}

      {shouldShowForm ? (
        <ProductForm
          key={editingProduct?.id ?? "new-product"}
          categories={allProductsData.categories}
          product={editingProduct}
          canMutate={pageData.canMutate}
          cancelHref="/admin/productos"
        />
      ) : null}

      <section className="panel-card rounded-[2rem] p-5 sm:p-6">
        <form className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px_220px_190px_190px_auto_auto] xl:items-end">
          <label className="grid gap-2 text-sm font-semibold">
            Buscar por nombre, SKU, marca o EAN
            <input
              name="q"
              defaultValue={params.q ?? ""}
              className="form-input"
              placeholder="Ej: Caprimo, REG-10100100, 304393"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Categoria padre
            <select
              name="categoriaPadre"
              defaultValue={selectedParentCategory ?? ""}
              className="form-input"
            >
              <option value="">Todas</option>
              {parentCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {!category.isActive ? " (inactiva)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Subcategoria
            <select
              name="subcategoria"
              defaultValue={selectedSubcategory ?? ""}
              className="form-input"
            >
              <option value="">Todas</option>
              {subcategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {getCategoryOptionLabel(category, pageData.categories)}
                  {!category.isActive ? " (inactiva)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Disponibilidad
            <select
              name="estadoDisponibilidad"
              defaultValue={params.estadoDisponibilidad ?? params.estadoProducto ?? ""}
              className="form-input"
            >
              <option value="">Todos</option>
              <option value="available">Disponible</option>
              <option value="check_availability">Consultar</option>
              <option value="sold_out">Agotado</option>
              <option value="draft">Borrador</option>
              <option value="hidden">Oculto</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Publicacion
            <select
              name="estadoPublicacion"
              defaultValue={params.estadoPublicacion ?? ""}
              className="form-input"
            >
              <option value="">Todas</option>
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </label>

          <button type="submit" className="button-primary px-6 py-3 text-sm">
            Filtrar
          </button>

          <Link href="/admin/productos" className="button-secondary px-6 py-3 text-sm">
            Limpiar
          </Link>
        </form>
      </section>

      <section className="grid gap-3">
        {pageData.products.length > 0 ? (
          pageData.products.map((product) => (
            <ProductAdminCard
              key={product.id}
              product={product}
              canMutate={pageData.canMutate}
            />
          ))
        ) : (
          <EmptyState
            title="No encontramos productos"
            description="Ajusta la busqueda o crea un producto nuevo para comenzar a administrarlo desde Supabase."
            actionHref="/admin/productos?nuevo=1"
            actionLabel="Crear producto"
          />
        )}
      </section>
    </div>
  );
}
