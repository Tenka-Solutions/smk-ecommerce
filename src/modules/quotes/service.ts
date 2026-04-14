import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCatalogProducts } from "@/modules/catalog/repository";
import { sendQuoteNotificationEmail } from "@/modules/orders/notifications";
import { QuoteRequestInput } from "@/modules/quotes/schema";

export interface QuoteRequestAdminRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string | null;
}

export async function createQuoteRequest(input: QuoteRequestInput) {
  const products = input.productIds.length ? await getCatalogProducts() : [];
  const selectedProducts = products
    .filter((product) => input.productIds.includes(product.id))
    .map((product) => product.name);

  const adminClient = createSupabaseAdminClient();
  const fallbackId = randomUUID();

  if (!adminClient) {
    await sendQuoteNotificationEmail({
      quoteRequestId: fallbackId,
      input,
      selectedProducts,
    });

    return {
      id: fallbackId,
      source: "mock" as const,
      selectedProducts,
    };
  }

  const { data: quoteRow, error } = await adminClient
    .from("quote_requests")
    .insert({
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company ?? null,
      message: input.message,
      status: "new",
    })
    .select("id")
    .single();

  const quoteRequestId = quoteRow?.id ?? fallbackId;

  if (!error && quoteRow && input.productIds.length) {
    const snapshotRows = products
      .filter((product) => input.productIds.includes(product.id))
      .map((product) => ({
        quote_request_id: quoteRow.id,
        product_id: product.id,
        product_snapshot: product,
      }));

    if (snapshotRows.length) {
      await adminClient.from("quote_request_items").insert(snapshotRows);
    }
  }

  await sendQuoteNotificationEmail({
    quoteRequestId,
    input,
    selectedProducts,
  });

  return {
    id: quoteRequestId,
    source: error || !quoteRow ? ("mock" as const) : ("supabase" as const),
    selectedProducts,
  };
}

export async function listQuoteRequestsForAdmin() {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return [];
  }

  const { data } = await adminClient
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return ((data ?? []) as QuoteRequestAdminRow[]);
}
