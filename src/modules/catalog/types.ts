export type CatalogCategorySlug =
  | "maquinas"
  | "cafe-grano"
  | "cafe-instantaneo"
  | "accesorios-vasos";

export type AvailabilityStatus =
  | "available"
  | "check_availability"
  | "sold_out";

export type PublicationStatus = "draft" | "published" | "archived";

export interface CatalogCategory {
  id: string;
  slug: CatalogCategorySlug;
  name: string;
  description: string;
  sortOrder: number;
  isVisible: boolean;
  seoTitle: string;
  seoDescription: string;
}

export interface CatalogProduct {
  id: string;
  slug: string;
  sku: string | null;
  categorySlug: CatalogCategorySlug;
  name: string;
  shortDescription: string;
  longDescription: string;
  priceClpTaxInc: number;
  image: string;
  gallery: string[];
  publicationStatus: PublicationStatus;
  availabilityStatus: AvailabilityStatus;
  isFeatured: boolean;
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
