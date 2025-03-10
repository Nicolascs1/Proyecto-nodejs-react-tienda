import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Debes iniciar sesión para ver los productos.");
      return;
    }

    axios.get(`${import.meta.env.VITE_API_URL}/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        const availableProducts = res.data.filter(product => product.stock > 0);
        setProducts(availableProducts);
        // Inicializar las cantidades en 1 para cada producto
        const initialQuantities = {};
        availableProducts.forEach(product => {
          initialQuantities[product._id] = 1;
        });
        setQuantities(initialQuantities);
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          setError("Acceso denegado. Debes iniciar sesión.");
        } else {
          setError("Error al obtener productos.");
        }
      });
  }, []);

  const handleQuantityChange = (productId, value) => {
    const product = products.find(p => p._id === productId);
    const newValue = Math.min(Math.max(1, value), product.stock);
    setQuantities(prev => ({
      ...prev,
      [productId]: newValue
    }));
  };

  const handleAddToCart = async (productId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/cart`,
        { 
          productId,
          quantity: quantities[productId]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      alert("Producto agregado al carrito exitosamente");
      // Resetear la cantidad a 1 después de agregar al carrito
      setQuantities(prev => ({
        ...prev,
        [productId]: 1
      }));
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      alert("Error al agregar el producto al carrito");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">🛒 Productos Disponibles</h1>

      {products.length === 0 ? (
        <p className="text-gray-600 text-center">No hay productos en stock.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="p-6 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow">
              {product.image && (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h2 className="text-xl font-bold mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-bold text-blue-600">${product.price}</p>
                <p className="text-sm text-gray-500">Stock: {product.stock}</p>
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => handleQuantityChange(product._id, quantities[product._id] - 1)}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800"
                    disabled={quantities[product._id] <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantities[product._id]}
                    onChange={(e) => handleQuantityChange(product._id, parseInt(e.target.value) || 1)}
                    className="w-16 text-center border-x px-2 py-1"
                  />
                  <button
                    onClick={() => handleQuantityChange(product._id, quantities[product._id] + 1)}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800"
                    disabled={quantities[product._id] >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
              <button 
                onClick={() => handleAddToCart(product._id)}
                disabled={loading}
                className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                  loading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {loading ? "Agregando..." : "Agregar al Carrito"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
