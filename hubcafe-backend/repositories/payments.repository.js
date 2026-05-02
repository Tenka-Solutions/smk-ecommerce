const { requireSupabaseClient } = require("../lib/supabase-client");

async function createPaymentAttempt({ order, requestPayload = {} }) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from("payment_attempts")
    .insert({
      order_id: order.id,
      provider: "flow",
      reference: order.order_number,
      status: "pending",
      request_payload: {
        ...requestPayload,
        commerceOrder: order.order_number,
      },
      response_payload: {},
    })
    .select("*")
    .single();

  if (error) throw error;

  await supabase
    .from("orders")
    .update({ latest_payment_attempt_id: data.id })
    .eq("id", order.id);

  return data;
}

async function updatePaymentAttempt(id, patch) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from("payment_attempts")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

async function findFlowAttempt({ token, commerceOrder, reference }) {
  const supabase = requireSupabaseClient();

  if (reference || commerceOrder) {
    const { data, error } = await supabase
      .from("payment_attempts")
      .select("*")
      .eq("provider", "flow")
      .eq("reference", reference || commerceOrder)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;
  }

  if (token) {
    const { data, error } = await supabase
      .from("payment_attempts")
      .select("*")
      .eq("provider", "flow")
      .contains("response_payload", { token })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;
  }

  return null;
}

module.exports = {
  createPaymentAttempt,
  findFlowAttempt,
  updatePaymentAttempt,
};
