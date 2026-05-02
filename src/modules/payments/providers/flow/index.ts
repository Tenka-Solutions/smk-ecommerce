import { createHmac } from "node:crypto";
import { env } from "@/lib/env";
import type {
  PaymentProviderGateway,
  ProviderCheckoutInput,
  ProviderCheckoutResult,
} from "@/modules/payments/providers/types";

// ✅ Accept number + string
export function signParams(
  params: Record<string, string | number>,
  secret: string
): string {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHmac("sha256", secret).update(sorted).digest("hex");
}

interface FlowCreateResponse {
  url: string;
  token: string;
  flowOrder: number;
}

export const flowPaymentProvider: PaymentProviderGateway = {
  name: "flow",

  async createCheckout(
    input: ProviderCheckoutInput
  ): Promise<ProviderCheckoutResult> {
    // ✅ Ensure required values
    if (!env.flowApiKey || !env.flowSecretKey) {
      throw new Error("Flow env not configured");
    }

    if (!input.amount || input.amount <= 0) {
      throw new Error("Invalid amount");
    }

    // ✅ FORCE SAFE VALUES (prevents Flow 101)
    const params: Record<string, string | number> = {
      apiKey: env.flowApiKey,

      // ⚠️ MUST be unique
      commerceOrder: input.orderNumber,

      subject: `Pago pedido ${input.orderNumber}`,
      currency: "CLP",

      // ✅ MUST be number for signature
      amount: Math.round(input.amount),

      // ⚠️ ALWAYS valid email
      email: input.customerEmail ?? "test@hubcafe.cl",

      // ⚠️ MUST be PUBLIC URLs (accessible by Flow)
      urlConfirmation: env.flowConfirmUrl,
      urlReturn: env.flowReturnUrl,
    };

    // ✅ Only add optional if valid
    if (input.paymentId) {
      params.optional = JSON.stringify({
        paymentId: input.paymentId,
        orderId: input.orderId,
        orderNumber: input.orderNumber,
      });
    }

    // ✅ Generate signature AFTER params are final
    const signature = signParams(params, env.flowSecretKey);

    // ✅ Convert to string ONLY here
    const body = new URLSearchParams(
      Object.fromEntries(
        Object.entries({ ...params, s: signature }).map(([k, v]) => [
          k,
          String(v),
        ])
      )
    );

    const response = await fetch(`${env.flowApiUrl}/payment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Flow create failed (${response.status}): ${text}`);
    }

    let data: FlowCreateResponse;

    try {
      data = JSON.parse(text) as FlowCreateResponse;
    } catch {
      throw new Error(`Flow create returned non-JSON: ${text}`);
    }

    return {
      provider: "flow",
      redirectUrl: `${data.url}?token=${data.token}`,
      providerReference: data.token,
    };
  },
};

// ✅ STATUS CHECK (unchanged but cleaned)
export async function getFlowPaymentStatus(token: string) {
  const params: Record<string, string> = {
    apiKey: env.flowApiKey,
    token,
  };

  const signature = signParams(params, env.flowSecretKey);

  const query = new URLSearchParams({
    ...params,
    s: signature,
  });

  const response = await fetch(
    `${env.flowApiUrl}/payment/getStatus?${query.toString()}`,
    { method: "GET" }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Flow getStatus failed (${response.status}): ${text}`);
  }

  return JSON.parse(text) as {
    flowOrder: number;
    commerceOrder: string;
    status: number;
    amount: number;
    payer?: string;
    optional?: string;
  };
}
