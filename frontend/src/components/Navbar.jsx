import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800 text-white p-4 z-50 shadow-lg w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-lg font-bold">
          Mi Tienda
        </Link>

        {/* Mensaje de Bienvenida */}
        <div>
          {user && (
            <span className="px-4 text-green-400 font-bold">
              Bienvenido, {user.name}
            </span>
          )}
        </div>

        {/* Enlaces de Navegación */}
        <div className="flex items-center space-x-12">
          <Link to="/" className="hover:text-blue-400 transition-colors duration-200 px-4 py-2 rounded-md hover:bg-gray-700 text-base">
            Inicio
          </Link>
          <Link to="/cart" className="hover:text-blue-400 transition-colors duration-200 px-4 py-2 rounded-md hover:bg-gray-700 text-base">
            Carrito
          </Link>
          <Link to="/orders" className="hover:text-blue-400 transition-colors duration-200 px-4 py-2 rounded-md hover:bg-gray-700 text-base">
            Pedidos
          </Link>
          <Link to="/checkout" className="hover:text-blue-400 transition-colors duration-200 px-4 py-2 rounded-md hover:bg-gray-700 text-base">
            Pagar
          </Link>

          {user?.role === "admin" && (
            <Link to="/add-product" className="hover:text-yellow-400 transition-colors duration-200 px-4 py-2 rounded-md hover:bg-gray-700 text-base">
              Agregar Producto
            </Link>
          )}
        </div>

        {/* Opciones de Autenticación */}
        <div>
          {user ? (
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200 text-base"
            >
              Cerrar Sesión
            </button>
          ) : (
            <div className="flex items-center space-x-8">
              <Link to="/login" className="hover:text-blue-400 transition-colors duration-200 px-4 py-2 rounded-md hover:bg-gray-700 text-base">
                Login
              </Link>
              <Link to="/register" className="hover:text-blue-400 transition-colors duration-200 px-4 py-2 rounded-md hover:bg-gray-700 text-base">
                Registro
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
