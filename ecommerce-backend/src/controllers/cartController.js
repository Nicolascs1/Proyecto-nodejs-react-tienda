const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Obtener el carrito del usuario
exports.getCart = async (req, res) => {
    try {
      console.log("Usuario autenticado:", req.user); // 👀 Verifica si req.user existe
  
      const cart = await Cart.findOne({ user: req.user.id }).populate("products.product");
      if (!cart) return res.status(200).json({ products: [] });
  
      res.json(cart);
    } catch (error) {
      console.error("Error en getCart:", error); // 👀 Agrega logs de error
      res.status(500).json({ message: "Error al obtener el carrito", error });
    }
  };
  

// Agregar un producto al carrito
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });
    
    if (product.stock < quantity) {
      return res.status(400).json({ message: "No hay suficiente stock disponible" });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, products: [] });
    }

    const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
    
    if (productIndex > -1) {
      // Si el producto ya existe, actualizar la cantidad
      const newQuantity = cart.products[productIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({ message: "No hay suficiente stock disponible" });
      }
      cart.products[productIndex].quantity = newQuantity;
    } else {
      // Si el producto no existe, agregarlo con la cantidad especificada
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    res.json({ message: "Producto agregado al carrito", cart });
  } catch (error) {
    console.error("Error en addToCart:", error);
    res.status(500).json({ message: "Error al agregar al carrito", error });
  }
};

// Eliminar un producto del carrito
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

    cart.products = cart.products.filter(p => p.product.toString() !== productId);
    await cart.save();

    res.json({ message: "Producto eliminado del carrito", cart });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar producto del carrito", error });
  }
};

// Vaciar el carrito
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });
    res.json({ message: "Carrito vaciado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al vaciar el carrito", error });
  }
};
