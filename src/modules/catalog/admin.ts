import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  ADMIN_PRODUCT_STATUSES,
  AdminProductStatus,
  AdminPublicationStatus,
  CategoryFormFieldErrors,
  CategoryFormValues,
  ProductFormFieldErrors,
  ProductFormValues,
  isPlaceholderSku,
} from "@/modules/catalog/admin-schema";
import { getAuthenticatedUserRoles } from "@/modules/auth/server";
import { getAdminProductVisibilityInfo } from "@/modules/catalog/admin-visibility";
import { getAdminCatalogSnapshot } from "@/modules/catalog/repository";
import {
  CatalogCategory,
  CatalogProduct,
  PublicationStatus,
} from "@/modules/catalog/types";

const MUTATION_ROLES = ["super_admin", "catalog_editor"];
const READ_ROLES = [...MUTATION_ROLES, "sales_manager"];

export class CatalogAdminError extends Error {
  constructor(
    message: string,
    public readonly field?:
      | keyof ProductFormFieldErrors
      | keyof CategoryFormFieldErrors
      | string
  ) {
    super(message);
    this.name = "CatalogAdminError";
  }
}

export interface AdminCatalogCategory {
  id: string;
  parentId: string | null;
  parentName: string | null;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  isVisible: boolean;
  productCount: number;
  descendantProductCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminCatalogProduct {
  id: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  categoryExists: boolean;
  categoryParentId: string | null;
  categoryParentName: string | null;
  categoryIsActive: boolean;
  categoryIsVisible: boolean;
  publicVisibility: ReturnType<typeof getAdminProductVisibilityInfo>;
  name: string;
  slug: string;
  sku: string | null;
  ean: string | null;
  shortDescription: string;
  longDescription: string;
  netPriceClp: number;
  grossPriceClp: number;
  priceClpTaxInc: number;
  primaryImagePath: string;
  galleryImages: string[];
  availabilityStatus: AdminProductStatus;
  publicationStatus: PublicationStatus;
  isFeatured: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  highlights: string[];
  brand: string | null;
  stockQuantity: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminCatalogPageData {
  source: "supabase" | "seed";
  categories: AdminCatalogCategory[];
  products: AdminCatalogProduct[];
  totalProducts: number;
  canMutate: boolean;
  warning?: string;
}

export interface AdminCategoriesPageData {
  source: "supabase" | "seed";
  categories: AdminCatalogCategory[];
  totalCategories: number;
  totalProducts: number;
  canMutate: boolean;
  warning?: string;
}

export interface AdminProductFilters {
  query?: string;
  categoryId?: string;
  parentCategoryId?: string;
  status?: AdminProductStatus;
  availabilityStatus?: AdminProductStatus;
  publicationStatus?: AdminPublicationStatus;
}

function hasAnyRole(roles: string[], allowedRoles: string[]) {
  return roles.some((role) => allowedRoles.includes(role));
}

async function getReadContext() {
  const roles = await getAuthenticatedUserRoles();

  if (!hasAnyRole(roles, READ_ROLES)) {
    throw new CatalogAdminError("No tienes permisos para ver catalogo.");
  }

  return {
    roles,
    canMutate: hasAnyRole(roles, MUTATION_ROLES),
  };
}

async function getMutationClient() {
  const roles = await getAuthenticatedUserRoles();

  if (!hasAnyRole(roles, MUTATION_ROLES)) {
    throw new CatalogAdminError(
      "Solo super administradores o editores de catalogo pueden modificar el catalogo."
    );
  }

  const client = createSupabaseAdminClient();

  if (!client) {
    throw new CatalogAdminError(
      "Supabase admin no esta configurado. Revisa SUPABASE_SERVICE_ROLE_KEY en el entorno servidor."
    );
  }

  return client;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function toAdminStatus(value: string | null | undefined): AdminProductStatus {
  return ADMIN_PRODUCT_STATUSES.includes(value as AdminProductStatus)
    ? (value as AdminProductStatus)
    : "available";
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (entry): entry is string =>
      typeof entry === "string" && entry.trim().length > 0
  );
}

function mapCategory(row: Record<string, unknown>): AdminCatalogCategory {
  return {
    id: String(row.id),
    parentId: typeof row.parent_id === "string" ? row.parent_id : null,
    parentName: null,
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    description: String(row.description ?? ""),
    imageUrl: typeof row.image_url === "string" ? row.image_url : null,
    sortOrder: Number(row.sort_order ?? 0),
    isActive: Boolean(row.is_active ?? row.is_visible ?? true),
    isVisible: Boolean(row.is_visible ?? row.is_active ?? true),
    productCount: 0,
    descendantProductCount: 0,
    createdAt: typeof row.created_at === "string" ? row.created_at : null,
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : null,
  };
}

function mapSeedCategory(category: CatalogCategory): AdminCatalogCategory {
  return {
    id: category.id,
    parentId: category.parentId ?? null,
    parentName: null,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl ?? null,
    sortOrder: category.sortOrder,
    isActive: category.isActive ?? category.isVisible,
    isVisible: category.isVisible,
    productCount: 0,
    descendantProductCount: 0,
    createdAt: null,
    updatedAt: null,
  };
}

function mapProduct(
  row: Record<string, unknown>,
  categories: AdminCatalogCategory[]
): AdminCatalogProduct {
  const category = categories.find((entry) => entry.id === row.category_id);
  const parentCategory = category?.parentId
    ? categories.find((entry) => entry.id === category.parentId)
    : null;
  const grossPrice = Number(
    row.gross_price_clp ?? row.price_clp_tax_inc ?? 0
  );
  const netPrice = Number(
    row.net_price_clp ?? Math.round(grossPrice / 1.19)
  );
  const primaryImagePath =
    typeof row.primary_image_path === "string" ? row.primary_image_path : "";

  const mappedProduct = {
    id: String(row.id),
    categoryId: String(row.category_id ?? ""),
    categorySlug: category?.slug ?? "",
    categoryName: category?.name ?? "Sin categoria",
    categoryExists: Boolean(category),
    categoryParentId: category?.parentId ?? null,
    categoryParentName: parentCategory?.name ?? null,
    categoryIsActive: category?.isActive ?? false,
    categoryIsVisible: category?.isVisible ?? false,
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    sku: typeof row.sku === "string" && row.sku.trim() ? row.sku : null,
    ean: typeof row.ean === "string" && row.ean.trim() ? row.ean : null,
    shortDescription: String(row.short_description ?? ""),
    longDescription: String(row.long_description ?? ""),
    netPriceClp: netPrice,
    grossPriceClp: grossPrice,
    priceClpTaxInc: Number(row.price_clp_tax_inc ?? grossPrice),
    primaryImagePath,
    galleryImages: toStringArray(row.gallery_images),
    availabilityStatus: toAdminStatus(row.availability_status as string),
    publicationStatus: (row.publication_status ?? "draft") as PublicationStatus,
    isFeatured: Boolean(row.is_featured ?? false),
    sortOrder: Number(row.sort_order ?? 0),
    seoTitle: String(row.seo_title ?? row.name ?? ""),
    seoDescription: String(row.seo_description ?? row.short_description ?? ""),
    highlights: toStringArray(row.highlights),
    brand: typeof row.brand === "string" && row.brand.trim() ? row.brand : null,
    stockQuantity:
      row.stock_quantity === null || row.stock_quantity === undefined
        ? null
        : Number(row.stock_quantity),
    createdAt: typeof row.created_at === "string" ? row.created_at : null,
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : null,
  } satisfies Omit<AdminCatalogProduct, "publicVisibility">;

  return {
    ...mappedProduct,
    publicVisibility: getAdminProductVisibilityInfo(mappedProduct),
  };
}

function mapSeedProduct(
  product: CatalogProduct,
  categories: AdminCatalogCategory[]
): AdminCatalogProduct {
  const category = categories.find((entry) => entry.slug === product.categorySlug);
  const parentCategory = category?.parentId
    ? categories.find((entry) => entry.id === category.parentId)
    : null;
  const grossPrice = product.grossPriceClp ?? product.priceClpTaxInc;
  const netPrice = product.netPriceClp ?? Math.round(grossPrice / 1.19);

  const mappedProduct = {
    id: product.id,
    categoryId: category?.id ?? product.categoryId ?? "",
    categorySlug: product.categorySlug,
    categoryName: category?.name ?? product.categorySlug,
    categoryExists: Boolean(category),
    categoryParentId: category?.parentId ?? null,
    categoryParentName: parentCategory?.name ?? null,
    categoryIsActive: category?.isActive ?? true,
    categoryIsVisible: category?.isVisible ?? true,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    ean: product.ean ?? null,
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    netPriceClp: netPrice,
    grossPriceClp: grossPrice,
    priceClpTaxInc: product.priceClpTaxInc,
    primaryImagePath: product.image,
    galleryImages: product.gallery.filter((image) => image !== product.image),
    availabilityStatus: toAdminStatus(product.availabilityStatus),
    publicationStatus: product.publicationStatus,
    isFeatured: product.isFeatured,
    sortOrder: product.sortOrder,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    highlights: product.highlights,
    brand: product.brand ?? null,
    stockQuantity: product.stockQuantity ?? null,
    createdAt: null,
    updatedAt: null,
  } satisfies Omit<AdminCatalogProduct, "publicVisibility">;

  return {
    ...mappedProduct,
    publicVisibility: getAdminProductVisibilityInfo(mappedProduct),
  };
}

function attachCategoryMetadata(
  categories: AdminCatalogCategory[],
  products: AdminCatalogProduct[]
) {
  const directCounts = new Map<string, number>();
  const descendantCounts = new Map<string, number>();

  for (const product of products) {
    directCounts.set(
      product.categoryId,
      (directCounts.get(product.categoryId) ?? 0) + 1
    );

    if (product.categoryParentId) {
      descendantCounts.set(
        product.categoryParentId,
        (descendantCounts.get(product.categoryParentId) ?? 0) + 1
      );
    }
  }

  return categories.map((category) => {
    const parent = category.parentId
      ? categories.find((entry) => entry.id === category.parentId)
      : null;

    return {
      ...category,
      parentName: parent?.name ?? null,
      productCount: directCounts.get(category.id) ?? 0,
      descendantProductCount: descendantCounts.get(category.id) ?? 0,
    };
  });
}

export function getCategoryDisplayName(
  category: AdminCatalogCategory,
  categories: AdminCatalogCategory[]
) {
  if (!category.parentId) {
    return category.name;
  }

  const parent = categories.find((entry) => entry.id === category.parentId);
  return parent ? `${parent.name} / ${category.name}` : category.name;
}

function applyFilters(
  products: AdminCatalogProduct[],
  filters: AdminProductFilters
) {
  let filtered = [...products];

  if (filters.query?.trim()) {
    const query = normalizeText(filters.query);
    filtered = filtered.filter((product) =>
      normalizeText(
        [
          product.name,
          product.sku ?? "",
          product.ean ?? "",
          product.brand ?? "",
          product.categoryName,
          product.categoryParentName ?? "",
          product.shortDescription,
        ].join(" ")
      ).includes(query)
    );
  }

  if (filters.parentCategoryId?.trim()) {
    filtered = filtered.filter(
      (product) =>
        product.categoryId === filters.parentCategoryId ||
        product.categoryParentId === filters.parentCategoryId
    );
  }

  if (filters.categoryId?.trim()) {
    filtered = filtered.filter(
      (product) => product.categoryId === filters.categoryId
    );
  }

  const availabilityStatus = filters.availabilityStatus ?? filters.status;

  if (availabilityStatus) {
    filtered = filtered.filter(
      (product) => product.availabilityStatus === availabilityStatus
    );
  }

  if (filters.publicationStatus) {
    filtered = filtered.filter(
      (product) => product.publicationStatus === filters.publicationStatus
    );
  }

  return filtered.sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.name.localeCompare(right.name, "es");
  });
}

async function getFallbackCatalogPageData(
  filters: AdminProductFilters,
  canMutate: boolean,
  warning: string
): Promise<AdminCatalogPageData> {
  const snapshot = await getAdminCatalogSnapshot();
  const categories = snapshot.categories.map(mapSeedCategory);
  const products = snapshot.products.map((product) =>
    mapSeedProduct(product, categories)
  );
  const categoriesWithMetadata = attachCategoryMetadata(categories, products);

  return {
    source: "seed",
    categories: categoriesWithMetadata,
    products: applyFilters(products, filters),
    totalProducts: products.length,
    canMutate,
    warning,
  };
}

export async function getAdminProductsPageData(
  filters: AdminProductFilters = {}
): Promise<AdminCatalogPageData> {
  const { canMutate } = await getReadContext();
  const client = createSupabaseAdminClient();

  if (!client) {
    return getFallbackCatalogPageData(
      filters,
      canMutate,
      "Supabase admin no esta configurado; se muestra el seed local en modo lectura."
    );
  }

  const [categoriesResponse, productsResponse] = await Promise.all([
    client
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true }),
    client
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  if (categoriesResponse.error || productsResponse.error) {
    return getFallbackCatalogPageData(
      filters,
      canMutate,
      categoriesResponse.error?.message ??
        productsResponse.error?.message ??
        "No fue posible leer Supabase; se muestra el seed local."
    );
  }

  const categories = (categoriesResponse.data ?? []).map((category) =>
    mapCategory(category)
  );
  const products = (productsResponse.data ?? []).map((product) =>
    mapProduct(product, categories)
  );
  const categoriesWithMetadata = attachCategoryMetadata(categories, products);

  return {
    source: "supabase",
    categories: categoriesWithMetadata,
    products: applyFilters(products, filters),
    totalProducts: products.length,
    canMutate,
  };
}

export async function getAdminCategoriesPageData(): Promise<AdminCategoriesPageData> {
  const { canMutate } = await getReadContext();
  const client = createSupabaseAdminClient();

  if (!client) {
    const snapshot = await getAdminCatalogSnapshot();
    const categories = snapshot.categories.map(mapSeedCategory);
    const products = snapshot.products.map((product) =>
      mapSeedProduct(product, categories)
    );

    return {
      source: "seed",
      categories: attachCategoryMetadata(categories, products),
      totalCategories: categories.length,
      totalProducts: products.length,
      canMutate,
      warning:
        "Supabase admin no esta configurado; se muestra el seed local en modo lectura.",
    };
  }

  const [categoriesResponse, productsResponse] = await Promise.all([
    client
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true }),
    client.from("products").select("*").order("sort_order", { ascending: true }),
  ]);

  if (categoriesResponse.error || productsResponse.error) {
    const snapshot = await getAdminCatalogSnapshot();
    const categories = snapshot.categories.map(mapSeedCategory);
    const products = snapshot.products.map((product) =>
      mapSeedProduct(product, categories)
    );

    return {
      source: "seed",
      categories: attachCategoryMetadata(categories, products),
      totalCategories: categories.length,
      totalProducts: products.length,
      canMutate,
      warning:
        categoriesResponse.error?.message ??
        productsResponse.error?.message ??
        "No fue posible leer Supabase; se muestra el seed local.",
    };
  }

  const categories = (categoriesResponse.data ?? []).map((category) =>
    mapCategory(category)
  );
  const products = (productsResponse.data ?? []).map((product) =>
    mapProduct(product, categories)
  );

  return {
    source: "supabase",
    categories: attachCategoryMetadata(categories, products),
    totalCategories: categories.length,
    totalProducts: products.length,
    canMutate,
  };
}

export async function getAdminProductById(productId: string) {
  if (!productId) {
    return null;
  }

  const { products } = await getAdminProductsPageData();
  return products.find((product) => product.id === productId) ?? null;
}

async function ensureUniqueProductValue({
  field,
  value,
  productId,
  label,
}: {
  field: "slug" | "sku";
  value: string;
  productId?: string;
  label: string;
}) {
  const client = await getMutationClient();
  let query = client.from("products").select("id").eq(field, value).limit(1);

  if (productId) {
    query = query.neq("id", productId);
  }

  const { data, error } = await query;

  if (error) {
    throw new CatalogAdminError(
      `No pudimos validar el ${label}. Intenta nuevamente.`,
      field
    );
  }

  if ((data ?? []).length > 0) {
    throw new CatalogAdminError(`Ya existe un producto con este ${label}.`, field);
  }
}

async function ensureUniqueCategorySlug({
  value,
  categoryId,
}: {
  value: string;
  categoryId?: string;
}) {
  const client = await getMutationClient();
  let query = client.from("categories").select("id").eq("slug", value).limit(1);

  if (categoryId) {
    query = query.neq("id", categoryId);
  }

  const { data, error } = await query;

  if (error) {
    throw new CatalogAdminError(
      "No pudimos validar el slug. Intenta nuevamente.",
      "slug"
    );
  }

  if ((data ?? []).length > 0) {
    throw new CatalogAdminError(
      "Ya existe una categoria con este slug.",
      "slug"
    );
  }
}

async function syncProductImages(
  productId: string,
  productName: string,
  primaryImagePath: string,
  galleryImages: string[]
) {
  const client = await getMutationClient();
  const imagePaths = Array.from(
    new Set([primaryImagePath, ...galleryImages].filter(Boolean))
  );

  await client.from("product_images").delete().eq("product_id", productId);

  if (imagePaths.length === 0) {
    return;
  }

  await client.from("product_images").insert(
    imagePaths.map((storagePath, index) => ({
      product_id: productId,
      storage_path: storagePath,
      alt_text: productName,
      sort_order: index,
      is_primary: index === 0,
    }))
  );
}

export async function saveAdminCategory(input: CategoryFormValues) {
  const client = await getMutationClient();
  const categoryId = input.categoryId || `cat-${input.slug}`;

  await ensureUniqueCategorySlug({
    value: input.slug,
    categoryId: input.categoryId,
  });

  if (!input.categoryId) {
    const { data: existingId, error: existingIdError } = await client
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .limit(1);

    if (existingIdError) {
      throw new CatalogAdminError(
        "No pudimos validar la categoria. Intenta nuevamente."
      );
    }

    if ((existingId ?? []).length > 0) {
      throw new CatalogAdminError(
        "Ya existe una categoria con este identificador.",
        "slug"
      );
    }
  }

  if (input.parentId) {
    if (input.parentId === categoryId) {
      throw new CatalogAdminError(
        "Una categoria no puede ser padre de si misma.",
        "parentId"
      );
    }

    const { data: parent, error: parentError } = await client
      .from("categories")
      .select("id")
      .eq("id", input.parentId)
      .maybeSingle();

    if (parentError || !parent) {
      throw new CatalogAdminError(
        "La categoria padre seleccionada no existe.",
        "parentId"
      );
    }
  }

  const payload = {
    name: input.name,
    slug: input.slug,
    description: input.description,
    parent_id: input.parentId,
    sort_order: input.sortOrder,
    image_url: input.imageUrl,
    is_active: input.isActive,
    is_visible: input.isActive,
    seo_title: `${input.name} | SMK Vending`,
    seo_description: input.description || input.name,
  };
  const response = input.categoryId
    ? await client.from("categories").update(payload).eq("id", input.categoryId)
    : await client.from("categories").insert({ id: categoryId, ...payload });

  if (response.error) {
    throw new CatalogAdminError(
      response.error.message || "No fue posible guardar la categoria."
    );
  }

  return {
    id: categoryId,
    slug: input.slug,
  };
}

export async function setAdminCategoryActive(categoryId: string, isActive: boolean) {
  const client = await getMutationClient();
  const { data: category, error: categoryError } = await client
    .from("categories")
    .select("id, slug")
    .eq("id", categoryId)
    .maybeSingle();

  if (categoryError || !category) {
    throw new CatalogAdminError("La categoria no existe o ya no esta disponible.");
  }

  const { error } = await client
    .from("categories")
    .update({
      is_active: isActive,
      is_visible: isActive,
    })
    .eq("id", categoryId);

  if (error) {
    throw new CatalogAdminError(
      error.message || "No fue posible actualizar la categoria."
    );
  }

  return {
    id: String(category.id),
    slug: String(category.slug ?? ""),
  };
}

export async function saveAdminProduct(input: ProductFormValues) {
  const client = await getMutationClient();
  const { data: category, error: categoryError } = await client
    .from("categories")
    .select("id, slug, parent_id")
    .eq("id", input.categoryId)
    .maybeSingle();

  if (categoryError || !category) {
    throw new CatalogAdminError(
      "La categoria seleccionada no existe o no esta disponible.",
      "categoryId"
    );
  }

  await ensureUniqueProductValue({
    field: "slug",
    value: input.slug,
    productId: input.productId,
    label: "slug",
  });

  if (input.sku && !isPlaceholderSku(input.sku)) {
    await ensureUniqueProductValue({
      field: "sku",
      value: input.sku,
      productId: input.productId,
      label: "SKU",
    });
  }

  const productId = input.productId || input.slug;
  const payload = {
    category_id: input.categoryId,
    name: input.name,
    slug: input.slug,
    sku: input.sku,
    ean: input.ean,
    short_description: input.shortDescription,
    long_description: input.longDescription,
    price_clp_tax_inc: input.grossPriceClp,
    gross_price_clp: input.grossPriceClp,
    net_price_clp: input.netPriceClp,
    availability_status: input.availabilityStatus,
    publication_status: input.publicationStatus,
    is_featured: input.isFeatured,
    sort_order: input.sortOrder,
    seo_title: input.seoTitle,
    seo_description: input.seoDescription,
    primary_image_path: input.primaryImagePath || null,
    gallery_images: input.galleryImages,
    highlights: input.highlights,
    brand: input.brand,
    stock_quantity: input.stockQuantity,
  };
  const response = input.productId
    ? await client.from("products").update(payload).eq("id", input.productId)
    : await client.from("products").insert({ id: productId, ...payload });

  if (response.error) {
    throw new CatalogAdminError(
      response.error.message || "No fue posible guardar el producto."
    );
  }

  await syncProductImages(
    productId,
    input.name,
    input.primaryImagePath,
    input.galleryImages
  );

  const { data: parentCategory } = category.parent_id
    ? await client
        .from("categories")
        .select("slug")
        .eq("id", category.parent_id)
        .maybeSingle()
    : { data: null };

  return {
    id: productId,
    slug: input.slug,
    categorySlug: String(category.slug ?? ""),
    parentCategorySlug:
      parentCategory?.slug ? String(parentCategory.slug) : undefined,
  };
}

export async function hideAdminProduct(productId: string) {
  const client = await getMutationClient();
  const { data: product, error: productError } = await client
    .from("products")
    .select("id, slug, category_id")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !product) {
    throw new CatalogAdminError("El producto no existe o ya no esta disponible.");
  }

  const { error } = await client
    .from("products")
    .update({
      availability_status: "sold_out",
      publication_status: "archived" satisfies PublicationStatus,
      is_featured: false,
    })
    .eq("id", productId);

  if (error) {
    throw new CatalogAdminError(
      error.message || "No fue posible ocultar el producto."
    );
  }

  const { data: category } = product.category_id
    ? await client
        .from("categories")
        .select("slug, parent_id")
        .eq("id", product.category_id)
        .maybeSingle()
    : { data: null };
  const { data: parentCategory } = category?.parent_id
    ? await client
        .from("categories")
        .select("slug")
        .eq("id", category.parent_id)
        .maybeSingle()
    : { data: null };

  return {
    id: String(product.id),
    slug: String(product.slug ?? ""),
    categorySlug: category?.slug ? String(category.slug) : undefined,
    parentCategorySlug:
      parentCategory?.slug ? String(parentCategory.slug) : undefined,
  };
}

export async function deleteAdminProduct(productId: string) {
  const client = await getMutationClient();
  const { data: product, error: productError } = await client
    .from("products")
    .select("id, slug, category_id")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !product) {
    throw new CatalogAdminError("El producto no existe o ya no esta disponible.");
  }

  const { count: orderCount, error: orderCountError } = await client
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  if (orderCountError) {
    throw new CatalogAdminError(
      "No pudimos validar si el producto tiene ventas asociadas. Intenta nuevamente."
    );
  }

  if ((orderCount ?? 0) > 0) {
    throw new CatalogAdminError(
      "No puedes eliminar este producto porque tiene pedidos asociados. Puedes archivarlo.",
      "productHasOrders"
    );
  }

  const { count: quoteCount, error: quoteCountError } = await client
    .from("quote_request_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  if (quoteCountError) {
    throw new CatalogAdminError(
      "No pudimos validar si el producto tiene cotizaciones asociadas. Intenta nuevamente."
    );
  }

  if ((quoteCount ?? 0) > 0) {
    throw new CatalogAdminError(
      "No puedes eliminar este producto porque tiene cotizaciones asociadas. Puedes archivarlo.",
      "productHasQuotes"
    );
  }

  const { data: category } = product.category_id
    ? await client
        .from("categories")
        .select("slug, parent_id")
        .eq("id", product.category_id)
        .maybeSingle()
    : { data: null };
  const { data: parentCategory } = category?.parent_id
    ? await client
        .from("categories")
        .select("slug")
        .eq("id", category.parent_id)
        .maybeSingle()
    : { data: null };
  const { error } = await client.from("products").delete().eq("id", productId);

  if (error) {
    throw new CatalogAdminError(
      "No pudimos eliminar el producto. Si tiene actividad asociada, archivalo en lugar de eliminarlo."
    );
  }

  return {
    id: String(product.id),
    slug: String(product.slug ?? ""),
    categorySlug: category?.slug ? String(category.slug) : undefined,
    parentCategorySlug:
      parentCategory?.slug ? String(parentCategory.slug) : undefined,
  };
}

export async function deleteAdminCategory(categoryId: string) {
  const client = await getMutationClient();
  const { data: category, error: categoryError } = await client
    .from("categories")
    .select("id, slug")
    .eq("id", categoryId)
    .maybeSingle();

  if (categoryError || !category) {
    throw new CatalogAdminError("La categoria no existe o ya no esta disponible.");
  }

  const { count: childCount, error: childCountError } = await client
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", categoryId);

  if (childCountError) {
    throw new CatalogAdminError(
      "No pudimos validar si la categoria tiene subcategorias. Intenta nuevamente."
    );
  }

  if ((childCount ?? 0) > 0) {
    throw new CatalogAdminError(
      "No puedes eliminar esta categoria porque tiene subcategorias. Puedes desactivarla.",
      "categoryHasChildren"
    );
  }

  const { count: productCount, error: productCountError } = await client
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (productCountError) {
    throw new CatalogAdminError(
      "No pudimos validar si la categoria tiene productos asociados. Intenta nuevamente."
    );
  }

  if ((productCount ?? 0) > 0) {
    throw new CatalogAdminError(
      "No puedes eliminar esta categoria porque tiene productos asociados. Puedes desactivarla.",
      "categoryHasProducts"
    );
  }

  const { error } = await client.from("categories").delete().eq("id", categoryId);

  if (error) {
    throw new CatalogAdminError(
      "No pudimos eliminar la categoria. Si tiene contenido asociado, desactivala en lugar de eliminarla."
    );
  }

  return {
    id: String(category.id),
    slug: String(category.slug ?? ""),
  };
}
