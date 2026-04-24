import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!url || !key) {
  console.error("Missing SUPABASE env");
  process.exit(1);
}

const supabase = createClient(url, key);

const orderNumber = `SMK-TEST-${Date.now()}`;

const { data: order, error: orderError } = await supabase
  .from("orders")
  .insert({
    order_number: orderNumber,
    customer_email: "test@smkvending.cl",
    customer_name: "Test User",
    phone: "+56912345678",
    subtotal_tax_inc: 1500,
    total_tax_inc: 1500,
    payment_status: "pending",
    order_status: "pending",
  })
  .select("id, order_number, total_tax_inc")
  .single();

if (orderError) {
  console.error("Order insert failed:", orderError);
  process.exit(1);
}

console.log("Order created:", order);

const response = await fetch("http://localhost:3000/api/payments/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ orderId: order.id, method: "flow" }),
});

const result = await response.json();
console.log("Create payment status:", response.status);
console.log("Result:", result);

if (result.redirectUrl) {
  console.log("\n>>> Open this URL in your browser to pay:");
  console.log(result.redirectUrl);
}
