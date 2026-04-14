import { NextResponse } from "next/server";
import { processPaymentResult } from "@/modules/payments/service";

function parseWebhookPayload(raw: string) {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const params = new URLSearchParams(raw);
    return Object.fromEntries(params.entries());
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const payload = parseWebhookPayload(rawBody);
  const reference =
    typeof payload.reference === "string"
      ? payload.reference
      : typeof payload.buy_order === "string"
        ? payload.buy_order
        : null;
  const status =
    typeof payload.status === "string"
      ? payload.status
      : typeof payload.result === "string"
        ? payload.result
        : null;

  if (!reference || !status) {
    return NextResponse.json(
      { ok: false, error: "Webhook sin referencia o estado." },
      { status: 400 }
    );
  }

  const result = await processPaymentResult({
    reference,
    status,
    providerTransactionId:
      typeof payload.transaction_id === "string"
        ? payload.transaction_id
        : null,
    payload,
  });

  return NextResponse.json({
    ok: true,
    status: result.status,
    orderNumber: result.orderNumber,
  });
}
