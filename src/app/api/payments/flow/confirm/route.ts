import { NextRequest, NextResponse } from "next/server";
import { getFlowPaymentStatus } from "@/modules/payments/providers/flow";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabasePaymentRepository } from "@/modules/payments/infra/supabase-payment-repository";
import type { PaymentStatus } from "@/modules/payments/domain/payment";

function mapFlowStatus(code: number): PaymentStatus {
  if (code === 2) return "paid";
  if (code === 3 || code === 4) return "failed";
  return "pending";
}

export async function POST(request: NextRequest) {
  let token: string | null = null;

  try {
    const form = await request.formData();
    const formToken = form.get("token");
    if (typeof formToken === "string") {
      token = formToken;
    }
  } catch {
    // Flow can also send the token as a query string.
  }

  if (!token) {
    const url = new URL(request.url);
    token = url.searchParams.get("token");
  }

  if (!token) {
    return NextResponse.json({ error: "token missing" }, { status: 400 });
  }

  try {
    const status = await getFlowPaymentStatus(token);
    const admin = createSupabaseAdminClient();

    if (!admin) {
      return NextResponse.json({ ok: true, skipped: "supabase-unconfigured" });
    }

    const repo = createSupabasePaymentRepository(admin);
    let paymentId: string | null = null;

    try {
      const optional = status.optional ? JSON.parse(status.optional) : null;
      paymentId = optional?.paymentId ?? null;
    } catch {
      paymentId = null;
    }

    if (!paymentId) {
      return NextResponse.json({ ok: true, skipped: "no-payment-id" });
    }

    await repo.updateStatus(paymentId, mapFlowStatus(status.status), token);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "flow confirm failed",
      },
      { status: 500 }
    );
  }
}
