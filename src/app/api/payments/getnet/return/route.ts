import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { processPaymentResult } from "@/modules/payments/service";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const reference = request.nextUrl.searchParams.get("reference");
  const orderNumberFromQuery = request.nextUrl.searchParams.get("order");
  const providerTransactionId =
    request.nextUrl.searchParams.get("transaction_id") ??
    request.nextUrl.searchParams.get("transactionId");

  const result =
    reference && status
      ? await processPaymentResult({
          reference,
          status,
          providerTransactionId,
          payload: Object.fromEntries(request.nextUrl.searchParams.entries()),
        })
      : null;

  const nextPath =
    result?.status === "paid" || status === "paid"
      ? "/compra/exito"
      : "/compra/rechazada";

  const redirectUrl = new URL(nextPath, env.siteUrl);
  const orderNumber = result?.orderNumber ?? orderNumberFromQuery;

  if (orderNumber) {
    redirectUrl.searchParams.set("order", orderNumber);
  }

  if (reference) {
    redirectUrl.searchParams.set("reference", reference);
  }

  if (request.nextUrl.searchParams.get("mode")) {
    redirectUrl.searchParams.set(
      "mode",
      request.nextUrl.searchParams.get("mode") as string
    );
  }

  return NextResponse.redirect(redirectUrl);
}
