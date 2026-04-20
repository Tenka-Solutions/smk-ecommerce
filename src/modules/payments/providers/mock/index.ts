import { randomUUID } from "node:crypto";
import type {
  PaymentProviderGateway,
  ProviderCheckoutInput,
  ProviderCheckoutResult,
} from "@/modules/payments/providers/types";

export const mockPaymentProvider: PaymentProviderGateway = {
  name: "mock",
  async createCheckout(
    input: ProviderCheckoutInput
  ): Promise<ProviderCheckoutResult> {
    const providerReference = `MOCK-${randomUUID().slice(0, 8).toUpperCase()}`;

    const url = new URL(input.returnUrl);
    url.searchParams.set("paymentId", input.paymentId);
    url.searchParams.set("providerReference", providerReference);
    url.searchParams.set("status", "success");

    return {
      provider: "mock",
      redirectUrl: url.toString(),
      providerReference,
    };
  },
};
