/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("node:crypto");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const {
  STOCK_FILE,
  addOrderEvent,
  createOrder,
  ensureStore,
  getOrder,
  listOrders,
  markOrderAsPaid,
  setManagementStatus,
  updateOrder,
} = require("./orders-store");

loadEnvFile(path.join(__dirname, ".env"));

const app = express();
const PORT = Number(process.env.PORT || 3001);
const FLOW_WEBHOOK_PATH = "/api/payments/flow/webhook";
const FLOW_CONFIRM_PATH = "/api/payments/flow/confirm";
const FLOW_RETURN_PATH = "/api/payments/flow/return";
const DEFAULT_FLOW_BASE_URL = "https://www.flow.cl/api";
const DEFAULT_RETURN_URL = "https://hubcafe.cl/pago-confirmado";

const PAYMENT_STATUSES = ["PENDIENTE_PAGO", "PAGADO", "RECHAZADO", "ANULADO"];
const MANAGEMENT_STATUSES = [
  "NUEVO",
  "EN_PREPARACION",
  "LISTO_PARA_DESPACHO",
  "DESPACHADO",
  "CANCELADO",
];

app.use(cors({ origin: buildCorsOrigin() }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

function buildCorsOrigin() {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || process.env.CORS_ORIGIN || "*";

  if (allowedOrigin === "*" || allowedOrigin === "true") {
    return true;
  }

  const allowed = allowedOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return (origin, callback) => {
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origen no permitido por CORS"));
  };
}

function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex < 0) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function createTransporter() {
  if (!process.env.SMTP_HOST) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: ["true", "1", "yes"].includes(
      String(process.env.SMTP_SECURE || "true").toLowerCase()
    ),
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.QUOTE_TO_EMAIL
  );
}

function isFlowConfigured() {
  return Boolean(process.env.FLOW_API_KEY && process.env.FLOW_SECRET_KEY);
}

function getFlowBaseUrl() {
  return (process.env.FLOW_BASE_URL || DEFAULT_FLOW_BASE_URL).replace(/\/$/, "");
}

function signFlowParams(params) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join("");

  return crypto
    .createHmac("sha256", process.env.FLOW_SECRET_KEY || "")
    .update(payload)
    .digest("hex");
}

async function requestFlow(endpoint, params, method = "POST") {
  if (!isFlowConfigured()) {
    throw new Error("Flow no esta configurado.");
  }

  if (typeof fetch !== "function") {
    throw new Error("Este backend requiere Node.js 18 o superior para usar fetch con Flow.");
  }

  const signedParams = {
    ...params,
    apiKey: process.env.FLOW_API_KEY,
  };
  signedParams.s = signFlowParams(signedParams);

  const body = new URLSearchParams();
  Object.entries(signedParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      body.append(key, String(value));
    }
  });

  const url = `${getFlowBaseUrl()}${endpoint}`;
  const requestUrl = method === "GET" ? `${url}?${body.toString()}` : url;
  const response = await fetch(requestUrl, {
    method,
    headers:
      method === "GET"
        ? undefined
        : { "Content-Type": "application/x-www-form-urlencoded" },
    body: method === "GET" ? undefined : body,
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Flow respondio ${response.status}: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Flow respondio un cuerpo invalido: ${text}`);
  }
}

async function createFlowPayment(order) {
  const params = {
    commerceOrder: order.commerceOrder,
    subject: `Pedido ${order.orderNumber}`,
    currency: "CLP",
    amount: Math.round(order.total),
    email: order.customer.email,
    urlConfirmation:
      process.env.FLOW_CONFIRMATION_URL ||
      `https://smkvending.cl${FLOW_WEBHOOK_PATH}`,
    urlReturn: process.env.FLOW_RETURN_URL || DEFAULT_RETURN_URL,
    optional: JSON.stringify({ orderId: order.id, orderNumber: order.orderNumber }),
  };
  const data = await requestFlow("/payment/create", params, "POST");

  return {
    token: data.token || "",
    flowPaymentId: data.flowOrder ? String(data.flowOrder) : "",
    paymentUrl: data.url && data.token ? `${data.url}?token=${data.token}` : null,
    raw: data,
  };
}

async function getFlowPaymentStatus(token) {
  return requestFlow("/payment/getStatus", { token }, "GET");
}

function mapFlowPaymentStatus(status) {
  const numericStatus = Number(status);
  if (numericStatus === 2) return "PAGADO";
  if (numericStatus === 3) return "RECHAZADO";
  if (numericStatus === 4) return "ANULADO";
  return "PENDIENTE_PAGO";
}

function getFlowToken(req) {
  return (
    (req.body && req.body.token) ||
    (req.query && req.query.token) ||
    ""
  ).toString();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeCustomer(payload) {
  const input = payload.customer || payload.cliente || payload;
  const name = String(input.name || input.nombre || input.fullName || "").trim();
  const email = normalizeEmail(input.email || input.correo);
  const phone = String(input.phone || input.telefono || "").trim();
  const message = String(input.message || input.mensaje || payload.message || "").trim();

  if (!name) throw new Error("El nombre del cliente es requerido.");
  if (!validateEmail(email)) throw new Error("El correo del cliente es invalido.");
  if (!phone) throw new Error("El telefono del cliente es requerido.");

  return { name, email, phone, message };
}

function normalizeCart(payload) {
  const input = payload.cart || payload.carrito || payload.items || payload.productos;

  if (!Array.isArray(input) || input.length === 0) {
    throw new Error("El carrito es requerido.");
  }

  return input.map((item, index) => {
    const name = String(item.name || item.nombre || item.title || "").trim();
    const id = String(item.id || item.productId || item.product_id || item.sku || name).trim();
    const sku = String(item.sku || item.codigo || item.code || "").trim();
    const quantity = Math.round(Number(item.quantity || item.cantidad || 0));
    const rawPrice =
      item.price ??
      item.precio ??
      item.unitPriceTaxInc ??
      item.priceClpTaxInc ??
      item.lineTotalTaxInc;
    const price = Math.round(Number(rawPrice || 0));

    if (!name) throw new Error(`El producto ${index + 1} no tiene nombre.`);
    if (!quantity || quantity <= 0) {
      throw new Error(`La cantidad de ${name} es invalida.`);
    }
    if (!Number.isFinite(price) || price < 0) {
      throw new Error(`El precio de ${name} es invalido.`);
    }

    return { id, sku, name, quantity, price };
  });
}

function calculateCartTotal(cart) {
  return cart.reduce((total, item) => total + item.quantity * item.price, 0);
}

function validatePayload(payload) {
  const customer = normalizeCustomer(payload || {});
  const cart = normalizeCart(payload || {});
  const calculatedTotal = calculateCartTotal(cart);
  const submittedTotal = Number(payload && payload.total);
  const total =
    Number.isFinite(submittedTotal) && submittedTotal > 0
      ? Math.round(submittedTotal)
      : calculatedTotal;

  if (total !== calculatedTotal) {
    return { customer, cart, total: calculatedTotal };
  }

  return { customer, cart, total };
}

function buildTextMail(order) {
  const lines = [
    `Pedido: ${order.orderNumber}`,
    `Cliente: ${order.customer.name}`,
    `Email: ${order.customer.email}`,
    `Telefono: ${order.customer.phone}`,
    `Total: ${formatCurrency(order.total)}`,
    "",
    "Productos:",
    ...order.cart.map(
      (item) =>
        `- ${item.quantity} x ${item.name} (${item.sku || item.id}): ${formatCurrency(
          item.price * item.quantity
        )}`
    ),
  ];

  if (order.customer.message) {
    lines.push("", `Mensaje: ${order.customer.message}`);
  }

  return lines.join("\n");
}

function buildHtmlMail(order, options = {}) {
  const rows = order.cart
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e8e2d8;">${escapeHtml(item.name)}</td>
          <td style="padding:8px;border-bottom:1px solid #e8e2d8;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #e8e2d8;text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");
  const adminLink = process.env.ADMIN_PANEL_URL
    ? `<p><strong>Panel admin:</strong> <a href="${escapeHtml(process.env.ADMIN_PANEL_URL)}">${escapeHtml(process.env.ADMIN_PANEL_URL)}</a></p>`
    : "";
  const whatsappPhone = String(order.customer.phone || "").replace(/\D/g, "");
  const whatsappLink = whatsappPhone
    ? `<p><strong>WhatsApp:</strong> <a href="https://wa.me/${escapeHtml(whatsappPhone)}">Abrir chat</a></p>`
    : "";

  return `
    <div style="font-family:Arial,sans-serif;color:#211a14;line-height:1.45;">
      <h1>${escapeHtml(options.title || `Pedido ${order.orderNumber}`)}</h1>
      <p>${escapeHtml(options.intro || "Se registro un pedido en Hub Cafe.")}</p>
      <p><strong>Codigo pedido:</strong> ${escapeHtml(order.orderNumber)}</p>
      <p><strong>Cliente:</strong> ${escapeHtml(order.customer.name)}</p>
      <p><strong>Telefono:</strong> ${escapeHtml(order.customer.phone)}</p>
      <p><strong>Email:</strong> ${escapeHtml(order.customer.email)}</p>
      <p><strong>Fecha de pago:</strong> ${escapeHtml(order.paidAt || "Pendiente")}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr>
            <th align="left" style="padding:8px;border-bottom:2px solid #211a14;">Producto</th>
            <th style="padding:8px;border-bottom:2px solid #211a14;">Cantidad</th>
            <th align="right" style="padding:8px;border-bottom:2px solid #211a14;">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="font-size:18px;"><strong>Total:</strong> ${formatCurrency(order.total)}</p>
      ${adminLink}
      ${whatsappLink}
    </div>`;
}

async function sendMail({ to, subject, text, html }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("[mail] SMTP no configurado; correo no enviado", { to, subject });
    return { skipped: true };
  }

  return transporter.sendMail({
    from: process.env.QUOTE_FROM_EMAIL || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

async function sendPaidOrderEmail(order) {
  return sendMail({
    to: process.env.QUOTE_TO_EMAIL,
    subject: `✅ Pedido pagado ${order.orderNumber}`,
    text: buildTextMail(order),
    html: buildHtmlMail(order, {
      title: `Pedido pagado ${order.orderNumber}`,
      intro: "Flow confirmo el pago. Este pedido queda listo para gestion operativa.",
    }),
  });
}

async function sendQuoteEmail(order) {
  return sendMail({
    to: process.env.QUOTE_TO_EMAIL,
    subject: `Nueva cotizacion ${order.orderNumber}`,
    text: buildTextMail(order),
    html: buildHtmlMail(order, {
      title: `Nueva cotizacion ${order.orderNumber}`,
      intro: "Se recibio una nueva cotizacion desde Hub Cafe.",
    }),
  });
}

async function readStockData() {
  await ensureStore();
  try {
    const raw = await fsp.readFile(STOCK_FILE, "utf8");
    const data = JSON.parse(raw);

    if (data && Array.isArray(data.products)) {
      return data;
    }

    if (Array.isArray(data)) {
      return { products: data };
    }

    if (data && typeof data === "object") {
      return {
        products: Object.entries(data).map(([sku, stock]) => ({
          sku,
          stock: Number(stock || 0),
        })),
      };
    }
  } catch {
    return { products: [] };
  }

  return { products: [] };
}

async function saveStockData(stockData) {
  await fsp.writeFile(STOCK_FILE, `${JSON.stringify(stockData, null, 2)}\n`, "utf8");
}

function findStockProduct(products, item) {
  return products.find((product) => {
    const keys = [product.sku, product.id, product.name].filter(Boolean).map(String);
    return keys.includes(String(item.sku || "")) ||
      keys.includes(String(item.id || "")) ||
      keys.includes(String(item.name || ""));
  });
}

async function discountStockForOrder(order) {
  if (order.stockDiscounted) {
    return { discounted: false, warnings: ["El stock ya estaba descontado."] };
  }

  const stockData = await readStockData();
  const products = Array.isArray(stockData.products) ? stockData.products : [];
  const warnings = [];
  const changes = [];

  for (const item of order.cart || []) {
    const product = findStockProduct(products, item);

    if (!product) {
      warnings.push(`No se encontro stock para ${item.sku || item.id || item.name}.`);
      continue;
    }

    const previousStock = Number(product.stock ?? product.quantity ?? 0);
    const nextStock = Math.max(0, previousStock - Number(item.quantity || 0));

    if (previousStock < Number(item.quantity || 0)) {
      warnings.push(`Stock insuficiente para ${item.name}. Disponible: ${previousStock}.`);
    }

    product.stock = nextStock;
    changes.push({
      id: product.id || "",
      sku: product.sku || "",
      name: product.name || item.name,
      previousStock,
      nextStock,
      requestedQuantity: Number(item.quantity || 0),
    });
  }

  await saveStockData({ products });
  return { discounted: true, changes, warnings };
}

function paymentSummaryFromFlow(flowStatus) {
  return {
    provider: "flow",
    status: flowStatus.status,
    commerceOrder: flowStatus.commerceOrder || "",
    flowOrder: flowStatus.flowOrder || "",
    requestDate: flowStatus.requestDate || "",
    paymentData: flowStatus.paymentData || null,
  };
}

async function processFlowToken(token) {
  const flowStatus = await getFlowPaymentStatus(token);
  const commerceOrder = flowStatus.commerceOrder || flowStatus.commerce_order || "";
  const paymentStatus = mapFlowPaymentStatus(flowStatus.status);
  const existingOrder = await getOrder(commerceOrder);

  if (!existingOrder) {
    return {
      ok: true,
      found: false,
      order: null,
      flowStatus,
      paymentStatus,
    };
  }

  let order = existingOrder;

  if (paymentStatus === "PAGADO") {
    order = await markOrderAsPaid(order.id, {
      token,
      flowPaymentId: flowStatus.flowOrder ? String(flowStatus.flowOrder) : "",
      summary: paymentSummaryFromFlow(flowStatus),
    });

    if (!order.stockDiscounted) {
      const stockResult = await discountStockForOrder(order);
      order = await updateOrder(order.id, (draft) => {
        draft.stockDiscounted = true;
        addOrderEvent(draft, "STOCK_DISCOUNTED", "Stock descontado para pedido pagado", stockResult);
        return draft;
      });
    }

    if (!order.paidEmailSent) {
      await sendPaidOrderEmail(order);
      order = await updateOrder(order.id, (draft) => {
        draft.paidEmailSent = true;
        addOrderEvent(draft, "PAID_EMAIL_SENT", "Correo de pedido pagado enviado al admin", {
          to: process.env.QUOTE_TO_EMAIL || "",
        });
        return draft;
      });
    }
  } else if (PAYMENT_STATUSES.includes(paymentStatus)) {
    order = await updateOrder(order.id, (draft) => {
      const previousStatus = draft.paymentStatus;
      draft.paymentStatus = paymentStatus;
      draft.flowToken = token || draft.flowToken || "";
      draft.flowPaymentId = flowStatus.flowOrder
        ? String(flowStatus.flowOrder)
        : draft.flowPaymentId || "";
      draft.payment = paymentSummaryFromFlow(flowStatus);
      addOrderEvent(draft, "FLOW_STATUS_UPDATED", "Estado de pago actualizado desde Flow", {
        previousStatus,
        paymentStatus,
        flowStatus: flowStatus.status,
      });
      return draft;
    });
  }

  return { ok: true, found: true, order, flowStatus, paymentStatus };
}

function buildReturnUrl(result, baseUrl) {
  const status =
    result.paymentStatus === "PAGADO"
      ? "success"
      : result.paymentStatus === "PENDIENTE_PAGO"
        ? "pending"
        : "failed";
  const orderNumber =
    (result.order && result.order.orderNumber) ||
    (result.flowStatus && result.flowStatus.commerceOrder) ||
    "";
  const url = new URL(baseUrl);
  url.searchParams.set("status", status);
  if (orderNumber) {
    url.searchParams.set("order", orderNumber);
  }
  return url.toString();
}

app.get(
  "/health",
  asyncHandler(async (_req, res) => {
    let ordersStoreReady = false;

    try {
      ordersStoreReady = await ensureStore();
    } catch {
      ordersStoreReady = false;
    }

    res.json({
      ok: true,
      service: "cotizacion-mail",
      smtpConfigured: isSmtpConfigured(),
      flowConfigured: isFlowConfigured(),
      ordersStoreReady,
    });
  })
);

app.post(
  "/enviar-cotizacion",
  asyncHandler(async (req, res) => {
    const orderData = validatePayload(req.body || {});
    const order = await createOrder({ ...orderData, source: "enviar-cotizacion" });
    await sendQuoteEmail(order);

    res.status(201).json({
      ok: true,
      id: order.id,
      orderNumber: order.orderNumber,
      commerceOrder: order.commerceOrder,
      paymentStatus: order.paymentStatus,
      managementStatus: order.managementStatus,
    });
  })
);

app.post(
  "/api/orders/create",
  asyncHandler(async (req, res) => {
    const orderData = validatePayload(req.body || {});
    let order = await createOrder({ ...orderData, source: "api-orders-create" });
    let paymentUrl = null;
    let token = null;
    let warning;

    if (isFlowConfigured()) {
      const flowPayment = await createFlowPayment(order);
      paymentUrl = flowPayment.paymentUrl;
      token = flowPayment.token;
      order = await updateOrder(order.id, (draft) => {
        draft.flowToken = flowPayment.token || "";
        draft.flowPaymentId = flowPayment.flowPaymentId || "";
        addOrderEvent(draft, "FLOW_PAYMENT_CREATED", "Pago Flow creado", {
          flowPaymentId: flowPayment.flowPaymentId,
          token: flowPayment.token,
        });
        return draft;
      });
    } else {
      warning = "Flow no configurado";
      order = await updateOrder(order.id, (draft) => {
        addOrderEvent(draft, "FLOW_NOT_CONFIGURED", warning, {});
        return draft;
      });
    }

    res.status(201).json({
      ok: true,
      order,
      paymentUrl,
      token,
      ...(warning ? { warning } : {}),
    });
  })
);

app.get(
  "/api/orders",
  asyncHandler(async (req, res) => {
    const orders = await listOrders({
      paymentStatus: req.query.paymentStatus,
      managementStatus: req.query.managementStatus,
      q: req.query.q,
    });
    res.json({ ok: true, orders });
  })
);

app.get(
  "/api/orders/:id",
  asyncHandler(async (req, res) => {
    const order = await getOrder(req.params.id);

    if (!order) {
      res.status(404).json({ ok: false, error: "Pedido no encontrado" });
      return;
    }

    res.json({ ok: true, order });
  })
);

app.patch(
  "/api/orders/:id/status",
  asyncHandler(async (req, res) => {
    const status = req.body && (req.body.managementStatus || req.body.estadoGestion);

    if (!MANAGEMENT_STATUSES.includes(status)) {
      res.status(400).json({ ok: false, error: "managementStatus invalido" });
      return;
    }

    const order = await setManagementStatus(req.params.id, status);

    if (!order) {
      res.status(404).json({ ok: false, error: "Pedido no encontrado" });
      return;
    }

    res.json({ ok: true, order });
  })
);

app.post(
  FLOW_WEBHOOK_PATH,
  asyncHandler(async (req, res) => {
    const token = getFlowToken(req);

    if (!token) {
      res.status(400).json({ ok: false, error: "token requerido" });
      return;
    }

    const result = await processFlowToken(token);
    res.status(200).json({
      ok: true,
      found: result.found,
      order: result.order
        ? {
            id: result.order.id,
            orderNumber: result.order.orderNumber,
            paymentStatus: result.order.paymentStatus,
          }
        : null,
    });
  })
);

app.post(
  FLOW_CONFIRM_PATH,
  asyncHandler(async (req, res) => {
    const token = getFlowToken(req);

    if (!token) {
      res.status(400).json({ ok: false, error: "token requerido" });
      return;
    }

    const result = await processFlowToken(token);
    res.status(200).json({
      ok: true,
      found: result.found,
      paymentStatus: result.paymentStatus,
    });
  })
);

app.get(
  FLOW_RETURN_PATH,
  asyncHandler(async (req, res) => {
    const token = getFlowToken(req);

    if (!token) {
      res.status(400).send("<h1>Pago sin token</h1>");
      return;
    }

    const result = await processFlowToken(token);

    if (process.env.FLOW_RETURN_URL) {
      res.redirect(buildReturnUrl(result, process.env.FLOW_RETURN_URL));
      return;
    }

    res
      .status(200)
      .send(
        `<h1>Pago ${escapeHtml(result.paymentStatus)}</h1><p>Pedido: ${escapeHtml(
          result.order ? result.order.orderNumber : ""
        )}</p>`
      );
  })
);

// Express identifica este middleware de error por sus cuatro argumentos.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error, _req, res, _next) => {
  const message = error instanceof Error ? error.message : "Error interno";
  console.error("[server:error]", message);
  res.status(500).json({ ok: false, error: message });
});

ensureStore()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SMK cotizacion server escuchando en puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("[server:start]", error instanceof Error ? error.message : error);
    process.exit(1);
  });
