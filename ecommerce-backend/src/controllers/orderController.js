const Order = require("../models/Order");
const Cart = require("../models/Cart");

// Crear una nueva orden
const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("ID del usuario:", userId);

    // Obtener el carrito del usuario
    const cart = await Cart.findOne({ user: userId }).populate("products.product");
    console.log("Carrito encontrado:", cart);

    if (!cart) {
      console.log("No se encontró el carrito");
      return res.status(400).json({ message: "El carrito está vacío" });
    }

    if (!cart.products || cart.products.length === 0) {
      console.log("El carrito no tiene productos");
      return res.status(400).json({ message: "El carrito está vacío" });
    }

    console.log("Productos en el carrito:", cart.products);

    // Crear la orden con los productos del carrito
    const order = new Order({
      user: userId,
      products: cart.products.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      })),
      totalPrice: cart.products.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0),
      status: "Pendiente"
    });

    console.log("Orden creada:", order);

    // Guardar la orden
    const savedOrder = await order.save();
    console.log("Orden guardada:", savedOrder);

    // Limpiar el carrito después de crear la orden
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { products: [] } }
    );

    // Devolver la orden creada con los productos poblados
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate("products.product");

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error("Error completo al crear la orden:", error);
    res.status(500).json({ 
      message: "Error al crear la orden",
      error: error.message 
    });
  }
};

// Obtener órdenes del usuario
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error al obtener las órdenes:", error);
    res.status(500).json({ message: "Error al obtener las órdenes" });
  }
};

// Obtener una orden específica
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate("products.product");

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error al obtener la orden:", error);
    res.status(500).json({ message: "Error al obtener la orden" });
  }
};

// Actualizar estado de la orden
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("products.product");

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error al actualizar el estado de la orden:", error);
    res.status(500).json({ message: "Error al actualizar el estado de la orden" });
  }
};

// Eliminar una orden
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOneAndDelete({
      _id: id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    res.json({ message: "Orden eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la orden:", error);
    res.status(500).json({ message: "Error al eliminar la orden" });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};
