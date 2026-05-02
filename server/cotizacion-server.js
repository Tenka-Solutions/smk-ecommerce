/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config();

const crypto = require("node:crypto");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const {
  actualizarEstadoPedido,
  descontarStockPedido,
  generarCodigoPedido,
  guardarPedido,
  listarPedidos,
  obtenerPedido,
} = require("./orders-store");

const app = express();
const PORT = Number(process.env.PORT || 3001);
const FLOW_WEBHOOK_PATH = "/api/payments/flow/webhook";

const ESTADOS_PAGO = ["PENDIENTE_PAGO", "PAGADO", "RECHAZADO", "ANULADO"];
const ESTADOS_GESTION = [
  "NUEVO",
  "EN_PREPARACION",
  "LISTO_PARA_DESPACHO",
  "DESPACHADO",
  "CANCELADO",
];

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

function getPublicBaseUrl(req) {
  if (process.env.PUBLIC_API_BASE_URL) return process.env.PUBLIC_API_BASE_URL;
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
  return `${protocol}://${req.get("host")}`;
}

function signFlowParams(params) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHmac("sha256", process.env.FLOW_SECRET_KEY || "")
    .update(sorted)
    .digest("hex");
}

function isFlowConfigured() {
  return Boolean(process.env.FLOW_API_KEY && process.env.FLOW_SECRET_KEY);
}

function getFlowBaseUrl() {
  return process.env.FLOW_BASE_URL || process.env.FLOW_API_URL || "https://flow.cl/api";
}

function mapearEstadoFlow(status) {
  if (status === 2) return "PAGADO";
  if (status === 3) return "RECHAZADO";
  if (status === 4) return "ANULADO";
  return "PENDIENTE_PAGO";
}

function normalizarCliente(payload) {
  const cliente = payload.cliente || payload.customer || payload;
  const nombre = cliente.nombre || cliente.name || cliente.fullName;
  const email = cliente.email || cliente.correo;
  const telefono = cliente.telefono || cliente.phone;

  if (!nombre || !email || !telefono) {
    throw new Error("Cliente incompleto: nombre, email y telefono son requeridos.");
  }

  return {
    nombre: String(nombre).trim(),
    email: String(email).trim(),
    telefono: String(telefono).trim(),
    rut: cliente.rut || null,
    empresa: cliente.empresa || cliente.company || cliente.companyName || null,
    razonSocial: cliente.razonSocial || cliente.businessName || null,
    giro: cliente.giro || cliente.businessActivity || null,
  };
}

function normalizarCarrito(payload) {
  const carrito = payload.carrito || payload.items || payload.productos || [];

  if (!Array.isArray(carrito) || carrito.length === 0) {
    throw new Error("El carrito esta vacio.");
  }

  return carrito.map((item) => {
    const quantity = Number(item.cantidad || item.quantity || 1);
    const unitPriceTaxInc = Number(
      item.precio || item.price || item.unitPriceTaxInc || item.priceClpTaxInc || 0
    );
    const name = item.nombre || item.name || item.title || "Producto";

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error(`Cantidad invalida para ${name}.`);
    }

    return {
      productId: String(item.id || item.productId || item.sku || name),
      sku: item.sku || null,
      name: String(name),
      quantity: Math.round(quantity),
      unitPriceTaxInc: Math.round(unitPriceTaxInc),
      lineTotalTaxInc: Math.round(unitPriceTaxInc * quantity),
    };
  });
}

function calcularTotal(productos) {
  return productos.reduce((total, item) => total + item.lineTotalTaxInc, 0);
}

function crearPedidoDesdePayload(payload) {
  const now = new Date().toISOString();
  const productos = normalizarCarrito(payload);
  const commerceOrder = generarCodigoPedido();

  return {
    id: crypto.randomUUID(),
    commerceOrder,
    cliente: normalizarCliente(payload),
    despacho: payload.despacho || payload.shipping || null,
    productos,
    total: calcularTotal(productos),
    estadoPago: "PENDIENTE_PAGO",
    estadoGestion: "NUEVO",
    flowPaymentId: null,
    flowToken: null,
    stockDescontado: false,
    historial: [
      {
        tipo: "order_created",
        fecha: now,
        detalle: { source: "cpanel-express" },
      },
    ],
    createdAt: now,
    paidAt: null,
    updatedAt: now,
  };
}

async function crearPagoFlow({ pedido, req }) {
  if (!isFlowConfigured()) return null;

  const publicBaseUrl = getPublicBaseUrl(req);
  const params = {
    apiKey: process.env.FLOW_API_KEY,
    commerceOrder: pedido.commerceOrder,
    subject: `Pago pedido ${pedido.commerceOrder}`,
    currency: "CLP",
    amount: Math.round(pedido.total),
    email: pedido.cliente.email,
    urlConfirmation:
      process.env.FLOW_CONFIRMATION_URL || `${publicBaseUrl}${FLOW_WEBHOOK_PATH}`,
    urlReturn:
      process.env.FLOW_RETURN_URL || `${publicBaseUrl}/api/payments/flow/return`,
    optional: JSON.stringify({
      orderId: pedido.id,
      orderNumber: pedido.commerceOrder,
    }),
  };
  const body = new URLSearchParams({
    ...Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
    s: signFlowParams(params),
  });
  const response = await fetch(`${getFlowBaseUrl()}/payment/create`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Flow create failed (${response.status}): ${text}`);
  }

  const data = JSON.parse(text);
  return {
    token: data.token,
    flowOrder: data.flowOrder,
    redirectUrl: `${data.url}?token=${data.token}`,
    raw: data,
  };
}

async function consultarEstadoFlow(token) {
  if (!isFlowConfigured()) {
    throw new Error("Flow no esta configurado.");
  }

  const params = {
    apiKey: process.env.FLOW_API_KEY,
    token,
  };
  const query = new URLSearchParams({ ...params, s: signFlowParams(params) });
  const response = await fetch(`${getFlowBaseUrl()}/payment/getStatus?${query}`);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Flow getStatus failed (${response.status}): ${text}`);
  }

  return JSON.parse(text);
}

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: ["true", "1"].includes(String(process.env.SMTP_SECURE || "")),
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

function renderPedidoHtml({ pedido, titulo, intro }) {
  const productos = pedido.productos
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">$${item.lineTotalTaxInc.toLocaleString("es-CL")}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#1d1a17;">
      <h1>${titulo}</h1>
      <p>${intro}</p>
      <p><strong>Pedido:</strong> ${pedido.commerceOrder}</p>
      <p><strong>Cliente:</strong> ${pedido.cliente.nombre} - ${pedido.cliente.email} - ${pedido.cliente.telefono}</p>
      <p><strong>Estado pago:</strong> ${pedido.estadoPago}</p>
      <p><strong>Estado gestion:</strong> ${pedido.estadoGestion}</p>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr><th align="left">Producto</th><th>Cant.</th><th align="right">Total</th></tr></thead>
        <tbody>${productos}</tbody>
      </table>
      <p style="font-size:18px;"><strong>Total:</strong> $${pedido.total.toLocaleString("es-CL")}</p>
      <p><strong>Panel admin:</strong> ${process.env.ADMIN_PANEL_URL || ""}</p>
    </div>`;
}

async function enviarEmail({ to, subject, html }) {
  const transporter = getTransporter();

  if (!transporter) {
    console.log("[email:log]", { to, subject });
    return { logged: true };
  }

  return transporter.sendMail({
    from: process.env.QUOTE_FROM_EMAIL || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

async function enviarEmailCotizacion(pedido) {
  return enviarEmail({
    to: process.env.QUOTE_TO_EMAIL || "soporte@smkvending.cl",
    subject: `Nueva cotizacion/pedido ${pedido.commerceOrder}`,
    html: renderPedidoHtml({
      pedido,
      titulo: "Nueva cotizacion/pedido desde Hub Cafe",
      intro: "Se registro una nueva solicitud en el sitio.",
    }),
  });
}

async function enviarEmailPedidoPagado(pedido) {
  return enviarEmail({
    to: process.env.QUOTE_TO_EMAIL || "soporte@smkvending.cl",
    subject: `Pedido pagado ${pedido.commerceOrder}`,
    html: renderPedidoHtml({
      pedido,
      titulo: `Pedido pagado ${pedido.commerceOrder}`,
      intro: "Flow confirmo el pago. Continua la gestion operativa.",
    }),
  });
}

function extraerFlowToken(req) {
  return req.body?.token || req.query?.token || null;
}

async function crearPedidoPagable(payload, req, iniciarPago) {
  const pedido = crearPedidoDesdePayload(payload);
  const flow = iniciarPago ? await crearPagoFlow({ pedido, req }) : null;
  const now = new Date().toISOString();
  const pedidoConFlow = {
    ...pedido,
    flowPaymentId: flow?.flowOrder ? String(flow.flowOrder) : null,
    flowToken: flow?.token || null,
    historial: [
      ...pedido.historial,
      ...(flow
        ? [
            {
              tipo: "flow_payment_created",
              fecha: now,
              detalle: { flowOrder: flow.flowOrder, token: flow.token },
            },
          ]
        : []),
    ],
  };

  await guardarPedido(pedidoConFlow);
  return { pedido: pedidoConFlow, flow };
}

app.get(
  "/health",
  asyncHandler(async (_req, res) => {
    res.json({ ok: true, service: "smk-cotizacion-server" });
  })
);

app.post(
  "/enviar-cotizacion",
  asyncHandler(async (req, res) => {
    const { pedido } = await crearPedidoPagable(req.body, req, false);
    await enviarEmailCotizacion(pedido);
    res.status(201).json({
      ok: true,
      id: pedido.id,
      commerceOrder: pedido.commerceOrder,
      estadoPago: pedido.estadoPago,
      estadoGestion: pedido.estadoGestion,
    });
  })
);

app.post(
  "/api/orders/create",
  asyncHandler(async (req, res) => {
    const { pedido, flow } = await crearPedidoPagable(req.body, req, req.body?.iniciarPago !== false);
    res.status(201).json({
      ok: true,
      id: pedido.id,
      commerceOrder: pedido.commerceOrder,
      estadoPago: pedido.estadoPago,
      estadoGestion: pedido.estadoGestion,
      flowToken: pedido.flowToken,
      redirectUrl: flow?.redirectUrl || null,
    });
  })
);

app.get(
  "/api/orders",
  asyncHandler(async (req, res) => {
    const { estadoPago, estadoGestion } = req.query;
    let orders = await listarPedidos();

    if (estadoPago) orders = orders.filter((order) => order.estadoPago === estadoPago);
    if (estadoGestion) orders = orders.filter((order) => order.estadoGestion === estadoGestion);

    res.json({ orders });
  })
);

app.get(
  "/api/orders/:id",
  asyncHandler(async (req, res) => {
    const pedido = await obtenerPedido(req.params.id);

    if (!pedido) {
      res.status(404).json({ error: "Pedido no encontrado" });
      return;
    }

    res.json({ order: pedido });
  })
);

app.patch(
  "/api/orders/:id/status",
  asyncHandler(async (req, res) => {
    const { estadoPago, estadoGestion } = req.body || {};

    if (estadoPago && !ESTADOS_PAGO.includes(estadoPago)) {
      res.status(400).json({ error: "estadoPago invalido" });
      return;
    }

    if (estadoGestion && !ESTADOS_GESTION.includes(estadoGestion)) {
      res.status(400).json({ error: "estadoGestion invalido" });
      return;
    }

    const pedido = await actualizarEstadoPedido(req.params.id, {
      ...(estadoPago ? { estadoPago } : {}),
      ...(estadoGestion ? { estadoGestion } : {}),
      eventType: "admin_status_updated",
      eventPayload: { estadoPago: estadoPago || null, estadoGestion: estadoGestion || null },
    });

    if (!pedido) {
      res.status(404).json({ error: "Pedido no encontrado" });
      return;
    }

    res.json({ ok: true, order: pedido });
  })
);

app.post(
  FLOW_WEBHOOK_PATH,
  asyncHandler(async (req, res) => {
    const token = extraerFlowToken(req);

    if (!token) {
      res.status(400).json({ error: "token missing" });
      return;
    }

    // Flow notifica un token; este backend consulta getStatus con firma privada
    // antes de actualizar el pedido, descontar stock o enviar correo.
    const flowStatus = await consultarEstadoFlow(token);
    const estadoPago = mapearEstadoFlow(flowStatus.status);
    const pedidoActual = await obtenerPedido(flowStatus.commerceOrder);

    if (!pedidoActual) {
      res.json({
        ok: true,
        skipped: "order-not-found",
        commerceOrder: flowStatus.commerceOrder,
      });
      return;
    }

    const yaEstabaPagado = pedidoActual.estadoPago === "PAGADO";
    let stockResult = null;

    if (estadoPago === "PAGADO" && !yaEstabaPagado && !pedidoActual.stockDescontado) {
      stockResult = await descontarStockPedido(pedidoActual);
    }

    const pedido = await actualizarEstadoPedido(pedidoActual.id, {
      estadoPago,
      flowPaymentId: String(flowStatus.flowOrder || pedidoActual.flowPaymentId || ""),
      flowToken: token,
      stockDescontado:
        pedidoActual.stockDescontado || Boolean(stockResult?.descontado),
      eventType: "flow_webhook_confirmed",
      eventPayload: {
        flowStatus: flowStatus.status,
        commerceOrder: flowStatus.commerceOrder,
        alreadyPaid: yaEstabaPagado,
        stockResult,
      },
    });

    if (estadoPago === "PAGADO" && !yaEstabaPagado) {
      await enviarEmailPedidoPagado(pedido);
    }

    res.json({
      ok: true,
      commerceOrder: flowStatus.commerceOrder,
      estadoPago,
      alreadyPaid: yaEstabaPagado,
      stockDescontado: Boolean(stockResult?.descontado),
    });
  })
);

app.post("/api/payments/flow/confirm", (req, res, next) => {
  req.url = FLOW_WEBHOOK_PATH;
  app.handle(req, res, next);
});

app.get(
  "/api/payments/flow/return",
  asyncHandler(async (req, res) => {
    const token = extraerFlowToken(req);
    const redirectBase = process.env.FLOW_RETURN_REDIRECT_URL || process.env.ADMIN_PANEL_URL;

    if (!token || !redirectBase) {
      res.json({ ok: Boolean(token), token: token || null });
      return;
    }

    const query = new URLSearchParams({ token: String(token) });
    res.redirect(`${redirectBase}${redirectBase.includes("?") ? "&" : "?"}${query}`);
  })
);

// Express reconoce los manejadores de error por sus 4 argumentos.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    error: error instanceof Error ? error.message : "Error interno",
  });
});

app.listen(PORT, () => {
  console.log(`SMK cotizacion server escuchando en puerto ${PORT}`);
});
