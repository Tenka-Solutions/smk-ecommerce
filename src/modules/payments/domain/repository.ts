import type { Payment, PaymentStatus } from "./payment";

export type CreatePaymentInput = Omit<Payment, "createdAt" | "updatedAt">;

export interface PaymentRepository {
  create(payment: CreatePaymentInput): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByOrderId(orderId: string): Promise<Payment[]>;
  updateStatus(
    id: string,
    status: PaymentStatus,
    providerReference?: string | null
  ): Promise<Payment | null>;
}
