import type {
  OrderLookupPort,
  PayableOrder,
} from "@/modules/payments/domain/order-lookup";

const PLACEHOLDER_AMOUNT = 1000;

export function createMemoryOrderLookup(): OrderLookupPort {
  return {
    async getPayableOrder(orderId: string): Promise<PayableOrder | null> {
      if (!orderId) return null;
      return {
        id: orderId,
        orderNumber: `MEM-${orderId.slice(0, 8).toUpperCase()}`,
        amount: PLACEHOLDER_AMOUNT,
        currency: "CLP",
        customerEmail: "sandbox@smkvending.cl",
      };
    },
  };
}
