const express = require("express");
const { createCheckoutSession, verifyPayment } = require("../controllers/paymentController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-checkout-session/:orderId", authMiddleware, createCheckoutSession);
router.get("/verify-payment", authMiddleware, verifyPayment);

module.exports = router;
