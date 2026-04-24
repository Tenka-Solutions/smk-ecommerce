import { createHmac } from "node:crypto";
import { env } from "@/lib/env";
import type {
  PaymentProviderGateway,
  ProviderCheckoutInput,
  ProviderCheckoutResult,
} from "@/modules/payments/providers/types";

function signParams(params: Record<string, string>, secret: string): string {
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
    const params: Record<string, string> = {
      apiKey: env.flowApiKey,
      commerceOrder: input.orderNumber,
      subject: `Pago pedido ${input.orderNumber}`,
      currency: "CLP",
      amount: String(Math.round(input.amount)),
      email: input.customerEmail || "sandbox@smkvending.cl",
      paymentMethod: "9",
      urlConfirmation: env.flowConfirmUrl,
      urlReturn: env.flowReturnUrl,
      optional: JSON.stringify({ paymentId: input.paymentId }),
    };

    const signature = signParams(params, env.flowSecretKey);

    const body = new URLSearchParams({ ...params, s: signature });

    const response = await fetch(`${env.flowApiUrl}/payment/create`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
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

export async function getFlowPaymentStatus(token: string) {
  const params: Record<string, string> = {
    apiKey: env.flowApiKey,
    token,
  };
  const signature = signParams(params, env.flowSecretKey);
  const query = new URLSearchParams({ ...params, s: signature });

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
