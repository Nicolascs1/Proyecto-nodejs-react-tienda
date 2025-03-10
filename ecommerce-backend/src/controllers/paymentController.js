require("dotenv").config(); // ✅ Cargar variables de entorno al principio
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");
const Cart = require("../models/Cart");

// ✅ Verificar si la clave de Stripe está cargada correctamente
console.log("Stripe Key:", process.env.STRIPE_SECRET_KEY);

// Crear una sesión de pago en Stripe
const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user._id;

    // Obtener el carrito del usuario
    const cart = await Cart.findOne({ user: userId }).populate("products.product");
    
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "El carrito está vacío" });
    }

    // Crear la sesión de checkout en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cart.products.map(item => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.name,
            description: item.product.description || `Cantidad: ${item.quantity}`,
          },
          unit_amount: Math.round(item.product.price * 100), // Stripe usa centavos
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/orders?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/cart?canceled=true`,
      metadata: {
        userId: userId.toString(),
        cartId: cart._id.toString(),
      },
    });

    // Crear el pedido en la base de datos
    const order = new Order({
      user: userId,
      products: cart.products.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      totalPrice: cart.products.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0),
      status: "Pendiente",
      stripeSessionId: session.id,
    });

    await order.save();

    // Limpiar el carrito
    await Cart.findOneAndUpdate({ user: userId }, { products: [] });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error al crear la sesión de checkout:", error);
    res.status(500).json({ message: "Error al procesar el pago" });
  }
};

// Verificar el estado del pago
const verifyPayment = async (req, res) => {
  try {
    const { session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      // Actualizar el estado del pedido
      await Order.findOneAndUpdate(
        { stripeSessionId: session_id },
        { status: "Pagado" }
      );
    }

    res.redirect(`${process.env.FRONTEND_URL}/orders?success=true`);
  } catch (error) {
    console.error("Error al verificar el pago:", error);
    res.redirect(`${process.env.FRONTEND_URL}/orders?error=true`);
  }
};

module.exports = {
  createCheckoutSession,
  verifyPayment,
};
