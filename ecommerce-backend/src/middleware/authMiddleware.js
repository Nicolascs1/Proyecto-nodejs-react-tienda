const jwt = require("jsonwebtoken");

// Middleware para verificar si el usuario está autenticado
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Acceso denegado, token faltante o malformado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // ✅ Guardamos el usuario decodificado en `req.user`
    next();
  } catch (error) {
    return res.status(400).json({ message: "Token inválido o expirado" });
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
