import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { getAuthenticatedUser } from "@/modules/auth/server";
import { checkoutPayloadSchema } from "@/modules/checkout/schema";
import { createOrderDraft } from "@/modules/orders/service";
import { buildPaymentDeps } from "@/modules/payments/factory";
import {
  OrderNotFoundError,
  UnsupportedProviderError,
  createPayment,
} from "@/modules/payments/use-cases/create-payment";

const bodySchema = checkoutPayloadSchema.extend({
  method: z
    .enum(["flow", "mercadopago", "santander", "mock"])
    .default("flow"),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = bodySchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const user = await getAuthenticatedUser();
    const order = await createOrderDraft({
      customer: parsed.data.customer,
      shipping: parsed.data.shipping,
      items: parsed.data.items,
      userId: user?.id ?? null,
    });

    if (order.source !== "supabase") {
      return NextResponse.json(
        { error: "Supabase no configurado" },
        { status: 500 }
      );
    }

    const deps = buildPaymentDeps();
    const result = await createPayment(deps, {
      orderId: order.id,
      method: parsed.data.method,
      returnUrl: `${env.siteUrl}/compra/exito`,
    });

    return NextResponse.json({
      orderNumber: order.orderNumber,
      redirectUrl: result.redirectUrl,
      paymentId: result.paymentId,
      provider: result.payment.provider,
    });
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof UnsupportedProviderError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
