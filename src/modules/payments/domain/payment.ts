export type PaymentStatus = "pending" | "paid" | "failed";

export type PaymentProvider = "mock" | "mercadopago" | "flow" | "santander";

export type PaymentCurrency = "CLP";

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: PaymentCurrency;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerReference: string | null;
  createdAt: Date;
  updatedAt: Date;
}
