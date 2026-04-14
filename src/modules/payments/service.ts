import { randomUUID } from "node:crypto";
import { createGetnetCheckout } from "@/lib/payments/getnet";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import {
  getOrderDetailById,
  updateOrderStatuses,
} from "@/modules/orders/service";
import { sendOrderPaidEmails } from "@/modules/orders/notifications";

export type PaymentResultStatus = "pending" | "paid" | "rejected" | "cancelled";

export function buildPaymentReference(orderNumber: string) {
  const fragment = randomUUID().slice(0, 8).toUpperCase();
  return `${orderNumber}-${fragment}`;
}

export async function createPaymentAttempt({
  orderId,
  orderNumber,
  amount,
  customerEmail,
  description,
}: {
  orderId?: string | null;
  orderNumber: string;
  amount: number;
  customerEmail: string;
  description: string;
}) {
  const adminClient = createSupabaseAdminClient();
  const reference = buildPaymentReference(orderNumber);

  if (adminClient && orderId) {
    const { data: attemptRow } = await adminClient
      .from("payment_attempts")
      .insert({
        order_id: orderId,
        provider: env.paymentsMode === "getnet" ? "getnet" : "mock",
        reference,
        status: "pending",
        request_payload: {
          amount,
          customerEmail,
          description,
        },
      })
      .select("id")
      .single();

    const result = await createGetnetCheckout({
      orderNumber,
      amount,
      customerEmail,
      description,
      returnUrl: env.getnetReturnUrl,
      webhookUrl: env.getnetWebhookUrl,
      reference,
    });

    if (attemptRow?.id) {
      await adminClient
        .from("payment_attempts")
        .update({
          redirect_url: result.redirectUrl,
          response_payload: result.rawResponse ?? {
            provider: result.provider,
            reference: result.reference,
          },
        })
        .eq("id", attemptRow.id);

      await adminClient
        .from("orders")
        .update({
          latest_payment_attempt_id: attemptRow.id,
        })
        .eq("id", orderId);
    }

    return result;
  }

  return createGetnetCheckout({
    orderNumber,
    amount,
    customerEmail,
    description,
    returnUrl: env.getnetReturnUrl,
    webhookUrl: env.getnetWebhookUrl,
    reference,
  });
}

function normalizePaymentResult(
  status: string | null | undefined
): PaymentResultStatus {
  switch ((status ?? "").toLowerCase()) {
    case "paid":
    case "approved":
    case "success":
      return "paid";
    case "cancelled":
    case "canceled":
      return "cancelled";
    case "pending":
      return "pending";
    default:
      return "rejected";
  }
}

export async function processPaymentResult({
  reference,
  status,
  providerTransactionId,
  payload,
}: {
  reference: string;
  status: string | null | undefined;
  providerTransactionId?: string | null;
  payload?: Record<string, unknown>;
}) {
  const adminClient = createSupabaseAdminClient();
  const normalizedStatus = normalizePaymentResult(status);

  if (!adminClient) {
    return {
      status: normalizedStatus,
      orderNumber: null,
    };
  }

  const { data: attemptRow } = await adminClient
    .from("payment_attempts")
    .select("id, order_id")
    .eq("reference", reference)
    .maybeSingle();

  if (!attemptRow?.order_id) {
    return {
      status: normalizedStatus,
      orderNumber: null,
    };
  }

  const { data: orderRow } = await adminClient
    .from("orders")
    .select("id, order_number, payment_status")
    .eq("id", attemptRow.order_id)
    .maybeSingle();

  await adminClient
    .from("payment_attempts")
    .update({
      provider_transaction_id: providerTransactionId ?? null,
      status: normalizedStatus,
      response_payload: payload ?? {},
      confirmed_at:
        normalizedStatus === "pending" ? null : new Date().toISOString(),
    })
    .eq("id", attemptRow.id);

  const nextOrderStatus =
    normalizedStatus === "paid"
      ? "paid"
      : normalizedStatus === "cancelled"
        ? "cancelled"
        : normalizedStatus === "pending"
          ? "pending"
          : "rejected";

  await updateOrderStatuses({
    orderId: attemptRow.order_id,
    orderStatus: nextOrderStatus,
    paymentStatus: normalizedStatus,
    note: `Resultado de pago ${normalizedStatus} para referencia ${reference}`,
  });

  if (normalizedStatus === "paid" && orderRow?.payment_status !== "paid") {
    const order = await getOrderDetailById(attemptRow.order_id);

    if (order) {
      await sendOrderPaidEmails({
        order,
        reference,
      });
    }
  }

  return {
    status: normalizedStatus,
    orderNumber: orderRow?.order_number ?? null,
  };
}
