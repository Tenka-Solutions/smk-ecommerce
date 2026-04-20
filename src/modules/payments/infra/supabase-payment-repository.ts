import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Payment,
  PaymentProvider,
  PaymentStatus,
} from "@/modules/payments/domain/payment";
import type {
  CreatePaymentInput,
  PaymentRepository,
} from "@/modules/payments/domain/repository";

interface PaymentRow {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  provider_reference: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: PaymentRow): Payment {
  return {
    id: row.id,
    orderId: row.order_id,
    amount: row.amount,
    currency: row.currency as "CLP",
    status: row.status as PaymentStatus,
    provider: row.provider as PaymentProvider,
    providerReference: row.provider_reference,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function createSupabasePaymentRepository(
  client: SupabaseClient
): PaymentRepository {
  return {
    async create(payment: CreatePaymentInput): Promise<Payment> {
      const { data, error } = await client
        .from("payments")
        .insert({
          id: payment.id,
          order_id: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          provider: payment.provider,
          provider_reference: payment.providerReference,
        })
        .select("*")
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "Failed to insert payment");
      }

      return mapRow(data as PaymentRow);
    },

    async findById(id: string): Promise<Payment | null> {
      const { data, error } = await client
        .from("payments")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      return data ? mapRow(data as PaymentRow) : null;
    },

    async findByOrderId(orderId: string): Promise<Payment[]> {
      const { data, error } = await client
        .from("payments")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data ?? []).map((row) => mapRow(row as PaymentRow));
    },

    async updateStatus(
      id: string,
      status: PaymentStatus,
      providerReference?: string | null
    ): Promise<Payment | null> {
      const patch: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (providerReference !== undefined) {
        patch.provider_reference = providerReference;
      }

      const { data, error } = await client
        .from("payments")
        .update(patch)
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      return data ? mapRow(data as PaymentRow) : null;
    },
  };
}
