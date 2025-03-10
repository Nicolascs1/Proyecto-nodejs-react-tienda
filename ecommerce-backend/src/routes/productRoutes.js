const express = require("express");
const { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require("../controllers/productController");

const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// 👥 Permitir ver productos a usuarios autenticados
router.get("/", authMiddleware, getAllProducts);

// 👥 Permitir ver un producto específico a usuarios autenticados
router.get("/:id", authMiddleware, getProductById);

// 🔒 Solo admin puede agregar productos
router.post("/", authMiddleware, isAdmin, createProduct);

// 🔒 Solo admin puede actualizar productos
router.put("/:id", authMiddleware, isAdmin, updateProduct);

// 🔒 Solo admin puede eliminar productos
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

module.exports = router;
