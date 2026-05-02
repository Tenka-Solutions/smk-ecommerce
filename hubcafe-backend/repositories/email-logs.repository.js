const { requireSupabaseClient } = require("../lib/supabase-client");

async function findEmailLog(orderId, templateKey) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from("email_logs")
    .select("*")
    .eq("order_id", orderId)
    .eq("template_key", templateKey)
    .eq("status", "sent")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function createEmailLog({
  orderId,
  quoteRequestId,
  templateKey,
  recipient,
  status,
  providerMessageId,
  errorMessage,
  payloadSnapshot,
}) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from("email_logs")
    .insert({
      order_id: orderId || null,
      quote_request_id: quoteRequestId || null,
      template_key: templateKey,
      recipient,
      provider_message_id: providerMessageId || null,
      status,
      error_message: errorMessage || null,
      sent_at: status === "sent" ? new Date().toISOString() : null,
      payload_snapshot: payloadSnapshot || {},
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  createEmailLog,
  findEmailLog,
};
