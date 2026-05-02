const ordersRepository = require("../repositories/orders.repository");
const productsRepository = require("../repositories/products.repository");

async function discountStockFromSupabase(order) {
  const alreadyDiscounted = await ordersRepository.hasOrderEvent(
    order.id,
    "stock_discounted"
  );

  if (alreadyDiscounted) {
    return { discounted: false, warnings: ["Stock ya descontado para este pedido."] };
  }

  const detail = order.items ? order : await ordersRepository.getOrderDetail(order.id);
  const warnings = [];
  const changes = [];

  for (const item of detail.items || []) {
    const snapshot = item.product_snapshot || {};
    const productId = item.product_id || snapshot.id;

    if (!productId) {
      warnings.push(`Item ${item.name_snapshot} sin product_id.`);
      continue;
    }

    const product = await productsRepository.getProductById(productId);

    if (!product) {
      warnings.push(`Producto ${productId} no existe al descontar stock.`);
      continue;
    }

    const currentStock =
      product.stock_quantity === null || product.stock_quantity === undefined
        ? null
        : Number(product.stock_quantity);

    if (currentStock === null) {
      warnings.push(`Producto ${item.name_snapshot} sin stock_quantity controlado.`);
      continue;
    }

    const nextStock = Math.max(0, currentStock - Number(item.quantity || 0));

    if (currentStock < Number(item.quantity || 0)) {
      warnings.push(`Stock insuficiente al descontar ${item.name_snapshot}.`);
    }

    const updated = await productsRepository.updateProductStock(productId, nextStock);
    changes.push({
      productId,
      sku: item.sku_snapshot,
      name: item.name_snapshot,
      previousStock: currentStock,
      nextStock: updated ? updated.stock_quantity : nextStock,
      quantity: Number(item.quantity || 0),
    });
  }

  await ordersRepository.addOrderEvent(order.id, "stock_discounted", {
    changes,
    warnings,
  });

  if (warnings.length > 0) {
    await ordersRepository.addOrderEvent(order.id, "stock_discount_warning", {
      warnings,
    });
  }

  return { discounted: true, changes, warnings };
}

module.exports = {
  discountStockFromSupabase,
};
