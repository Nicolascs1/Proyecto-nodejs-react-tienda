const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Obtener el carrito del usuario
exports.getCart = async (req, res) => {
    try {
      console.log("Usuario autenticado en getCart:", req.user);
  
      const cart = await Cart.findOne({ user: req.user._id }).populate("products.product");
      if (!cart) return res.status(200).json({ products: [] });
  
      res.json(cart);
    } catch (error) {
      console.error("Error en getCart:", error);
      res.status(500).json({ message: "Error al obtener el carrito", error });
    }
};

// Agregar un producto al carrito
exports.addToCart = async (req, res) => {
  try {
    console.log("Usuario completo en addToCart:", req.user);
    console.log("Token decodificado:", req.user);
    
    if (!req.user || !req.user._id) {
      console.log("Error: Usuario no encontrado en el request");
      return res.status(401).json({ 
        message: "Usuario no autenticado correctamente",
        debug: { user: req.user }
      });
    }

    const userId = req.user._id;
    console.log("ID del usuario:", userId);
    
    const { productId, quantity } = req.body;
    console.log("Datos recibidos:", { productId, quantity });

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    // Verificar stock disponible
    if (product.stock < quantity) {
      return res.status(400).json({ message: "No hay suficiente stock disponible" });
    }

    // Buscar o crear el carrito del usuario
    let cart = await Cart.findOne({ user: userId });
    console.log("Carrito existente:", cart);

    if (!cart) {
      console.log("Creando nuevo carrito para el usuario:", userId);
      cart = new Cart({
        user: userId,
        products: []
      });
    }

    // Verificar si el producto ya existe en el carrito
    const existingProductIndex = cart.products.findIndex(
      item => item.product.toString() === productId
    );

    if (existingProductIndex > -1) {
      // Actualizar cantidad si el producto ya existe
      const newQuantity = cart.products[existingProductIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({ message: "No hay suficiente stock disponible" });
      }
      cart.products[existingProductIndex].quantity = newQuantity;
    } else {
      // Agregar nuevo producto al carrito
      cart.products.push({
        product: productId,
        quantity: quantity
      });
    }

    // Guardar el carrito
    console.log("Guardando carrito:", cart);
    const savedCart = await cart.save();
    console.log("Carrito guardado:", savedCart);

    // Obtener el carrito actualizado con los productos poblados
    const updatedCart = await Cart.findById(cart._id).populate("products.product");
    
    res.json({
      message: "Producto agregado al carrito",
      cart: updatedCart
    });
  } catch (error) {
    console.error("Error completo en addToCart:", error);
    res.status(500).json({
      message: "Error al agregar al carrito",
      error: error.message,
      debug: {
        user: req.user,
        body: req.body
      }
    });
  }
};

// Eliminar un producto del carrito
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    cart.products = cart.products.filter(p => p.product.toString() !== productId);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate("products.product");
    res.json({
      message: "Producto eliminado del carrito",
      cart: updatedCart
    });
  } catch (error) {
    console.error("Error en removeFromCart:", error);
    res.status(500).json({
      message: "Error al eliminar producto del carrito",
      error: error.message
    });
  }
};

// Vaciar el carrito
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { products: [] } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    res.json({
      message: "Carrito vaciado correctamente",
      cart
    });
  } catch (error) {
    console.error("Error en clearCart:", error);
    res.status(500).json({
      message: "Error al vaciar el carrito",
      error: error.message
    });
  }
};

// Actualizar cantidad de un producto en el carrito
exports.updateProductQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    // Verificar que la cantidad sea válida
    if (quantity < 1) {
      return res.status(400).json({ message: "La cantidad debe ser mayor a 0" });
    }

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Verificar stock disponible
    if (product.stock < quantity) {
      return res.status(400).json({ message: "No hay suficiente stock disponible" });
    }

    // Buscar el carrito del usuario
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    // Encontrar el producto en el carrito
    const productIndex = cart.products.findIndex(
      item => item.product.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Producto no encontrado en el carrito" });
    }

    // Actualizar la cantidad
    cart.products[productIndex].quantity = quantity;
    await cart.save();

    // Devolver el carrito actualizado con los productos poblados
    const updatedCart = await Cart.findById(cart._id).populate("products.product");
    res.json({
      message: "Cantidad actualizada correctamente",
      cart: updatedCart
    });

  } catch (error) {
    console.error("Error al actualizar cantidad:", error);
    res.status(500).json({
      message: "Error al actualizar la cantidad",
      error: error.message
    });
  }
};
