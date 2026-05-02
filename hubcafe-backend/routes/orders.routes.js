const express = require("express");
const ordersService = require("../services/orders.service");
const {
  ALLOWED_PUBLIC_ORDER_STATUSES,
  mapOrderStatusToSupabase,
  isValidOrderStatus,
} = require("../lib/status-mapper");
const { requireAdminApiKey } = require("../middleware/admin-api-key");

const router = express.Router();

router.post("/orders/create", async (req, res, next) => {
  try {
    const result = await ordersService.createOrder(req.body || {});
    res.status(201).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.get("/orders", requireAdminApiKey, async (req, res, next) => {
  try {
    const orders = await ordersService.listOrders({
      payment_status: req.query.payment_status,
      order_status: req.query.order_status,
      q: req.query.q,
      from: req.query.from,
      to: req.query.to,
    });
    res.json({ ok: true, orders });
  } catch (error) {
    next(error);
  }
});

router.get("/orders/:id", requireAdminApiKey, async (req, res, next) => {
  try {
    const order = await ordersService.getOrder(req.params.id);

    if (!order) {
      res.status(404).json({ ok: false, error: "Pedido no encontrado" });
      return;
    }

    res.json({ ok: true, order });
  } catch (error) {
    next(error);
  }
});

router.patch("/orders/:id/status", requireAdminApiKey, async (req, res, next) => {
  try {
    const rawStatus = req.body && (req.body.orderStatus || req.body.order_status);
    const mappedStatus = mapOrderStatusToSupabase(rawStatus);

    if (
      !rawStatus ||
      !ALLOWED_PUBLIC_ORDER_STATUSES.includes(rawStatus) &&
      !isValidOrderStatus(mappedStatus)
    ) {
      res.status(400).json({ ok: false, error: "order_status invalido" });
      return;
    }

    const order = await ordersService.updateOrderStatus(req.params.id, mappedStatus);

    if (!order) {
      res.status(404).json({ ok: false, error: "Pedido no encontrado" });
      return;
    }

    res.json({ ok: true, order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
