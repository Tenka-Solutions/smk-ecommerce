"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CatalogAdminError,
  deleteAdminProduct,
  hideAdminProduct,
  saveAdminProduct,
} from "@/modules/catalog/admin";
import {
  ProductFormState,
  parseProductFormData,
} from "@/modules/catalog/admin-schema";

function revalidateCatalogPaths(
  productSlug?: string,
  categorySlug?: string,
  parentCategorySlug?: string
) {
  revalidatePath("/admin/productos");
  revalidatePath("/tienda");

  if (productSlug) {
    revalidatePath(`/productos/${productSlug}`);
  }

  [categorySlug, parentCategorySlug]
    .filter((slug): slug is string => Boolean(slug))
    .forEach((slug) => {
      revalidatePath(`/categorias/${slug}`);
    });
}

function getProductErrorStatus(error: unknown) {
  if (!(error instanceof CatalogAdminError)) {
    return "error";
  }

  if (error.field === "productHasOrders") {
    return "producto_con_pedidos";
  }

  if (error.field === "productHasQuotes") {
    return "producto_con_cotizaciones";
  }

  return "error";
}

export async function saveProductAction(
  _previousState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const parsed = parseProductFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados antes de guardar.",
      fieldErrors: parsed.fieldErrors,
      values: parsed.values,
    };
  }

  let savedProduct: Awaited<ReturnType<typeof saveAdminProduct>>;

  try {
    savedProduct = await saveAdminProduct(parsed.data);
  } catch (error) {
    if (error instanceof CatalogAdminError) {
      return {
        status: "error",
        message: error.message,
        fieldErrors: error.field ? { [error.field]: error.message } : undefined,
        values: parsed.data,
      };
    }

    return {
      status: "error",
      message: "No pudimos guardar el producto. Intenta nuevamente.",
      values: parsed.data,
    };
  }

  revalidateCatalogPaths(
    savedProduct.slug,
    savedProduct.categorySlug,
    savedProduct.parentCategorySlug
  );
  redirect("/admin/productos?estado=guardado");
}

export async function hideProductAction(formData: FormData) {
  const productId = formData.get("productId");

  if (typeof productId !== "string" || !productId.trim()) {
    redirect("/admin/productos?estado=error");
  }

  try {
    const hiddenProduct = await hideAdminProduct(productId);
    revalidateCatalogPaths(
      hiddenProduct.slug,
      hiddenProduct.categorySlug,
      hiddenProduct.parentCategorySlug
    );
  } catch (error) {
    redirect(`/admin/productos?estado=${getProductErrorStatus(error)}`);
  }

  redirect("/admin/productos?estado=oculto");
}

export async function deleteProductAction(formData: FormData) {
  const productId = formData.get("productId");

  if (typeof productId !== "string" || !productId.trim()) {
    redirect("/admin/productos?estado=error");
  }

  try {
    const deletedProduct = await deleteAdminProduct(productId);
    revalidateCatalogPaths(
      deletedProduct.slug,
      deletedProduct.categorySlug,
      deletedProduct.parentCategorySlug
    );
  } catch (error) {
    redirect(`/admin/productos?estado=${getProductErrorStatus(error)}`);
  }

  redirect("/admin/productos?estado=eliminado");
}
