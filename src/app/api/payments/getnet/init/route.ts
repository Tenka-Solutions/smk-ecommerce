import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/modules/auth/server";
import { checkoutPayloadSchema } from "@/modules/checkout/schema";
import { createOrderDraft } from "@/modules/orders/service";
import { createPaymentAttempt } from "@/modules/payments/service";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = checkoutPayloadSchema.safeParse(payload);

    if (!result.success) {
      return NextResponse.json(
        {
          error:
            result.error.issues[0]?.message ??
            "No fue posible validar el checkout.",
        },
        { status: 400 }
      );
    }

    const user = await getAuthenticatedUser();
    const order = await createOrderDraft({
      customer: result.data.customer,
      shipping: result.data.shipping,
      items: result.data.items,
      userId: user?.id ?? null,
    });

    const description = order.items
      .slice(0, 3)
      .map((item) => item.name)
      .join(", ");

    const payment = await createPaymentAttempt({
      orderId: order.source === "supabase" ? order.id : null,
      orderNumber: order.orderNumber,
      amount: order.totalTaxInc,
      customerEmail: order.customerEmail,
      description:
        description || `Pedido ${order.orderNumber} en ecommerce SMK Vending`,
    });

    return NextResponse.json({
      orderNumber: order.orderNumber,
      redirectUrl: payment.redirectUrl,
      reference: payment.reference,
      provider: payment.provider,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No pudimos iniciar el pago.",
      },
      { status: 500 }
    );
  }
}
