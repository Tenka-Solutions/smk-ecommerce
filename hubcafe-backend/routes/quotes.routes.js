const express = require("express");
const quotesService = require("../services/quotes.service");

const router = express.Router();

router.post("/quotes/send", async (req, res, next) => {
  try {
    const result = await quotesService.createQuoteRequest(req.body || {});
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
