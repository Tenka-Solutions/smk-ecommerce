"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ADMIN_ORDER_STATUSES,
  deleteAdminOrderPermanently,
  OrdersAdminError,
  setAdminOrderArchived,
  updateAdminOrder,
} from "@/modules/orders/admin";
import type { AdminOrderStatus } from "@/modules/orders/admin";

function getReturnTo(formData: FormData) {
  const returnTo = formData.get("returnTo");

  if (
    typeof returnTo === "string" &&
    returnTo.startsWith("/admin/pedidos")
  ) {
    return returnTo;
  }

  return "/admin/pedidos";
}

function redirectWithStatus(returnTo: string, status: string): never {
  const target = new URL(returnTo, "http://localhost");
  target.searchParams.set("estado", status);
  redirect(`${target.pathname}?${target.searchParams.toString()}`);
}

function revalidateOrders() {
  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
}

export async function updateOrderAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const orderId = formData.get("orderId");
  const orderStatus = formData.get("orderStatus");
  const internalNote = formData.get("internalNote");

  if (
    typeof orderId !== "string" ||
    !orderId.trim() ||
    typeof orderStatus !== "string" ||
    !ADMIN_ORDER_STATUSES.includes(orderStatus as AdminOrderStatus)
  ) {
    redirectWithStatus(returnTo, "error");
  }

  try {
    await updateAdminOrder({
      orderId,
      orderStatus: orderStatus as AdminOrderStatus,
      internalNote:
        typeof internalNote === "string" && internalNote.trim()
          ? internalNote.trim()
          : null,
    });
    revalidateOrders();
  } catch (error) {
    if (error instanceof OrdersAdminError) {
      redirectWithStatus(returnTo, "error");
    }

    redirectWithStatus(returnTo, "error");
  }

  redirectWithStatus(returnTo, "guardado");
}

export async function archiveOrderAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const orderId = formData.get("orderId");

  if (typeof orderId !== "string" || !orderId.trim()) {
    redirectWithStatus(returnTo, "error");
  }

  try {
    await setAdminOrderArchived({ orderId, archived: true });
    revalidateOrders();
  } catch {
    redirectWithStatus(returnTo, "error");
  }

  redirectWithStatus(returnTo, "archivado");
}

export async function unarchiveOrderAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const orderId = formData.get("orderId");

  if (typeof orderId !== "string" || !orderId.trim()) {
    redirectWithStatus(returnTo, "error");
  }

  try {
    await setAdminOrderArchived({ orderId, archived: false });
    revalidateOrders();
  } catch {
    redirectWithStatus(returnTo, "error");
  }

  redirectWithStatus(returnTo, "desarchivado");
}

export async function deleteOrderPermanentlyAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const orderId = formData.get("orderId");
  const confirmation = formData.get("confirmation");

  if (
    typeof orderId !== "string" ||
    !orderId.trim() ||
    typeof confirmation !== "string"
  ) {
    redirectWithStatus(returnTo, "error");
  }

  try {
    await deleteAdminOrderPermanently({ orderId, confirmation });
    revalidateOrders();
  } catch (error) {
    if (error instanceof OrdersAdminError) {
      if (error.field === "invalidConfirmation") {
        redirectWithStatus(returnTo, "confirmacion_invalida");
      }

      if (error.field === "paymentConfirmed") {
        redirectWithStatus(returnTo, "pago_confirmado");
      }

      if (error.field === "processedOrder") {
        redirectWithStatus(returnTo, "pedido_procesado");
      }

      if (error.field === "criticalRelations") {
        redirectWithStatus(returnTo, "relaciones_criticas");
      }

      if (error.field === "notDeletableStatus") {
        redirectWithStatus(returnTo, "estado_no_eliminable");
      }
    }

    redirectWithStatus(returnTo, "error");
  }

  redirectWithStatus("/admin/pedidos", "eliminado");
}
