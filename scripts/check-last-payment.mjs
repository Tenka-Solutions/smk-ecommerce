import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from("payments")
  .select("id, order_id, status, provider, provider_reference, updated_at")
  .order("created_at", { ascending: false })
  .limit(3);

if (error) {
  console.error(error);
  process.exit(1);
}

console.log("Last 3 payments:");
console.table(data);
