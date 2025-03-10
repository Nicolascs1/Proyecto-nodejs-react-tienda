const express = require("express");
const { createOrder, getUserOrders, updateOrderStatus, deleteOrder } = require("../controllers/orderController");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getUserOrders);
router.put("/:id", authMiddleware, isAdmin, updateOrderStatus);
router.delete("/:id", authMiddleware, isAdmin, deleteOrder); // ✅ Ruta para eliminar pedido

module.exports = router;
