import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { buildPaymentDeps } from "@/modules/payments/factory";
import {
  OrderNotFoundError,
  UnsupportedProviderError,
  createPayment,
} from "@/modules/payments/use-cases/create-payment";

const bodySchema = z.object({
  orderId: z.string().min(1, "orderId requerido"),
  method: z.enum(["mock", "mercadopago", "flow", "santander"]).default("mock"),
  returnUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Payload inválido" },
        { status: 400 }
      );
    }

    const { orderId, method } = parsed.data;
    const returnUrl =
      parsed.data.returnUrl ?? `${env.siteUrl}/checkout/success`;

    const deps = buildPaymentDeps();
    const result = await createPayment(deps, {
      orderId,
      method,
      returnUrl,
    });

    return NextResponse.json({
      paymentId: result.paymentId,
      redirectUrl: result.redirectUrl,
      status: result.payment.status,
      provider: result.payment.provider,
      providerReference: result.payment.providerReference,
    });
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof UnsupportedProviderError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No pudimos crear el pago.",
      },
      { status: 500 }
    );
  }
}
