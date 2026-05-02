const { getFlowPaymentStatus } = require("../lib/flow-client");
const { mapFlowStatusToPaymentStatus, paymentStatusToReturnStatus } = require("../lib/status-mapper");
const ordersRepository = require("../repositories/orders.repository");
const paymentsRepository = require("../repositories/payments.repository");
const { discountStockFromSupabase } = require("./stock.service");
const { sendPaidOrderEmail } = require("./mail.service");

function getFlowToken(req) {
  return String((req.body && req.body.token) || (req.query && req.query.token) || "");
}

function paymentSummaryFromFlow(flowStatus, token) {
  return {
    provider: "flow",
    token,
    status: flowStatus.status,
    commerceOrder: flowStatus.commerceOrder || flowStatus.commerce_order || "",
    flowOrder: flowStatus.flowOrder || "",
    requestDate: flowStatus.requestDate || "",
    paymentData: flowStatus.paymentData || null,
  };
}

async function processFlowToken(token) {
  const flowStatus = await getFlowPaymentStatus(token);
  const commerceOrder = flowStatus.commerceOrder || flowStatus.commerce_order || "";
  const paymentStatus = mapFlowStatusToPaymentStatus(flowStatus.status);
  const attempt = await paymentsRepository.findFlowAttempt({
    token,
    commerceOrder,
    reference: commerceOrder,
  });

  if (!attempt) {
    return {
      ok: true,
      found: false,
      order: null,
      paymentStatus,
      flowStatus,
    };
  }

  const order = await ordersRepository.getOrderDetail(attempt.order_id);
  if (!order) {
    return {
      ok: true,
      found: false,
      order: null,
      paymentStatus,
      flowStatus,
    };
  }

  const responsePayload = {
    ...(attempt.response_payload || {}),
    token,
    flowStatus: paymentSummaryFromFlow(flowStatus, token),
  };

  await paymentsRepository.updatePaymentAttempt(attempt.id, {
    status: paymentStatus,
    provider_transaction_id: flowStatus.flowOrder
      ? String(flowStatus.flowOrder)
      : attempt.provider_transaction_id,
    response_payload: responsePayload,
    confirmed_at: paymentStatus === "pending" ? attempt.confirmed_at : new Date().toISOString(),
  });

  let nextOrderStatus = null;
  if (paymentStatus === "paid" && ["pending", "rejected", "cancelled"].includes(order.order_status)) {
    nextOrderStatus = "paid";
  }
  if (paymentStatus === "rejected") nextOrderStatus = "rejected";
  if (paymentStatus === "cancelled") nextOrderStatus = "cancelled";

  const updatedOrder = await ordersRepository.updateOrderPaymentStatus(
    order.id,
    paymentStatus,
    nextOrderStatus
  );

  await ordersRepository.addOrderEvent(order.id, "flow_payment_status_updated", {
    paymentAttemptId: attempt.id,
    paymentStatus,
    flowStatus: flowStatus.status,
    commerceOrder,
  });

  const detailedOrder = await ordersRepository.getOrderDetail(updatedOrder.id);

  if (paymentStatus === "paid") {
    try {
      await discountStockFromSupabase(detailedOrder);
    } catch (error) {
      await ordersRepository.addOrderEvent(order.id, "stock_discount_failed", {
        message: error instanceof Error ? error.message : String(error),
      });
    }

    try {
      await sendPaidOrderEmail(detailedOrder);
    } catch (error) {
      await ordersRepository.addOrderEvent(order.id, "paid_order_email_failed", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    ok: true,
    found: true,
    order: detailedOrder,
    paymentStatus,
    flowStatus,
  };
}

function buildFlowReturnUrl(result) {
  const baseUrl = process.env.FLOW_RETURN_URL || "https://hubcafe.cl/pago-confirmado";
  const url = new URL(baseUrl);
  url.searchParams.set("status", paymentStatusToReturnStatus(result.paymentStatus));
  if (result.order && result.order.order_number) {
    url.searchParams.set("order", result.order.order_number);
  }
  return url.toString();
}

module.exports = {
  buildFlowReturnUrl,
  getFlowToken,
  processFlowToken,
};
