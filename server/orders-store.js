/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const dataDir = path.join(__dirname, "data");
const ordersFile = path.join(dataDir, "orders.json");
const stockFile = path.join(dataDir, "products-stock.json");

async function ensureJsonFile(filePath, fallback) {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.readFile(filePath, "utf8");
  } catch {
    await fs.writeFile(filePath, `${JSON.stringify(fallback, null, 2)}\n`, "utf8");
  }
}

async function readJson(filePath, fallback) {
  await ensureJsonFile(filePath, fallback);
  const raw = await fs.readFile(filePath, "utf8");

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function readOrders() {
  const orders = await readJson(ordersFile, []);
  return Array.isArray(orders) ? orders : [];
}

async function writeOrders(orders) {
  await writeJson(ordersFile, orders);
}

async function readStock() {
  const stock = await readJson(stockFile, {});

  if (Array.isArray(stock)) {
    return Object.fromEntries(
      stock.map((item) => [
        String(item.productId || item.id || item.sku),
        Number(item.stock || item.quantity || 0),
      ])
    );
  }

  return stock && typeof stock === "object" ? stock : {};
}

async function writeStock(stock) {
  await writeJson(stockFile, stock);
}

function generarCodigoPedido() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `SMK-${stamp}-${randomUUID().slice(0, 4).toUpperCase()}`;
}

async function listarPedidos() {
  return readOrders();
}

async function obtenerPedido(idOrCommerceOrder) {
  const orders = await readOrders();
  return (
    orders.find(
      (order) =>
        order.id === idOrCommerceOrder ||
        order.commerceOrder === idOrCommerceOrder
    ) || null
  );
}

async function guardarPedido(order) {
  const orders = await readOrders();
  orders.unshift(order);
  await writeOrders(orders);
  return order;
}

async function actualizarPedido(idOrCommerceOrder, updater) {
  const orders = await readOrders();
  const index = orders.findIndex(
    (order) =>
      order.id === idOrCommerceOrder ||
      order.commerceOrder === idOrCommerceOrder
  );

  if (index < 0) return null;

  const current = orders[index];
  const next = typeof updater === "function" ? updater(current) : updater;
  orders[index] = next;
  await writeOrders(orders);
  return next;
}

async function actualizarEstadoPedido(idOrCommerceOrder, patch) {
  return actualizarPedido(idOrCommerceOrder, (current) => {
    const now = new Date().toISOString();
    const estadoPago = patch.estadoPago || current.estadoPago;
    return {
      ...current,
      ...patch,
      estadoPago,
      paidAt: estadoPago === "PAGADO" ? current.paidAt || now : current.paidAt,
      updatedAt: now,
      historial: [
        ...(current.historial || []),
        {
          tipo: patch.eventType || "status_updated",
          fecha: now,
          detalle: patch.eventPayload || patch,
        },
      ],
    };
  });
}

async function descontarStockPedido(order) {
  const stock = await readStock();
  const cambios = [];

  for (const item of order.productos || []) {
    const productId = String(item.productId || item.sku || item.name);
    const actual = Number(stock[productId] ?? 0);
    const siguiente = Math.max(0, actual - Number(item.quantity || 0));
    stock[productId] = siguiente;
    cambios.push({
      productId,
      antes: actual,
      despues: siguiente,
      descontado: actual - siguiente,
    });
  }

  await writeStock(stock);

  return {
    descontado: true,
    cambios,
  };
}

module.exports = {
  actualizarEstadoPedido,
  actualizarPedido,
  descontarStockPedido,
  generarCodigoPedido,
  guardarPedido,
  listarPedidos,
  obtenerPedido,
};
