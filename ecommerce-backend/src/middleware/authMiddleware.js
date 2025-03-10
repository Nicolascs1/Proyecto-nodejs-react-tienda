const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware para verificar si el usuario está autenticado
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Acceso denegado, token faltante o malformado" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token recibido:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decodificado:", decoded);

    // Buscar el usuario en la base de datos usando el id del token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Asignar el usuario completo a req.user
    req.user = user;
    console.log("Usuario asignado a req.user:", req.user);
    
    next();
  } catch (error) {
    console.error("Error en autenticación:", error);
    return res.status(401).json({ 
      message: "Token inválido o expirado",
      error: error.message 
    });
  }
};

// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Acceso denegado, se requiere rol de administrador" });
  }
  next();
};

module.exports = { authMiddleware, isAdmin };
