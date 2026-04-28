import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getAuthenticatedUser,
  getAuthenticatedUserRoles,
} from "@/modules/auth/server";
import type { OrderStatus, PaymentStatus } from "@/modules/orders/service";

const ORDER_ADMIN_ROLES = ["super_admin", "sales_manager"];

export const ADMIN_ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "preparing",
  "shipped",
  "completed",
  "delivered",
  "cancelled",
  "rejected",
] as const satisfies OrderStatus[];

export type AdminOrderStatus = (typeof ADMIN_ORDER_STATUSES)[number];

export type AdminArchivedFilter = "active" | "archived" | "all";

export const ADMIN_ORDER_DELETE_CONFIRMATION = "ELIMINAR";

const DELETABLE_ORDER_STATUSES = ["pending", "cancelled"] as const;

const PROCESSED_ORDER_STATUSES = [
  "processing",
  "preparing",
  "shipped",
  "completed",
  "delivered",
] as const;

const CONFIRMED_PAYMENT_STATUSES = [
  "paid",
  "approved",
  "confirmed",
  "captured",
  "completed",
  "succeeded",
  "success",
] as const;

type AdminOrderDeleteBlockReason =
  | "eligible"
  | "invalidConfirmation"
  | "paymentConfirmed"
  | "processedOrder"
  | "notDeletableStatus"
  | "criticalRelations";

export interface AdminOrderDeletionEligibility {
  canDelete: boolean;
  reason: AdminOrderDeleteBlockReason;
  message: string;
}

export interface AdminOrderFilters {
  query?: string;
  orderStatus?: AdminOrderStatus;
  dateFrom?: string;
  dateTo?: string;
  archived?: AdminArchivedFilter;
}

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentProvider: string | null;
  customerName: string;
  customerEmail: string;
  phone: string | null;
  rut: string | null;
  companyName: string | null;
  totalTaxInc: number;
  createdAt: string | null;
  updatedAt: string | null;
  archivedAt: string | null;
  archivedBy: string | null;
  internalNote: string | null;
}

export interface AdminOrderDetail extends AdminOrderListItem {
  businessName: string | null;
  businessActivity: string | null;
  subtotalTaxInc: number;
  taxAmount: number;
  shippingAmount: number;
  shippingLabel: string;
  paymentAttemptProvider: string | null;
  paymentAttemptReference: string | null;
  paymentAttemptStatus: PaymentStatus | null;
  paymentTransactionId: string | null;
  hasConfirmedPaymentAttempt: boolean;
  items: Array<{
    productId: string | null;
    sku: string | null;
    name: string;
    quantity: number;
    unitPriceTaxInc: number;
    lineTotalTaxInc: number;
  }>;
  shippingAddress: {
    region: string;
    comuna: string;
    street: string;
    number: string;
    apartment: string | null;
    references: string | null;
    deliveryNotes: string | null;
  } | null;
}

export interface AdminOrdersPageData {
  orders: AdminOrderListItem[];
  totalOrders: number;
  visibleOrders: number;
  archivedOrders: number;
  canMutate: boolean;
  warning?: string;
}

export class OrdersAdminError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = "OrdersAdminError";
  }
}

function hasAnyRole(roles: string[], allowedRoles: string[]) {
  return roles.some((role) => allowedRoles.includes(role));
}

async function getOrdersAdminContext() {
  const [user, roles] = await Promise.all([
    getAuthenticatedUser(),
    getAuthenticatedUserRoles(),
  ]);

  if (!user || !hasAnyRole(roles, ORDER_ADMIN_ROLES)) {
    throw new OrdersAdminError("No tienes permisos para administrar pedidos.");
  }

  const client = createSupabaseAdminClient();

  if (!client) {
    return {
      user,
      client: null,
      canMutate: false,
    };
  }

  return {
    user,
    client,
    canMutate: true,
  };
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function toStringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function toOrderStatus(value: unknown): OrderStatus {
  return ADMIN_ORDER_STATUSES.includes(value as AdminOrderStatus)
    ? (value as OrderStatus)
    : "pending";
}

function toPaymentStatus(value: unknown): PaymentStatus {
  return ["pending", "paid", "rejected", "cancelled"].includes(value as string)
    ? (value as PaymentStatus)
    : "pending";
}

function normalizeStatusValue(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function isConfirmedPaymentStatus(value: unknown) {
  const normalized = normalizeStatusValue(value);
  return CONFIRMED_PAYMENT_STATUSES.includes(
    normalized as (typeof CONFIRMED_PAYMENT_STATUSES)[number]
  );
}

function payloadHasConfirmedPaymentStatus(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  const stack: unknown[] = [value];

  while (stack.length) {
    const current = stack.pop();

    if (!current || typeof current !== "object") {
      continue;
    }

    for (const [key, entry] of Object.entries(
      current as Record<string, unknown>
    )) {
      if (
        typeof entry === "string" &&
        key.toLowerCase().includes("status") &&
        isConfirmedPaymentStatus(entry)
      ) {
        return true;
      }

      if (entry && typeof entry === "object") {
        stack.push(entry);
      }
    }
  }

  return false;
}

function hasConfirmedPaymentAttempt(attempt: Record<string, unknown>) {
  return (
    isConfirmedPaymentStatus(attempt.status) ||
    payloadHasConfirmedPaymentStatus(attempt.response_payload)
  );
}

function toIsoStart(date: string) {
  return `${date}T00:00:00.000Z`;
}

function toIsoEnd(date: string) {
  return `${date}T23:59:59.999Z`;
}

function mapOrder(row: Record<string, unknown>): AdminOrderListItem {
  return {
    id: String(row.id),
    orderNumber: String(row.order_number ?? ""),
    orderStatus: toOrderStatus(row.order_status),
    paymentStatus: toPaymentStatus(row.payment_status),
    paymentProvider: toStringOrNull(row.payment_provider),
    customerName: String(row.customer_name ?? ""),
    customerEmail: String(row.customer_email ?? ""),
    phone: toStringOrNull(row.phone),
    rut: toStringOrNull(row.rut),
    companyName: toStringOrNull(row.company_name),
    totalTaxInc: Number(row.total_tax_inc ?? 0),
    createdAt: toStringOrNull(row.created_at),
    updatedAt: toStringOrNull(row.updated_at),
    archivedAt: toStringOrNull(row.archived_at),
    archivedBy: toStringOrNull(row.archived_by),
    internalNote: toStringOrNull(row.internal_note),
  };
}

function mapOrderDetail({
  order,
  address,
  items,
  paymentAttempts,
}: {
  order: Record<string, unknown>;
  address: Record<string, unknown> | null;
  items: Array<Record<string, unknown>>;
  paymentAttempts: Array<Record<string, unknown>>;
}): AdminOrderDetail {
  const paymentAttempt = paymentAttempts[0] ?? null;

  return {
    ...mapOrder(order),
    businessName: toStringOrNull(order.business_name),
    businessActivity: toStringOrNull(order.business_activity),
    subtotalTaxInc: Number(order.subtotal_tax_inc ?? 0),
    taxAmount: Number(order.tax_amount ?? 0),
    shippingAmount: Number(order.shipping_amount ?? 0),
    shippingLabel: String(order.shipping_label ?? "Por confirmar"),
    paymentAttemptProvider: paymentAttempt
      ? toStringOrNull(paymentAttempt.provider)
      : null,
    paymentAttemptReference: paymentAttempt
      ? toStringOrNull(paymentAttempt.reference)
      : null,
    paymentAttemptStatus: paymentAttempt
      ? toPaymentStatus(paymentAttempt.status)
      : null,
    paymentTransactionId: paymentAttempt
      ? toStringOrNull(paymentAttempt.provider_transaction_id)
      : null,
    hasConfirmedPaymentAttempt: paymentAttempts.some(hasConfirmedPaymentAttempt),
    items: items.map((item) => ({
      productId: toStringOrNull(item.product_id),
      sku: toStringOrNull(item.sku_snapshot),
      name: String(item.name_snapshot ?? "Producto"),
      quantity: Number(item.quantity ?? 0),
      unitPriceTaxInc: Number(item.unit_price_tax_inc ?? 0),
      lineTotalTaxInc: Number(item.line_total_tax_inc ?? 0),
    })),
    shippingAddress: address
      ? {
          region: String(address.region ?? ""),
          comuna: String(address.comuna ?? ""),
          street: String(address.street ?? ""),
          number: String(address.number ?? ""),
          apartment: toStringOrNull(address.apartment),
          references: toStringOrNull(address.references),
          deliveryNotes: toStringOrNull(address.delivery_notes),
        }
      : null,
  };
}

function applySearch(orders: AdminOrderListItem[], query?: string) {
  if (!query?.trim()) {
    return orders;
  }

  const normalizedQuery = normalizeText(query);

  return orders.filter((order) =>
    normalizeText(
      [
        order.orderNumber,
        order.customerName,
        order.customerEmail,
        order.phone ?? "",
      ].join(" ")
    ).includes(normalizedQuery)
  );
}

export function isArchiveableOrderStatus(status: OrderStatus) {
  return ["pending", "cancelled", "rejected"].includes(status);
}

export function getAdminOrderDeletionEligibility({
  orderStatus,
  paymentStatus,
  paymentAttemptStatus,
  hasConfirmedPaymentAttempt: hasConfirmedAttempt = false,
}: {
  orderStatus: OrderStatus | string;
  paymentStatus: PaymentStatus | string;
  paymentAttemptStatus?: PaymentStatus | string | null;
  hasConfirmedPaymentAttempt?: boolean;
}): AdminOrderDeletionEligibility {
  const normalizedOrderStatus = normalizeStatusValue(orderStatus);

  if (
    normalizedOrderStatus === "paid" ||
    isConfirmedPaymentStatus(paymentStatus) ||
    isConfirmedPaymentStatus(paymentAttemptStatus) ||
    hasConfirmedAttempt
  ) {
    return {
      canDelete: false,
      reason: "paymentConfirmed",
      message:
        "No se puede eliminar porque tiene pago confirmado. Puedes archivarlo para ocultarlo del panel principal.",
    };
  }

  if (
    PROCESSED_ORDER_STATUSES.includes(
      normalizedOrderStatus as (typeof PROCESSED_ORDER_STATUSES)[number]
    )
  ) {
    return {
      canDelete: false,
      reason: "processedOrder",
      message:
        "No se puede eliminar porque ya fue procesado. Puedes archivarlo para ocultarlo del panel principal.",
    };
  }

  if (
    !DELETABLE_ORDER_STATUSES.includes(
      normalizedOrderStatus as (typeof DELETABLE_ORDER_STATUSES)[number]
    )
  ) {
    return {
      canDelete: false,
      reason: "notDeletableStatus",
      message:
        "Solo se pueden eliminar definitivamente pedidos pendientes o cancelados. Puedes archivarlo para ocultarlo del panel principal.",
    };
  }

  return {
    canDelete: true,
    reason: "eligible",
    message:
      "Este pedido parece elegible para eliminacion definitiva porque no tiene pago confirmado y esta pendiente o cancelado.",
  };
}

export async function getAdminOrdersPageData(
  filters: AdminOrderFilters = {}
): Promise<AdminOrdersPageData> {
  const { client, canMutate } = await getOrdersAdminContext();

  if (!client) {
    return {
      orders: [],
      totalOrders: 0,
      visibleOrders: 0,
      archivedOrders: 0,
      canMutate,
      warning:
        "Supabase admin no esta configurado; no fue posible cargar pedidos.",
    };
  }

  let query = client
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (filters.orderStatus) {
    query = query.eq("order_status", filters.orderStatus);
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", toIsoStart(filters.dateFrom));
  }

  if (filters.dateTo) {
    query = query.lte("created_at", toIsoEnd(filters.dateTo));
  }

  const archivedFilter = filters.archived ?? "active";

  if (archivedFilter === "active") {
    query = query.is("archived_at", null);
  }

  if (archivedFilter === "archived") {
    query = query.not("archived_at", "is", null);
  }

  const { data, error } = await query;

  if (error) {
    return {
      orders: [],
      totalOrders: 0,
      visibleOrders: 0,
      archivedOrders: 0,
      canMutate,
      warning: error.message || "No fue posible cargar pedidos.",
    };
  }

  const orders = (data ?? []).map((order) =>
    mapOrder(order as Record<string, unknown>)
  );
  const filteredOrders = applySearch(orders, filters.query);

  return {
    orders: filteredOrders,
    totalOrders: orders.length,
    visibleOrders: orders.filter((order) => !order.archivedAt).length,
    archivedOrders: orders.filter((order) => order.archivedAt).length,
    canMutate,
  };
}

export async function getAdminOrderDetail(orderId: string) {
  if (!orderId) {
    return null;
  }

  const { client } = await getOrdersAdminContext();

  if (!client) {
    return null;
  }

  const [
    { data: orderData, error: orderError },
    { data: addressData },
    { data: itemsData },
    { data: paymentAttemptsData },
  ] = await Promise.all([
    client.from("orders").select("*").eq("id", orderId).maybeSingle(),
    client
      .from("order_shipping_addresses")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle(),
    client
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true }),
    client
      .from("payment_attempts")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (orderError || !orderData) {
    return null;
  }

  return mapOrderDetail({
    order: orderData as Record<string, unknown>,
    address: (addressData as Record<string, unknown> | null) ?? null,
    items: (itemsData ?? []) as Array<Record<string, unknown>>,
    paymentAttempts: (paymentAttemptsData ?? []) as Array<
      Record<string, unknown>
    >,
  });
}

export async function updateAdminOrder({
  orderId,
  orderStatus,
  internalNote,
}: {
  orderId: string;
  orderStatus: AdminOrderStatus;
  internalNote: string | null;
}) {
  const { client, user } = await getOrdersAdminContext();

  if (!client) {
    throw new OrdersAdminError("Supabase admin no esta configurado.");
  }

  if (!ADMIN_ORDER_STATUSES.includes(orderStatus)) {
    throw new OrdersAdminError("Selecciona un estado valido.", "orderStatus");
  }

  const { data, error } = await client
    .from("orders")
    .update({
      order_status: orderStatus,
      internal_note: internalNote,
    })
    .eq("id", orderId)
    .select("id, order_number")
    .maybeSingle();

  if (error || !data) {
    throw new OrdersAdminError(
      error?.message || "No fue posible actualizar el pedido."
    );
  }

  await client.from("order_events").insert({
    order_id: orderId,
    event_type: "admin_order_updated",
    payload: {
      orderStatus,
      internalNote,
      updatedBy: user.id,
    },
  });

  return {
    id: String(data.id),
    orderNumber: String(data.order_number ?? ""),
  };
}

export async function setAdminOrderArchived({
  orderId,
  archived,
}: {
  orderId: string;
  archived: boolean;
}) {
  const { client, user } = await getOrdersAdminContext();

  if (!client) {
    throw new OrdersAdminError("Supabase admin no esta configurado.");
  }

  const { data: order, error: orderError } = await client
    .from("orders")
    .select("id, order_number, order_status")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    throw new OrdersAdminError("El pedido no existe o ya no esta disponible.");
  }

  const orderStatus = toOrderStatus(order.order_status);

  if (archived && !isArchiveableOrderStatus(orderStatus)) {
    throw new OrdersAdminError(
      "Solo se pueden archivar pedidos pendientes, cancelados o rechazados."
    );
  }

  const { error } = await client
    .from("orders")
    .update({
      archived_at: archived ? new Date().toISOString() : null,
      archived_by: archived ? user.id : null,
    })
    .eq("id", orderId);

  if (error) {
    throw new OrdersAdminError(
      error.message || "No fue posible actualizar el archivado del pedido."
    );
  }

  await client.from("order_events").insert({
    order_id: orderId,
    event_type: archived ? "order_archived" : "order_unarchived",
    payload: {
      archived,
      updatedBy: user.id,
    },
  });

  return {
    id: String(order.id),
    orderNumber: String(order.order_number ?? ""),
  };
}

export async function deleteAdminOrderPermanently({
  orderId,
  confirmation,
}: {
  orderId: string;
  confirmation: string;
}) {
  const { client } = await getOrdersAdminContext();

  if (!client) {
    throw new OrdersAdminError("Supabase admin no esta configurado.");
  }

  if (confirmation.trim() !== ADMIN_ORDER_DELETE_CONFIRMATION) {
    throw new OrdersAdminError(
      "Confirmacion invalida. Debes escribir ELIMINAR.",
      "invalidConfirmation"
    );
  }

  const { data: order, error: orderError } = await client
    .from("orders")
    .select("id, order_number, order_status, payment_status")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    throw new OrdersAdminError("El pedido no existe o ya no esta disponible.");
  }

  const { data: paymentAttempts, error: attemptsError } = await client
    .from("payment_attempts")
    .select("id, status, response_payload")
    .eq("order_id", orderId);

  if (attemptsError) {
    throw new OrdersAdminError(
      "No se pudo revisar el estado de pagos del pedido.",
      "criticalRelations"
    );
  }

  const eligibility = getAdminOrderDeletionEligibility({
    orderStatus: normalizeStatusValue(order.order_status),
    paymentStatus: normalizeStatusValue(order.payment_status),
    hasConfirmedPaymentAttempt: (
      (paymentAttempts ?? []) as Array<Record<string, unknown>>
    ).some(hasConfirmedPaymentAttempt),
  });

  if (!eligibility.canDelete) {
    throw new OrdersAdminError(eligibility.message, eligibility.reason);
  }

  const { error: unlinkLatestAttemptError } = await client
    .from("orders")
    .update({ latest_payment_attempt_id: null })
    .eq("id", orderId);

  if (unlinkLatestAttemptError) {
    throw new OrdersAdminError(
      "No se puede eliminar porque tiene relaciones criticas. Puedes archivarlo.",
      "criticalRelations"
    );
  }

  const relatedTables = [
    "order_events",
    "payment_attempts",
    "order_shipping_addresses",
    "order_items",
  ] as const;

  for (const table of relatedTables) {
    const { error } = await client.from(table).delete().eq("order_id", orderId);

    if (error) {
      throw new OrdersAdminError(
        "No se puede eliminar porque tiene relaciones criticas. Puedes archivarlo.",
        "criticalRelations"
      );
    }
  }

  const { data: deletedOrder, error: deleteOrderError } = await client
    .from("orders")
    .delete()
    .eq("id", orderId)
    .select("id, order_number")
    .maybeSingle();

  if (deleteOrderError || !deletedOrder) {
    throw new OrdersAdminError(
      "No se puede eliminar porque tiene relaciones criticas. Puedes archivarlo.",
      "criticalRelations"
    );
  }

  return {
    id: String(deletedOrder.id),
    orderNumber: String(deletedOrder.order_number ?? ""),
  };
}
