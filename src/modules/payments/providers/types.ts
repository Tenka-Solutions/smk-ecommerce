import type { PaymentProvider } from "@/modules/payments/domain/payment";

export interface ProviderCheckoutInput {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: "CLP";
  returnUrl: string;
}

export interface ProviderCheckoutResult {
  provider: PaymentProvider;
  redirectUrl: string;
  providerReference: string | null;
}

export interface PaymentProviderGateway {
  readonly name: PaymentProvider;
  createCheckout(input: ProviderCheckoutInput): Promise<ProviderCheckoutResult>;
}
