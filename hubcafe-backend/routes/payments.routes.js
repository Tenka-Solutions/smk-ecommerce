const express = require("express");
const {
  buildFlowReturnUrl,
  getFlowToken,
  processFlowToken,
} = require("../services/payments.service");

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

router.get("/payments/flow/return", async (req, res, next) => {
  try {
    const token = getFlowToken(req);

    if (!token) {
      res.status(400).send("<h1>Pago sin token</h1>");
      return;
    }

    const result = await processFlowToken(token);
    res.redirect(buildFlowReturnUrl(result));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
