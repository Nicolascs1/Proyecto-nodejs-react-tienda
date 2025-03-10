const Order = require("../models/Order");
const Cart = require("../models/Cart");

// Crear un pedido a partir del carrito
exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("products.product");
    
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "El carrito está vacío" });
    }

    // Calcular el precio total
    const totalPrice = cart.products.reduce((total, item) => total + (item.product.price * item.quantity), 0);

    // Crear el pedido
    const newOrder = new Order({
      user: req.user.id,
      products: cart.products,
      totalPrice
    });

    await newOrder.save();
    await Cart.findOneAndDelete({ user: req.user.id }); // Vaciar el carrito después del pedido

    res.status(201).json({ message: "Pedido creado correctamente", order: newOrder });
  } catch (error) {
    console.error("Error al crear el pedido:", error);
    res.status(500).json({ message: "Error al crear el pedido", error });
  }
};

// Obtener los pedidos del usuario
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("products.product");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los pedidos", error });
  }
};

// Actualizar estado del pedido (solo admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Estado del pedido actualizado", order });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el pedido", error });
  }
};


// Eliminar un pedido por ID (solo admin)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    await order.deleteOne();
    res.json({ message: "Pedido eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el pedido:", error);
    res.status(500).json({ message: "Error al eliminar el pedido", error });
  }
};
