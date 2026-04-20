import { randomUUID } from "node:crypto";
import type {
  Payment,
  PaymentProvider,
} from "@/modules/payments/domain/payment";
import type { PaymentRepository } from "@/modules/payments/domain/repository";
import type { OrderLookupPort } from "@/modules/payments/domain/order-lookup";
import type { PaymentProviderGateway } from "@/modules/payments/providers/types";

export interface CreatePaymentInput {
  orderId: string;
  method: PaymentProvider;
  returnUrl: string;
}

export interface CreatePaymentOutput {
  paymentId: string;
  redirectUrl: string;
  payment: Payment;
}

export interface CreatePaymentDeps {
  paymentRepository: PaymentRepository;
  orderLookup: OrderLookupPort;
  providers: Partial<Record<PaymentProvider, PaymentProviderGateway>>;
}

export class OrderNotFoundError extends Error {
  constructor(orderId: string) {
    super(`Order ${orderId} not found`);
    this.name = "OrderNotFoundError";
  }
}

export class UnsupportedProviderError extends Error {
  constructor(provider: PaymentProvider) {
    super(`Payment provider "${provider}" is not available`);
    this.name = "UnsupportedProviderError";
  }
}

export async function createPayment(
  deps: CreatePaymentDeps,
  input: CreatePaymentInput
): Promise<CreatePaymentOutput> {
  const provider = deps.providers[input.method];
  if (!provider) {
    throw new UnsupportedProviderError(input.method);
  }

  const order = await deps.orderLookup.getPayableOrder(input.orderId);
  if (!order) {
    throw new OrderNotFoundError(input.orderId);
  }

  const paymentId = randomUUID();

  const pending = await deps.paymentRepository.create({
    id: paymentId,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    status: "pending",
    provider: input.method,
    providerReference: null,
  });

  const checkout = await provider.createCheckout({
    paymentId,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    returnUrl: input.returnUrl,
  });

  const updated =
    (await deps.paymentRepository.updateStatus(
      paymentId,
      "pending",
      checkout.providerReference
    )) ?? pending;

  return {
    paymentId,
    redirectUrl: checkout.redirectUrl,
    payment: updated,
  };
}
