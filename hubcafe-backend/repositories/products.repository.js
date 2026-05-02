const { requireSupabaseClient } = require("../lib/supabase-client");

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

async function findProductsForCart(cart) {
  const supabase = requireSupabaseClient();
  const ids = unique(cart.map((item) => item.id));
  const skus = unique(cart.map((item) => item.sku));
  const productsByKey = new Map();

  if (ids.length > 0) {
    const { data, error } = await supabase.from("products").select("*").in("id", ids);
    if (error) throw error;
    (data || []).forEach((product) => {
      productsByKey.set(`id:${product.id}`, product);
      if (product.sku) productsByKey.set(`sku:${product.sku}`, product);
    });
  }

  if (skus.length > 0) {
    const { data, error } = await supabase.from("products").select("*").in("sku", skus);
    if (error) throw error;
    (data || []).forEach((product) => {
      productsByKey.set(`id:${product.id}`, product);
      if (product.sku) productsByKey.set(`sku:${product.sku}`, product);
    });
  }

  return cart.map((item) => ({
    cartItem: item,
    product:
      (item.id && productsByKey.get(`id:${item.id}`)) ||
      (item.sku && productsByKey.get(`sku:${item.sku}`)) ||
      null,
  }));
}

async function updateProductStock(productId, nextStock) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .update({ stock_quantity: nextStock })
    .eq("id", productId)
    .select("id, sku, name, stock_quantity")
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getProductById(productId) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

module.exports = {
  findProductsForCart,
  getProductById,
  updateProductStock,
};
