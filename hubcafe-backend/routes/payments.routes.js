const express = require("express");
const {
  buildFlowReturnUrl,
  getFlowToken,
  processFlowToken,
} = require("../services/payments.service");
const ordersService = require("../services/orders.service");

const router = express.Router();

async function handleFlowWebhook(req, res, next) {
  try {
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
      order: result.order
        ? {
            id: result.order.id,
            order_number: result.order.order_number,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
}

router.post("/payments/flow/webhook", handleFlowWebhook);
router.post("/payments/flow/confirm", handleFlowWebhook);

router.get("/payments/status", async (req, res, next) => {
  try {
    const orderNumber = String(req.query.order || req.query.orderNumber || "").trim();

    if (!orderNumber) {
      res.status(400).json({ ok: false, error: "order requerido" });
      return;
    }

    if (!/^SMK-[A-Z0-9-]{6,64}$/i.test(orderNumber)) {
      res.status(400).json({ ok: false, error: "order invalido" });
      return;
    }

    const order = await ordersService.getOrder(orderNumber);

    if (!order) {
      res.status(404).json({ ok: false, found: false });
      return;
    }

    res.json({
      ok: true,
      found: true,
      order: {
        order_number: order.order_number,
        order_status: order.order_status,
        payment_status: order.payment_status,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/payments/flow/return", async (req, res) => {
  try {
    const token = getFlowToken(req);

    if (!token) {
      res.redirect(
        buildFlowReturnUrl({
          found: false,
          order: null,
          paymentStatus: "pending",
          reason: "missing_token",
        })
      );
      return;
    }

    const result = await processFlowToken(token);
    res.redirect(buildFlowReturnUrl(result));
  } catch {
    res.redirect(
      buildFlowReturnUrl({
        found: false,
        order: null,
        paymentStatus: "pending",
        reason: "flow_validation_error",
      })
    );
  }
});

module.exports = router;
