const crypto = require("node:crypto");

const DEFAULT_FLOW_BASE_URL = "https://www.flow.cl/api";

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
    throw new Error("Hub Cafe backend requiere Node.js 18 o superior para Flow.");
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
    commerceOrder: order.order_number,
    subject: `Pedido ${order.order_number}`,
    currency: "CLP",
    amount: Math.round(order.total_tax_inc || 0),
    email: order.customer_email,
    urlConfirmation: process.env.FLOW_CONFIRMATION_URL,
    urlReturn: process.env.FLOW_RETURN_URL,
    optional: JSON.stringify({
      orderId: order.id,
      orderNumber: order.order_number,
    }),
  };
  const data = await requestFlow("/payment/create", params, "POST");

  return {
    token: data.token || "",
    flowOrder: data.flowOrder ? String(data.flowOrder) : "",
    paymentUrl: data.url && data.token ? `${data.url}?token=${data.token}` : null,
    raw: data,
  };
}

function getFlowPaymentStatus(token) {
  return requestFlow("/payment/getStatus", { token }, "GET");
}

module.exports = {
  createFlowPayment,
  getFlowPaymentStatus,
  isFlowConfigured,
  requestFlow,
  signFlowParams,
};
