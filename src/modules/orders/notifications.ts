import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getResendClient } from "@/lib/email/resend";
import { env, isResendConfigured } from "@/lib/env";
import { formatClp } from "@/lib/format/currency";
import { OrderDetail } from "@/modules/orders/service";
import { QuoteRequestInput } from "@/modules/quotes/schema";

interface EmailLogInput {
  templateKey: string;
  recipient: string;
  status: string;
  orderId?: string | null;
  quoteRequestId?: string | null;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  payloadSnapshot?: Record<string, unknown>;
}

async function recordEmailLog(input: EmailLogInput) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return;
  }

  await adminClient.from("email_logs").insert({
    order_id: input.orderId ?? null,
    quote_request_id: input.quoteRequestId ?? null,
    template_key: input.templateKey,
    recipient: input.recipient,
    provider_message_id: input.providerMessageId ?? null,
    status: input.status,
    error_message: input.errorMessage ?? null,
    sent_at: ["sent", "logged"].includes(input.status)
      ? new Date().toISOString()
      : null,
    payload_snapshot: input.payloadSnapshot ?? {},
  });
}

async function deliverEmail({
  to,
  subject,
  html,
  templateKey,
  orderId,
  quoteRequestId,
  payloadSnapshot,
}: {
  to: string;
  subject: string;
  html: string;
  templateKey: string;
  orderId?: string | null;
  quoteRequestId?: string | null;
  payloadSnapshot?: Record<string, unknown>;
}) {
  if (!isResendConfigured()) {
    await recordEmailLog({
      templateKey,
      recipient: to,
      status: "logged",
      orderId,
      quoteRequestId,
      payloadSnapshot,
    });
    return;
  }

  try {
    const resend = getResendClient();

    if (!resend) {
      throw new Error("Resend no esta configurado.");
    }

    const response = await resend.emails.send({
      from: env.resendFrom,
      to,
      subject,
      html,
    });

    await recordEmailLog({
      templateKey,
      recipient: to,
      status: "sent",
      orderId,
      quoteRequestId,
      providerMessageId: response.data?.id ?? null,
      payloadSnapshot,
    });
  } catch (error) {
    await recordEmailLog({
      templateKey,
      recipient: to,
      status: "failed",
      orderId,
      quoteRequestId,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      payloadSnapshot,
    });
  }
}

function renderOrderItems(order: OrderDetail) {
  return order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e7dfd5;">${item.name}</td>
          <td style="padding:10px 0;border-bottom:1px solid #e7dfd5;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid #e7dfd5;text-align:right;">${formatClp(item.lineTotalTaxInc)}</td>
        </tr>
      `
    )
    .join("");
}

function buildOrderEmailHtml({
  title,
  intro,
  order,
  reference,
}: {
  title: string;
  intro: string;
  order: OrderDetail;
  reference?: string | null;
}) {
  const address = order.shippingAddress
    ? [
        order.shippingAddress.street,
        order.shippingAddress.number,
        order.shippingAddress.apartment,
        order.shippingAddress.comuna,
        order.shippingAddress.region,
      ]
        .filter(Boolean)
        .join(", ")
    : "Por confirmar";

  return `
    <div style="background:#f5f1eb;padding:32px 18px;font-family:Arial,sans-serif;color:#1d1a17;">
      <div style="max-width:680px;margin:0 auto;background:#fffdfa;border:1px solid #e7dfd5;border-radius:24px;padding:32px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#7f7367;">SMK Vending</p>
        <h1 style="margin:0 0 16px;font-size:32px;line-height:1.15;">${title}</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#5f564d;">${intro}</p>
        <div style="background:#f5efe7;border-radius:18px;padding:18px 20px;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:14px;"><strong>Orden:</strong> ${order.orderNumber}</p>
          <p style="margin:0 0 8px;font-size:14px;"><strong>Estado:</strong> ${order.orderStatus}</p>
          <p style="margin:0;font-size:14px;"><strong>Referencia:</strong> ${reference ?? "Por confirmar"}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr>
              <th style="padding-bottom:10px;text-align:left;color:#7f7367;">Producto</th>
              <th style="padding-bottom:10px;text-align:center;color:#7f7367;">Cant.</th>
              <th style="padding-bottom:10px;text-align:right;color:#7f7367;">Total</th>
            </tr>
          </thead>
          <tbody>${renderOrderItems(order)}</tbody>
        </table>
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e7dfd5;">
          <p style="margin:0 0 8px;font-size:14px;"><strong>Total:</strong> ${formatClp(order.totalTaxInc)} IVA incluido</p>
          <p style="margin:0 0 8px;font-size:14px;"><strong>Despacho:</strong> ${order.shippingLabel}</p>
          <p style="margin:0 0 8px;font-size:14px;"><strong>Direccion:</strong> ${address}</p>
          <p style="margin:0;font-size:14px;"><strong>Soporte:</strong> ${env.siteUrl}</p>
        </div>
      </div>
    </div>
  `;
}

export async function sendOrderPaidEmails({
  order,
  reference,
}: {
  order: OrderDetail;
  reference?: string | null;
}) {
  const payloadSnapshot = {
    orderNumber: order.orderNumber,
    totalTaxInc: order.totalTaxInc,
    reference: reference ?? null,
  };

  await Promise.all([
    deliverEmail({
      to: order.customerEmail,
      subject: `SMK Vending | Confirmacion de pedido ${order.orderNumber}`,
      html: buildOrderEmailHtml({
        title: `Hola ${order.customerName}, tu compra fue confirmada`,
        intro:
          "Recibimos tu pago correctamente. Nuestro equipo coordinara el despacho y las siguientes etapas por correo.",
        order,
        reference,
      }),
      templateKey: "order-customer-paid",
      orderId: order.id,
      payloadSnapshot,
    }),
    deliverEmail({
      to: "ventas@smkvending.cl",
      subject: `Nuevo pedido pagado ${order.orderNumber}`,
      html: buildOrderEmailHtml({
        title: `Pedido pagado ${order.orderNumber}`,
        intro:
          "Se registro un pago exitoso en el ecommerce. Revisa el detalle comercial y continua la gestion operativa.",
        order,
        reference,
      }),
      templateKey: "order-internal-paid",
      orderId: order.id,
      payloadSnapshot,
    }),
  ]);
}

export async function sendQuoteNotificationEmail({
  quoteRequestId,
  input,
  selectedProducts,
}: {
  quoteRequestId?: string | null;
  input: QuoteRequestInput;
  selectedProducts: string[];
}) {
  const html = `
    <div style="background:#f5f1eb;padding:32px 18px;font-family:Arial,sans-serif;color:#1d1a17;">
      <div style="max-width:680px;margin:0 auto;background:#fffdfa;border:1px solid #e7dfd5;border-radius:24px;padding:32px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#7f7367;">SMK Vending</p>
        <h1 style="margin:0 0 16px;font-size:30px;line-height:1.15;">Nueva solicitud de cotizacion</h1>
        <p style="margin:0 0 10px;font-size:14px;"><strong>Nombre:</strong> ${input.name}</p>
        <p style="margin:0 0 10px;font-size:14px;"><strong>Email:</strong> ${input.email}</p>
        <p style="margin:0 0 10px;font-size:14px;"><strong>Telefono:</strong> ${input.phone}</p>
        <p style="margin:0 0 10px;font-size:14px;"><strong>Empresa:</strong> ${input.company ?? "No informada"}</p>
        <p style="margin:0 0 10px;font-size:14px;"><strong>Productos:</strong> ${selectedProducts.join(", ") || "No especificados"}</p>
        <p style="margin:18px 0 0;font-size:14px;line-height:1.8;"><strong>Mensaje:</strong><br />${input.message}</p>
      </div>
    </div>
  `;

  await deliverEmail({
    to: "ventas@smkvending.cl",
    subject: `Nueva cotizacion desde web - ${input.name}`,
    html,
    templateKey: "quote-internal-created",
    quoteRequestId,
    payloadSnapshot: {
      email: input.email,
      phone: input.phone,
      productCount: input.productIds.length,
    },
  });
}
