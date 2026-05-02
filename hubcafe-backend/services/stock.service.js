const { requireSupabaseClient } = require("../lib/supabase-client");

async function discountStockFromSupabase(order) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase.rpc("hubcafe_discount_order_stock_once", {
    p_order_id: order.id,
  });

  if (error) throw error;
  return data || { discounted: false, changes: [], warnings: [] };
}

module.exports = {
  discountStockFromSupabase,
};
