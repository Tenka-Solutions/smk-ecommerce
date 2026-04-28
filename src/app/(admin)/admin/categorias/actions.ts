"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CatalogAdminError,
  deleteAdminCategory,
  saveAdminCategory,
  setAdminCategoryActive,
} from "@/modules/catalog/admin";
import {
  CategoryFormState,
  parseCategoryFormData,
} from "@/modules/catalog/admin-schema";

function revalidateCategoryPaths(categorySlug?: string) {
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/tienda");

  if (categorySlug) {
    revalidatePath(`/categorias/${categorySlug}`);
  }
}

function getCategoryErrorStatus(error: unknown) {
  if (!(error instanceof CatalogAdminError)) {
    return "error";
  }

  if (error.field === "categoryHasChildren") {
    return "categoria_con_subcategorias";
  }

  if (error.field === "categoryHasProducts") {
    return "categoria_con_productos";
  }

  return "error";
}

export async function saveCategoryAction(
  _previousState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const parsed = parseCategoryFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados antes de guardar.",
      fieldErrors: parsed.fieldErrors,
      values: parsed.values,
    };
  }

  let savedCategory: Awaited<ReturnType<typeof saveAdminCategory>>;

  try {
    savedCategory = await saveAdminCategory(parsed.data);
  } catch (error) {
    if (error instanceof CatalogAdminError) {
      return {
        status: "error",
        message: error.message,
        fieldErrors: error.field
          ? { [error.field]: error.message }
          : undefined,
        values: parsed.data,
      };
    }

    return {
      status: "error",
      message: "No pudimos guardar la categoria. Intenta nuevamente.",
      values: parsed.data,
    };
  }

  revalidateCategoryPaths(savedCategory.slug);
  redirect("/admin/categorias?estado=guardada");
}

export async function setCategoryActiveAction(formData: FormData) {
  const categoryId = formData.get("categoryId");
  const nextActive = formData.get("isActive") === "true";

  if (typeof categoryId !== "string" || !categoryId.trim()) {
    redirect("/admin/categorias?estado=error");
  }

  try {
    const category = await setAdminCategoryActive(categoryId, nextActive);
    revalidateCategoryPaths(category.slug);
  } catch (error) {
    redirect(`/admin/categorias?estado=${getCategoryErrorStatus(error)}`);
  }

  redirect(
    `/admin/categorias?estado=${nextActive ? "activada" : "desactivada"}`
  );
}

export async function deleteCategoryAction(formData: FormData) {
  const categoryId = formData.get("categoryId");

  if (typeof categoryId !== "string" || !categoryId.trim()) {
    redirect("/admin/categorias?estado=error");
  }

  try {
    const category = await deleteAdminCategory(categoryId);
    revalidateCategoryPaths(category.slug);
  } catch (error) {
    redirect(`/admin/categorias?estado=${getCategoryErrorStatus(error)}`);
  }

  redirect("/admin/categorias?estado=eliminada");
}
