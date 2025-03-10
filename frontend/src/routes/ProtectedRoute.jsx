import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem("token"); // Aquí iría tu lógica de autenticación
  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
