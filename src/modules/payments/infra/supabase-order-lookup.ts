import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  OrderLookupPort,
  PayableOrder,
} from "@/modules/payments/domain/order-lookup";

export function createSupabaseOrderLookup(
  client: SupabaseClient
): OrderLookupPort {
  return {
    async getPayableOrder(orderId: string): Promise<PayableOrder | null> {
      const { data, error } = await client
        .from("orders")
        .select("id, total_tax_inc")
        .eq("id", orderId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id as string,
        amount: Math.round(Number(data.total_tax_inc ?? 0)),
        currency: "CLP",
      };
    },
  };
}
