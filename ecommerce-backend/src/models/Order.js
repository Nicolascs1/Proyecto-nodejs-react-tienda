const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, default: 1 }
    }
  ],
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["Pendiente", "Pagado", "En preparación", "Enviado", "Entregado"], // ✅ Agregamos "Pagado"
    default: "Pendiente" 
  },
  stripeSessionId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
