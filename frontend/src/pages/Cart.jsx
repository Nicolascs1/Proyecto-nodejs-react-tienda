import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Debes iniciar sesión para ver tu carrito");
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartItems(response.data.products || []);
    } catch (error) {
      console.error("Error al obtener el carrito:", error);
      setError("Error al cargar el carrito");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");
      
      // Primero eliminar el producto actual
      await axios.delete(`${import.meta.env.VITE_API_URL}/cart/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Luego agregar el producto con la nueva cantidad
      await axios.post(
        `${import.meta.env.VITE_API_URL}/cart`,
        { productId, quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Actualizar el estado manteniendo el orden original
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.product._id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      console.error("Error al actualizar la cantidad:", error);
      alert(error.response?.data?.message || "Error al actualizar la cantidad");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/cart/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setCartItems(prevItems => prevItems.filter(item => item.product._id !== productId));
    } catch (error) {
      console.error("Error al eliminar del carrito:", error);
      alert("Error al eliminar el producto del carrito");
    }
  };

  const handleClearCart = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setCartItems([]);
    } catch (error) {
      console.error("Error al vaciar el carrito:", error);
      alert("Error al vaciar el carrito");
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-red-500">{error}</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Ir a Iniciar Sesión
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Cargando carrito...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-6 text-center">🛒 Carrito de Compras</h1>

      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Ir a Productos
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cartItems.map((item) => (
              <div key={item.product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {item.product.image && (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{item.product.name}</h2>
                  <p className="text-gray-600 mb-2">{item.product.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-bold text-blue-600">${item.product.price}</p>
                    <p className="text-sm text-gray-500">Stock: {item.product.stock}</p>
                  </div>
                  <div className="flex items-center space-x-4 mb-4">
                    <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                        disabled={updating || item.quantity <= 1}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 1;
                          if (newValue >= 1 && newValue <= item.product.stock) {
                            handleQuantityChange(item.product._id, newValue);
                          }
                        }}
                        disabled={updating}
                        className="w-16 text-center border-x px-2 py-1"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                        disabled={updating || item.quantity >= item.product.stock}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.product._id)}
                    disabled={updating}
                    className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    Eliminar del Carrito
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-semibold">Total del Carrito:</span>
              <span className="text-2xl font-bold text-blue-600">${calculateTotal()}</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleClearCart}
                disabled={updating}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                Vaciar Carrito
              </button>
              <button
                onClick={() => navigate("/checkout")}
                disabled={updating}
                className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                Proceder al Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
  