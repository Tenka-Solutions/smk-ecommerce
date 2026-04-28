import { z } from "zod";
import { addVat, VAT_RATE } from "@/lib/format/currency";
import {
  AvailabilityStatus,
  PublicationStatus,
} from "@/modules/catalog/types";

export const ADMIN_PRODUCT_STATUSES = [
  "available",
  "check_availability",
  "sold_out",
  "draft",
  "hidden",
] as const satisfies AvailabilityStatus[];

export type AdminProductStatus = (typeof ADMIN_PRODUCT_STATUSES)[number];

export const ADMIN_PUBLICATION_STATUSES = [
  "draft",
  "published",
  "archived",
] as const satisfies PublicationStatus[];

export type AdminPublicationStatus =
  (typeof ADMIN_PUBLICATION_STATUSES)[number];

export type ProductFormFieldErrors = Partial<
  Record<
    | "name"
    | "slug"
    | "sku"
    | "ean"
    | "categoryId"
    | "shortDescription"
    | "longDescription"
    | "netPriceClp"
    | "grossPriceClp"
    | "primaryImagePath"
    | "availabilityStatus"
    | "publicationStatus"
    | "stockQuantity"
    | "sortOrder"
    | "highlightsText"
    | "brand",
    string
  >
>;

export interface ProductFormValues {
  productId?: string;
  name: string;
  slug: string;
  sku: string | null;
  ean: string | null;
  categoryId: string;
  shortDescription: string;
  longDescription: string;
  netPriceClp: number;
  grossPriceClp: number;
  primaryImagePath: string;
  galleryImages: string[];
  galleryImagesText: string;
  availabilityStatus: AdminProductStatus;
  publicationStatus: AdminPublicationStatus;
  stockQuantity: number | null;
  sortOrder: number;
  highlights: string[];
  highlightsText: string;
  brand: string | null;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
}

export interface ProductFormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: ProductFormFieldErrors;
  values?: Partial<ProductFormValues>;
}

export type CategoryFormFieldErrors = Partial<
  Record<
    | "name"
    | "slug"
    | "description"
    | "parentId"
    | "sortOrder"
    | "imageUrl",
    string
  >
>;

export interface CategoryFormValues {
  categoryId?: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  sortOrder: number;
  imageUrl: string | null;
  isActive: boolean;
}

export interface CategoryFormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: CategoryFormFieldErrors;
  values?: Partial<CategoryFormValues>;
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function trimString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: FormDataEntryValue | null) {
  const text = trimString(value);
  return text.length > 0 ? text : null;
}

function splitLines(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function numberField(value: FormDataEntryValue | null) {
  const text = trimString(value);

  if (!text) {
    return undefined;
  }

  const parsed = Number(text);

  if (!Number.isFinite(parsed)) {
    return Number.NaN;
  }

  return parsed;
}

function publicationStatusFromAvailability(
  status: AdminProductStatus
): ProductFormValues["publicationStatus"] {
  if (status === "draft") {
    return "draft";
  }

  if (status === "hidden") {
    return "archived";
  }

  return "published";
}

const productFormSchema = z.object({
  productId: z.string().trim().optional(),
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio.")
    .regex(slugPattern, "Usa minusculas, numeros y guiones."),
  sku: z.string().trim().nullable(),
  ean: z.string().trim().nullable(),
  categoryId: z.string().trim().min(1, "Selecciona una categoria."),
  shortDescription: z.string().trim().default(""),
  longDescription: z.string().trim().default(""),
  netPriceClp: z
    .number()
    .int("El precio neto debe ser un numero entero.")
    .min(0, "El precio neto no puede ser negativo.")
    .optional(),
  grossPriceClp: z
    .number()
    .int("El precio bruto debe ser un numero entero.")
    .min(0, "El precio bruto no puede ser negativo.")
    .optional(),
  primaryImagePath: z.string().trim().default(""),
  galleryImagesText: z.string().trim().default(""),
  availabilityStatus: z.enum(ADMIN_PRODUCT_STATUSES, {
    error: "Selecciona un estado valido.",
  }),
  publicationStatus: z.enum(ADMIN_PUBLICATION_STATUSES, {
    error: "Selecciona un estado de publicacion valido.",
  }).optional(),
  stockQuantity: z
    .number()
    .int("El stock debe ser un numero entero.")
    .min(0, "El stock no puede ser negativo.")
    .optional(),
  sortOrder: z
    .number()
    .int("El orden debe ser un numero entero.")
    .default(0),
  highlightsText: z.string().trim().default(""),
  brand: z.string().trim().nullable(),
  isFeatured: z.boolean().default(false),
});

const categoryFormSchema = z.object({
  categoryId: z.string().trim().optional(),
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio.")
    .regex(slugPattern, "Usa minusculas, numeros y guiones."),
  description: z.string().trim().default(""),
  parentId: z.string().trim().nullable(),
  sortOrder: z
    .number()
    .int("El orden debe ser un numero entero.")
    .default(0),
  imageUrl: z.string().trim().nullable(),
  isActive: z.boolean().default(true),
});

function toFieldErrors(error: z.ZodError): ProductFormFieldErrors {
  return error.issues.reduce<ProductFormFieldErrors>((errors, issue) => {
    const key = issue.path[0];

    if (typeof key === "string" && !(key in errors)) {
      errors[key as keyof ProductFormFieldErrors] = issue.message;
    }

    return errors;
  }, {});
}

function toCategoryFieldErrors(error: z.ZodError): CategoryFormFieldErrors {
  return error.issues.reduce<CategoryFormFieldErrors>((errors, issue) => {
    const key = issue.path[0];

    if (typeof key === "string" && !(key in errors)) {
      errors[key as keyof CategoryFormFieldErrors] = issue.message;
    }

    return errors;
  }, {});
}

export function slugifyProductName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isPlaceholderSku(value: string | null | undefined) {
  return Boolean(value?.trim().startsWith("[PENDIENTE"));
}

export function parseProductFormData(formData: FormData) {
  const raw = {
    productId: optionalText(formData.get("productId")) ?? undefined,
    name: trimString(formData.get("name")),
    slug: trimString(formData.get("slug")),
    sku: optionalText(formData.get("sku")),
    ean: optionalText(formData.get("ean")),
    categoryId: trimString(formData.get("categoryId")),
    shortDescription: trimString(formData.get("shortDescription")),
    longDescription: trimString(formData.get("longDescription")),
    netPriceClp: numberField(formData.get("netPriceClp")),
    grossPriceClp: numberField(formData.get("grossPriceClp")),
    primaryImagePath: trimString(formData.get("primaryImagePath")),
    galleryImagesText: trimString(formData.get("galleryImagesText")),
    availabilityStatus: ADMIN_PRODUCT_STATUSES.includes(
      trimString(formData.get("availabilityStatus")) as AdminProductStatus
    )
      ? (trimString(formData.get("availabilityStatus")) as AdminProductStatus)
      : "draft",
    publicationStatus: ADMIN_PUBLICATION_STATUSES.includes(
      trimString(formData.get("publicationStatus")) as AdminPublicationStatus
    )
      ? (trimString(formData.get("publicationStatus")) as AdminPublicationStatus)
      : undefined,
    stockQuantity: numberField(formData.get("stockQuantity")),
    sortOrder: numberField(formData.get("sortOrder")) ?? 0,
    highlightsText: trimString(formData.get("highlightsText")),
    brand: optionalText(formData.get("brand")),
    isFeatured: formData.get("isFeatured") === "on",
  };
  const result = productFormSchema.safeParse(raw);

  if (!result.success) {
    return {
      success: false as const,
      fieldErrors: toFieldErrors(result.error),
      values: raw,
    };
  }

  const grossPriceClp =
    result.data.grossPriceClp ??
    (result.data.netPriceClp !== undefined
      ? addVat(result.data.netPriceClp)
      : 0);
  const netPriceClp =
    result.data.netPriceClp ?? Math.round(grossPriceClp / (1 + VAT_RATE));
  const galleryImages = splitLines(result.data.galleryImagesText).filter(
    (image) => image !== result.data.primaryImagePath
  );
  const highlights = splitLines(result.data.highlightsText);
  const publicationStatus =
    result.data.publicationStatus ??
    publicationStatusFromAvailability(result.data.availabilityStatus);
  const shortDescription = result.data.shortDescription;
  const longDescription =
    result.data.longDescription || result.data.shortDescription;

  return {
    success: true as const,
    data: {
      ...result.data,
      sku: result.data.sku || null,
      ean: result.data.ean || null,
      shortDescription,
      longDescription,
      netPriceClp,
      grossPriceClp,
      primaryImagePath: result.data.primaryImagePath,
      galleryImages,
      galleryImagesText: galleryImages.join("\n"),
      highlights,
      highlightsText: highlights.join("\n"),
      publicationStatus,
      stockQuantity: result.data.stockQuantity ?? null,
      brand: result.data.brand || null,
      seoTitle: `${result.data.name} | SMK Vending`,
      seoDescription: shortDescription || result.data.name,
    } satisfies ProductFormValues,
  };
}

export function parseCategoryFormData(formData: FormData) {
  const raw = {
    categoryId: optionalText(formData.get("categoryId")) ?? undefined,
    name: trimString(formData.get("name")),
    slug: trimString(formData.get("slug")),
    description: trimString(formData.get("description")),
    parentId: optionalText(formData.get("parentId")),
    sortOrder: numberField(formData.get("sortOrder")) ?? 0,
    imageUrl: optionalText(formData.get("imageUrl")),
    isActive: formData.get("isActive") === "on",
  };
  const result = categoryFormSchema.safeParse(raw);

  if (!result.success) {
    return {
      success: false as const,
      fieldErrors: toCategoryFieldErrors(result.error),
      values: raw,
    };
  }

  if (result.data.categoryId && result.data.parentId === result.data.categoryId) {
    return {
      success: false as const,
      fieldErrors: {
        parentId: "Una categoria no puede ser padre de si misma.",
      },
      values: result.data,
    };
  }

  return {
    success: true as const,
    data: {
      ...result.data,
      parentId: result.data.parentId || null,
      imageUrl: result.data.imageUrl || null,
    } satisfies CategoryFormValues,
  };
}
