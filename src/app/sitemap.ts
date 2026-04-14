import { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getCatalogCategories, getCatalogProducts } from "@/modules/catalog/repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getCatalogCategories(),
    getCatalogProducts(),
  ]);

  const staticRoutes = [
    "",
    "/tienda",
    "/carrito",
    "/checkout",
    "/cotizar",
    "/contacto",
    "/nosotros",
    "/faq",
    "/despachos",
    "/terminos",
    "/privacidad",
    "/login",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${env.siteUrl}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${env.siteUrl}/categorias/${category.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${env.siteUrl}/productos/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...productEntries,
  ];
}
