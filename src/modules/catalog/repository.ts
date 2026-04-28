import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  CatalogCategory,
  CatalogCategorySlug,
  CatalogFilters,
  CatalogProduct,
} from "@/modules/catalog/types";
import {
  catalogSeedCategories,
  catalogSeedProducts,
} from "@/modules/catalog/seed";

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function applyFilters(products: CatalogProduct[], filters: CatalogFilters = {}) {
  let result = products.filter(
    (product) =>
      product.publicationStatus === "published" &&
      !["draft", "hidden"].includes(product.availabilityStatus)
  );

  if (filters.category) {
    result = result.filter(
      (product) => product.categorySlug === filters.category
    );
  }

  if (filters.featuredOnly) {
    result = result.filter((product) => product.isFeatured);
  }

  if (filters.query?.trim()) {
    const normalizedQuery = normalizeText(filters.query);
    result = result.filter((product) =>
      normalizeText(
        [
          product.name,
          product.shortDescription,
          product.longDescription,
          product.sku ?? "",
          product.highlights.join(" "),
        ].join(" ")
      ).includes(normalizedQuery)
    );
  }

  switch (filters.sort) {
    case "price-asc":
      result.sort((left, right) => left.priceClpTaxInc - right.priceClpTaxInc);
      break;
    case "price-desc":
      result.sort((left, right) => right.priceClpTaxInc - left.priceClpTaxInc);
      break;
    case "name":
      result.sort((left, right) => left.name.localeCompare(right.name, "es"));
      break;
    default:
      result.sort((left, right) => {
        if (left.isFeatured !== right.isFeatured) {
          return Number(right.isFeatured) - Number(left.isFeatured);
        }

        return left.sortOrder - right.sortOrder;
      });
  }

  return filters.limit ? result.slice(0, filters.limit) : result;
}

const readCatalogFromSupabase = cache(async () => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  try {
    const [categoriesResponse, productsResponse] = await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true }),
    ]);

    if (categoriesResponse.error || productsResponse.error) {
      return null;
    }

    const categories = (categoriesResponse.data ?? []).map(
      (category): CatalogCategory => ({
        id: category.id,
        parentId: category.parent_id ?? null,
        slug: category.slug,
        name: category.name,
        description: category.description ?? "",
        imageUrl: category.image_url ?? null,
        sortOrder: category.sort_order ?? 0,
        isVisible: category.is_visible ?? category.is_active ?? true,
        isActive: category.is_active ?? category.is_visible ?? true,
        seoTitle: category.seo_title ?? category.name,
        seoDescription:
          category.seo_description ?? category.description ?? category.name,
      })
    );

    const products = (productsResponse.data ?? []).map((product) => {
      const categoryFromId = categories.find(
        (category) => category.id === product.category_id
      );
      const primaryImage =
        product.primary_image_path ?? "/catalog/cutouts/image1.png";
      const galleryImages = Array.isArray(product.gallery_images)
        ? product.gallery_images.filter(Boolean)
        : [];
      const gallery = Array.from(new Set([primaryImage, ...galleryImages]));
      const grossPrice =
        product.gross_price_clp ?? product.price_clp_tax_inc ?? 0;
      const netPrice =
        product.net_price_clp ?? Math.round(grossPrice / 1.19);

      return {
        id: product.id,
        slug: product.slug,
        sku: product.sku ?? null,
        ean: product.ean ?? null,
        categoryId: product.category_id,
        categorySlug:
          product.category_slug ?? categoryFromId?.slug ?? "accesorios-vasos",
        name: product.name,
        shortDescription: product.short_description ?? "",
        longDescription: product.long_description ?? "",
        netPriceClp: netPrice,
        grossPriceClp: grossPrice,
        priceClpTaxInc: grossPrice,
        image: primaryImage,
        gallery,
        publicationStatus: product.publication_status ?? "published",
        availabilityStatus: product.availability_status ?? "available",
        isFeatured: product.is_featured ?? false,
        brand: product.brand ?? null,
        stockQuantity: product.stock_quantity ?? null,
        seoTitle: product.seo_title ?? product.name,
        seoDescription:
          product.seo_description ?? product.short_description ?? product.name,
        sortOrder: product.sort_order ?? 0,
        highlights: Array.isArray(product.highlights) ? product.highlights : [],
      } satisfies CatalogProduct;
    });

    return { categories, products };
  } catch {
    return null;
  }
});

export async function getCatalogCategories() {
  const remoteCatalog = await readCatalogFromSupabase();
  return (remoteCatalog?.categories ?? catalogSeedCategories).filter(
    (category) => category.isVisible
  );
}

export async function getCatalogCategoryBySlug(slug: string) {
  const categories = await getCatalogCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getCatalogProducts(filters: CatalogFilters = {}) {
  const remoteCatalog = await readCatalogFromSupabase();
  return applyFilters(remoteCatalog?.products ?? catalogSeedProducts, filters);
}

export async function getFeaturedCatalogProducts(limit = 6) {
  return getCatalogProducts({
    featuredOnly: true,
    limit,
    sort: "featured",
  });
}

export async function getCatalogProductBySlug(slug: string) {
  const products = await getCatalogProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getCatalogProductsByCategory(
  category: CatalogCategorySlug
) {
  return getCatalogProducts({ category });
}

export async function getAdminCatalogSnapshot() {
  const remoteCatalog = await readCatalogFromSupabase();

  return {
    source: remoteCatalog ? "supabase" : "seed",
    categories: remoteCatalog?.categories ?? catalogSeedCategories,
    products: remoteCatalog?.products ?? catalogSeedProducts,
  } as const;
}
