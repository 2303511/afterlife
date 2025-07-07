const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");

const {
  getStripeConfig,
  createPaymentIntent,
  handleStripeWebhook
} = require("../controllers/stripeController");

router.get("/config", ensureAuth, getStripeConfig);
router.post("/create-payment-intent", ensureAuth, createPaymentIntent);
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

module.exports = router;
