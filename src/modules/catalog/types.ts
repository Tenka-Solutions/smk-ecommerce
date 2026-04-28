export type CatalogCategorySlug =
  | "maquinas"
  | "cafe-grano"
  | "cafe-instantaneo"
  | "accesorios-vasos";

export type AvailabilityStatus =
  | "available"
  | "check_availability"
  | "sold_out"
  | "draft"
  | "hidden";

export type PublicationStatus = "draft" | "published" | "archived";

export interface CatalogCategory {
  id: string;
  parentId?: string | null;
  slug: CatalogCategorySlug;
  name: string;
  description: string;
  imageUrl?: string | null;
  sortOrder: number;
  isVisible: boolean;
  isActive?: boolean;
  seoTitle: string;
  seoDescription: string;
}

export interface CatalogProduct {
  id: string;
  slug: string;
  sku: string | null;
  ean?: string | null;
  categoryId?: string;
  categorySlug: CatalogCategorySlug;
  name: string;
  shortDescription: string;
  longDescription: string;
  netPriceClp?: number;
  grossPriceClp?: number;
  priceClpTaxInc: number;
  image: string;
  gallery: string[];
  publicationStatus: PublicationStatus;
  availabilityStatus: AvailabilityStatus;
  isFeatured: boolean;
  brand?: string | null;
  stockQuantity?: number | null;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  highlights: string[];
}

export interface CatalogFilters {
  query?: string;
  category?: CatalogCategorySlug;
  featuredOnly?: boolean;
  sort?: "featured" | "price-asc" | "price-desc" | "name";
  limit?: number;
}
