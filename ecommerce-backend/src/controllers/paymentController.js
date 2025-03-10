require("dotenv").config(); // ✅ Cargar variables de entorno al principio
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");
const Cart = require("../models/Cart");

// ✅ Verificar si la clave de Stripe está cargada correctamente
console.log("Stripe Key:", process.env.STRIPE_SECRET_KEY);

// Crear una sesión de pago en Stripe
const createCheckoutSession = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate("products.product");
    
    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    const lineItems = order.products.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          description: item.product.description,
          images: [item.product.image],
        },
        unit_amount: item.product.price * 100, // Stripe usa centavos
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: {
        orderId: orderId,
        userId: req.user._id.toString()
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error al crear sesión de checkout:", error);
    res.status(500).json({ message: "Error al crear sesión de pago" });
  }
};

// Verificar el estado del pago
const verifyPayment = async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Sesión no encontrada" });
    }

    if (session.payment_status === "paid") {
      const order = await Order.findById(session.metadata.orderId);
      if (order) {
        order.status = "Pagado";
        await order.save();

        // Limpiar el carrito después del pago exitoso
        await Cart.findOneAndUpdate(
          { user: session.metadata.userId },
          { $set: { products: [] } }
        );
      }

      return res.json({
        status: "paid",
        message: "Pago exitoso, pedido actualizado a Pagado",
        order: order
      });
    }

    res.json({
      status: session.payment_status,
      message: "Estado del pago: " + session.payment_status
    });
  } catch (error) {
    console.error("Error al verificar pago:", error);
    res.status(500).json({ message: "Error al verificar el pago" });
  }
};

module.exports = {
  createCheckoutSession,
  verifyPayment,
};
