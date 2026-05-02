const { requireSupabaseClient } = require("../lib/supabase-client");
const { validateQuotePayload } = require("../lib/validators");
const productsRepository = require("../repositories/products.repository");
const { sendQuoteEmail } = require("./mail.service");

async function createQuoteRequest(payload) {
  const input = validateQuotePayload(payload);
  const supabase = requireSupabaseClient();
  let quoteRequest = null;
  let warning = null;

  try {
    const { data, error } = await supabase
      .from("quote_requests")
      .insert({
        name: input.customer.name,
        email: input.customer.email,
        phone: input.customer.phone,
        company: input.customer.companyName,
        message: input.message || "Solicitud desde Hub Cafe",
        status: "new",
      })
      .select("*")
      .single();

    if (error) throw error;
    quoteRequest = data;

    const productMatches = await productsRepository.findProductsForCart(input.cart);
    await supabase.from("quote_request_items").insert(
      productMatches.map(({ cartItem, product }) => ({
        quote_request_id: quoteRequest.id,
        product_id: product ? product.id : null,
        product_snapshot: {
          ...(product || {}),
          requestedQuantity: cartItem.quantity,
          requestedId: cartItem.id,
          requestedSku: cartItem.sku,
        },
      }))
    );
  } catch (error) {
    warning = error instanceof Error ? error.message : String(error);
  }

  await sendQuoteEmail({
    customer: input.customer,
    cart: input.cart,
    message: input.message,
    quoteRequestId: quoteRequest && quoteRequest.id,
  });

  return {
    ok: true,
    quoteRequest,
    warning,
  };
}

module.exports = {
  createQuoteRequest,
};
