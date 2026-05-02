/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const DATA_DIR = path.join(__dirname, "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const STOCK_FILE = path.join(DATA_DIR, "products-stock.json");

function nowIso() {
  return new Date().toISOString();
}

function buildOrderNumber(date = new Date()) {
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = randomUUID().replace(/-/g, "").slice(0, 4).toUpperCase();
  return `SMK-${stamp}-${suffix}`;
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempFile = `${filePath}.tmp`;
  await fs.writeFile(tempFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await fs.rename(tempFile, filePath);
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      await writeJson(filePath, fallback);
    }
    return fallback;
  }
}

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await readJson(ORDERS_FILE, { orders: [] });
  await readJson(STOCK_FILE, { products: [] });
  return true;
}

async function readOrders() {
  await ensureStore();
  const data = await readJson(ORDERS_FILE, { orders: [] });

  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.orders)) {
    return data.orders;
  }

  return [];
}

async function saveOrders(ordersOrData) {
  const orders = Array.isArray(ordersOrData)
    ? ordersOrData
    : ordersOrData && Array.isArray(ordersOrData.orders)
      ? ordersOrData.orders
      : [];
  await writeJson(ORDERS_FILE, { orders });
  return orders;
}

function addOrderEvent(order, type, message, meta) {
  const event = {
    id: randomUUID(),
    type,
    message,
    meta: meta || {},
    createdAt: nowIso(),
  };

  order.events = Array.isArray(order.events) ? order.events : [];
  order.events.push(event);
  return event;
}

async function createOrder(orderInput) {
  const orders = await readOrders();
  const createdAt = nowIso();
  const orderNumber = orderInput.orderNumber || buildOrderNumber();
  const order = {
    id: orderInput.id || randomUUID(),
    orderNumber,
    commerceOrder: orderInput.commerceOrder || orderNumber,
    customer: orderInput.customer,
    cart: orderInput.cart,
    total: orderInput.total,
    paymentStatus: orderInput.paymentStatus || "PENDIENTE_PAGO",
    managementStatus: orderInput.managementStatus || "NUEVO",
    flowToken: orderInput.flowToken || "",
    flowPaymentId: orderInput.flowPaymentId || "",
    stockDiscounted: Boolean(orderInput.stockDiscounted),
    paidEmailSent: Boolean(orderInput.paidEmailSent),
    events: Array.isArray(orderInput.events) ? orderInput.events : [],
    createdAt: orderInput.createdAt || createdAt,
    updatedAt: orderInput.updatedAt || createdAt,
    paidAt: orderInput.paidAt || "",
  };

  addOrderEvent(order, "ORDER_CREATED", "Pedido interno creado", {
    source: orderInput.source || "api",
  });
  orders.unshift(order);
  await saveOrders(orders);
  return order;
}

function matchesOrder(order, idOrOrderNumber) {
  return (
    order.id === idOrOrderNumber ||
    order.orderNumber === idOrOrderNumber ||
    order.commerceOrder === idOrOrderNumber
  );
}

function orderSearchText(order) {
  return [
    order.id,
    order.orderNumber,
    order.commerceOrder,
    order.customer && order.customer.name,
    order.customer && order.customer.email,
    order.customer && order.customer.phone,
    ...(Array.isArray(order.cart)
      ? order.cart.flatMap((item) => [item.id, item.sku, item.name])
      : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

async function listOrders(filters = {}) {
  const query = String(filters.q || "").trim().toLowerCase();
  const orders = await readOrders();

  return orders
    .filter((order) => {
      if (filters.paymentStatus && order.paymentStatus !== filters.paymentStatus) {
        return false;
      }
      if (
        filters.managementStatus &&
        order.managementStatus !== filters.managementStatus
      ) {
        return false;
      }
      if (query && !orderSearchText(order).includes(query)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

async function getOrder(idOrOrderNumber) {
  const orders = await readOrders();
  return orders.find((order) => matchesOrder(order, idOrOrderNumber)) || null;
}

async function updateOrder(idOrOrderNumber, updater) {
  const orders = await readOrders();
  const index = orders.findIndex((order) => matchesOrder(order, idOrOrderNumber));

  if (index < 0) {
    return null;
  }

  const current = orders[index];
  const draft = JSON.parse(JSON.stringify(current));
  const updated = typeof updater === "function" ? updater(draft) || draft : updater;

  updated.updatedAt = nowIso();
  orders[index] = updated;
  await saveOrders(orders);
  return updated;
}

async function setManagementStatus(idOrOrderNumber, status) {
  return updateOrder(idOrOrderNumber, (order) => {
    const previousStatus = order.managementStatus;
    order.managementStatus = status;
    addOrderEvent(order, "MANAGEMENT_STATUS_UPDATED", "Estado de gestion actualizado", {
      previousStatus,
      status,
    });
    return order;
  });
}

async function markOrderAsPaid(idOrOrderNumber, paymentData = {}) {
  return updateOrder(idOrOrderNumber, (order) => {
    const wasPaid = order.paymentStatus === "PAGADO";
    order.paymentStatus = "PAGADO";
    order.paidAt = order.paidAt || nowIso();
    order.flowToken = paymentData.token || order.flowToken || "";
    order.flowPaymentId = paymentData.flowPaymentId || order.flowPaymentId || "";
    order.payment = paymentData.summary || order.payment || {};
    addOrderEvent(order, "PAYMENT_PAID", wasPaid ? "Pago ya estaba confirmado" : "Pago confirmado", {
      wasPaid,
      payment: paymentData.summary || {},
    });
    return order;
  });
}

module.exports = {
  ensureStore,
  readOrders,
  saveOrders,
  createOrder,
  listOrders,
  getOrder,
  updateOrder,
  setManagementStatus,
  addOrderEvent,
  markOrderAsPaid,
  DATA_DIR,
  ORDERS_FILE,
  STOCK_FILE,
};
