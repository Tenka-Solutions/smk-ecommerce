import { env, isGetnetConfigured } from "@/lib/env";

export interface GetnetCreateCheckoutInput {
  orderNumber: string;
  amount: number;
  customerEmail: string;
  description: string;
  returnUrl: string;
  webhookUrl: string;
  reference: string;
}

export interface GetnetCheckoutResult {
  provider: "getnet" | "mock";
  reference: string;
  redirectUrl: string;
  rawResponse?: unknown;
}

export async function createGetnetCheckout(
  input: GetnetCreateCheckoutInput
): Promise<GetnetCheckoutResult> {
  if (!isGetnetConfigured()) {
    return {
      provider: "mock",
      reference: input.reference,
      redirectUrl: `${env.siteUrl}/api/payments/getnet/return?status=paid&mode=mock&order=${input.orderNumber}&reference=${input.reference}`,
    };
  }

  throw new Error(
    "La integracion productiva de Getnet requiere credenciales y payload definitivo del comercio."
  );
}
