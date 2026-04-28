"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CatalogAdminError,
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
  } catch {
    redirect("/admin/categorias?estado=error");
  }

  redirect(
    `/admin/categorias?estado=${nextActive ? "activada" : "desactivada"}`
  );
}
