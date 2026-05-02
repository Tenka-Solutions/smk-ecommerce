const { sendMail } = require("../lib/mailer");
const emailLogsRepository = require("../repositories/email-logs.repository");

const PAID_ORDER_TEMPLATE = "hubcafe_paid_order_admin";
const QUOTE_TEMPLATE = "hubcafe_quote_admin";

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

function getOrderItems(order) {
  return order.items || order.order_items || [];
}

function buildOrderText(order) {
  return [
    `Pedido: ${order.order_number}`,
    `Cliente: ${order.customer_name}`,
    `Telefono: ${order.phone || ""}`,
    `Email: ${order.customer_email}`,
    `Total: ${formatCurrency(order.total_tax_inc)}`,
    `Fecha pago: ${order.updated_at || ""}`,
    "",
    "Productos:",
    ...getOrderItems(order).map(
      (item) =>
        `- ${item.quantity} x ${item.name_snapshot}: ${formatCurrency(
          item.line_total_tax_inc
        )}`
    ),
    "",
    `Panel admin: ${process.env.ADMIN_PANEL_URL || ""}`,
  ].join("\n");
}

function buildOrderHtml(order) {
  const rows = getOrderItems(order)
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e8e2d8;">${escapeHtml(item.name_snapshot)}</td>
          <td style="padding:8px;border-bottom:1px solid #e8e2d8;text-align:center;">${Number(item.quantity || 0)}</td>
          <td style="padding:8px;border-bottom:1px solid #e8e2d8;text-align:right;">${formatCurrency(item.line_total_tax_inc)}</td>
        </tr>`
    )
    .join("");
  const adminUrl = process.env.ADMIN_PANEL_URL || "";
  const phoneDigits = String(order.phone || "").replace(/\D/g, "");

  return `
    <div style="font-family:Arial,sans-serif;color:#211a14;line-height:1.45;">
      <h1>Pedido pagado ${escapeHtml(order.order_number)}</h1>
      <p><strong>Codigo pedido:</strong> ${escapeHtml(order.order_number)}</p>
      <p><strong>Cliente:</strong> ${escapeHtml(order.customer_name)}</p>
      <p><strong>Telefono:</strong> ${escapeHtml(order.phone || "")}</p>
      <p><strong>Email:</strong> ${escapeHtml(order.customer_email)}</p>
      <p><strong>Fecha pago:</strong> ${escapeHtml(order.updated_at || "")}</p>
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
      <p style="font-size:18px;"><strong>Total:</strong> ${formatCurrency(order.total_tax_inc)}</p>
      ${adminUrl ? `<p><strong>Panel admin:</strong> <a href="${escapeHtml(adminUrl)}">${escapeHtml(adminUrl)}</a></p>` : ""}
      ${phoneDigits ? `<p><strong>WhatsApp:</strong> <a href="https://wa.me/${escapeHtml(phoneDigits)}">Abrir chat</a></p>` : ""}
    </div>`;
}

async function sendPaidOrderEmail(order) {
  const existing = await emailLogsRepository.findEmailLog(order.id, PAID_ORDER_TEMPLATE);
  if (existing) {
    return { skipped: true, reason: "already_sent" };
  }

  const recipient = process.env.QUOTE_TO_EMAIL;
  const subject = `\u2705 Pedido pagado ${order.order_number}`;

  try {
    const result = await sendMail({
      to: recipient,
      subject,
      text: buildOrderText(order),
      html: buildOrderHtml(order),
    });

    await emailLogsRepository.createEmailLog({
      orderId: order.id,
      templateKey: PAID_ORDER_TEMPLATE,
      recipient,
      status: "sent",
      providerMessageId: result && result.messageId,
      payloadSnapshot: { orderNumber: order.order_number },
    });

    return { sent: true };
  } catch (error) {
    await emailLogsRepository.createEmailLog({
      orderId: order.id,
      templateKey: PAID_ORDER_TEMPLATE,
      recipient,
      status: "error",
      errorMessage: error instanceof Error ? error.message : String(error),
      payloadSnapshot: { orderNumber: order.order_number },
    });
    throw error;
  }
}

async function sendQuoteEmail({ customer, cart, message, quoteRequestId }) {
  const recipient = process.env.QUOTE_TO_EMAIL;
  const lines = [
    `Cliente: ${customer.name}`,
    `Email: ${customer.email}`,
    `Telefono: ${customer.phone}`,
    "",
    "Productos:",
    ...cart.map((item) => `- ${item.quantity} x ${item.name || item.sku || item.id}`),
    "",
    `Mensaje: ${message || customer.message || ""}`,
  ];
  const result = await sendMail({
    to: recipient,
    subject: "Nueva cotizacion Hub Cafe",
    text: lines.join("\n"),
    html: `<pre>${escapeHtml(lines.join("\n"))}</pre>`,
  });

  await emailLogsRepository.createEmailLog({
    quoteRequestId,
    templateKey: QUOTE_TEMPLATE,
    recipient,
    status: "sent",
    providerMessageId: result && result.messageId,
    payloadSnapshot: { customer, cart },
  });

  return { sent: true };
}

module.exports = {
  PAID_ORDER_TEMPLATE,
  sendPaidOrderEmail,
  sendQuoteEmail,
};
