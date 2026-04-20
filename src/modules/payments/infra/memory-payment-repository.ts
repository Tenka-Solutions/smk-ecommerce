import type {
  Payment,
  PaymentStatus,
} from "@/modules/payments/domain/payment";
import type {
  CreatePaymentInput,
  PaymentRepository,
} from "@/modules/payments/domain/repository";

const store = new Map<string, Payment>();

export function createMemoryPaymentRepository(): PaymentRepository {
  return {
    async create(payment: CreatePaymentInput): Promise<Payment> {
      const now = new Date();
      const record: Payment = {
        ...payment,
        createdAt: now,
        updatedAt: now,
      };
      store.set(record.id, record);
      return record;
    },

    async findById(id: string): Promise<Payment | null> {
      return store.get(id) ?? null;
    },

    async findByOrderId(orderId: string): Promise<Payment[]> {
      return [...store.values()]
        .filter((p) => p.orderId === orderId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    async updateStatus(
      id: string,
      status: PaymentStatus,
      providerReference?: string | null
    ): Promise<Payment | null> {
      const current = store.get(id);
      if (!current) return null;
      const next: Payment = {
        ...current,
        status,
        providerReference:
          providerReference === undefined
            ? current.providerReference
            : providerReference,
        updatedAt: new Date(),
      };
      store.set(id, next);
      return next;
    },
  };
}
