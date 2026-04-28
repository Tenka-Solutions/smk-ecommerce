export type AdminProductVisibilityStatus =
  | "visible"
  | "not_published"
  | "draft"
  | "archived"
  | "no_price"
  | "category_inactive"
  | "missing_category";

export interface AdminProductVisibilityInput {
  categoryId?: string | null;
  categoryExists?: boolean;
  categoryIsActive?: boolean;
  categoryIsVisible?: boolean;
  publicationStatus?: string | null;
  grossPriceClp?: number | null;
  priceClpTaxInc?: number | null;
}

export interface AdminProductVisibilityInfo {
  status: AdminProductVisibilityStatus;
  isVisible: boolean;
  label: string;
  description: string;
  badgeStatus: string;
}

export function getAdminProductVisibilityInfo(
  product: AdminProductVisibilityInput
): AdminProductVisibilityInfo {
  const publicationStatus = product.publicationStatus ?? "draft";
  const publicPrice = product.grossPriceClp ?? product.priceClpTaxInc ?? 0;
  const hasCategory = Boolean(product.categoryId?.trim()) && product.categoryExists !== false;
  const categoryIsPublic =
    product.categoryIsActive !== false && product.categoryIsVisible !== false;

  if (publicationStatus === "archived") {
    return {
      status: "archived",
      isVisible: false,
      label: "Archivado",
      description: "No aparece porque esta archivado.",
      badgeStatus: "store_archived",
    };
  }

  if (publicationStatus === "draft") {
    return {
      status: "draft",
      isVisible: false,
      label: "Borrador",
      description: "No aparece porque no esta publicado.",
      badgeStatus: "store_draft",
    };
  }

  if (publicationStatus !== "published") {
    return {
      status: "not_published",
      isVisible: false,
      label: "No visible en tienda",
      description: "No aparece porque no esta publicado.",
      badgeStatus: "store_hidden",
    };
  }

  if (!hasCategory) {
    return {
      status: "missing_category",
      isVisible: false,
      label: "Falta categoria",
      description: "No aparece porque falta una categoria valida.",
      badgeStatus: "missing_category",
    };
  }

  if (!categoryIsPublic) {
    return {
      status: "category_inactive",
      isVisible: false,
      label: "Categoria inactiva",
      description: "No aparece porque la categoria esta inactiva.",
      badgeStatus: "category_inactive",
    };
  }

  if (publicPrice <= 0) {
    return {
      status: "no_price",
      isVisible: false,
      label: "Sin precio publico",
      description: "No aparece porque el precio bruto debe ser mayor a 0.",
      badgeStatus: "no_price",
    };
  }

  return {
    status: "visible",
    isVisible: true,
    label: "Visible en tienda",
    description: "Cumple las reglas publicas y aparece en la tienda.",
    badgeStatus: "store_visible",
  };
}
