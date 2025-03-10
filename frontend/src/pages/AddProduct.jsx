import { useState, useEffect } from "react";
import axios from "axios";

function AddProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [updateStock, setUpdateStock] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stockUpdates, setStockUpdates] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      console.log("Intentando obtener productos de:", `${import.meta.env.VITE_API_URL}/products`);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Respuesta del servidor:", response.data);
      setProducts(response.data);
    } catch (error) {
      console.error("Error detallado al obtener productos:", error);
      setError(error.response?.data?.message || "Error al obtener los productos");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/products`,
        { 
          name, 
          description, 
          price: Number(price),
          category,
          stock: Number(stock),
          image 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("✅ Producto agregado exitosamente");
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setStock("");
      setImage("");
      fetchProducts();
    } catch (error) {
      console.error("❌ Error al agregar el producto:", error.response?.data || error);
      alert(error.response?.data?.message || "Error al agregar el producto");
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const product = products.find(p => p._id === selectedProduct);
      const newStock = product.stock + Number(updateStock);

      await axios.put(
        `${import.meta.env.VITE_API_URL}/products/${selectedProduct}`,
        { stock: newStock },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("✅ Stock actualizado exitosamente");
      setUpdateStock("");
      fetchProducts();
    } catch (error) {
      console.error("❌ Error al actualizar el stock:", error.response?.data || error);
      alert(error.response?.data?.message || "Error al actualizar el stock");
    }
  };

  const handleQuickStockUpdate = async (productId, currentStock, updateAmount) => {
    if (!updateAmount) return;
    
    const token = localStorage.getItem("token");
    try {
      const newStock = currentStock + Number(updateAmount);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/products/${productId}`,
        { stock: newStock },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setStockUpdates({ ...stockUpdates, [productId]: "" });
      fetchProducts();
    } catch (error) {
      console.error("❌ Error al actualizar el stock:", error.response?.data || error);
      alert(error.response?.data?.message || "Error al actualizar el stock");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Formulario para agregar nuevo producto */}
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
            <h1 className="text-2xl font-bold mb-4">Agregar Producto</h1>

            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700">Nombre</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700">Descripción</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="price" className="block text-gray-700">Precio</label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="category" className="block text-gray-700">Categoría</label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="stock" className="block text-gray-700">Stock Inicial</label>
              <input
                type="number"
                id="stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="image" className="block text-gray-700">URL de la imagen</label>
              <input
                type="url"
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Agregar Producto
            </button>
          </form>

          {/* Formulario para actualizar stock */}
          <form onSubmit={handleUpdateStock} className="bg-white p-6 rounded shadow-md">
            <h1 className="text-2xl font-bold mb-4">Actualizar Stock</h1>

            <div className="mb-4">
              <label htmlFor="productSelect" className="block text-gray-700">Seleccionar Producto</label>
              <select
                id="productSelect"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccione un producto</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} - Stock actual: {product.stock}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="updateStock" className="block text-gray-700">Cantidad a agregar/quitar</label>
              <input
                type="number"
                id="updateStock"
                value={updateStock}
                onChange={(e) => setUpdateStock(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Use números negativos para quitar stock</p>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Actualizar Stock
            </button>
          </form>
        </div>

        {/* Tabla de productos */}
        <div className="mt-8 bg-white p-6 rounded shadow-md">
          <h2 className="text-2xl font-bold mb-4">Productos Existentes</h2>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No hay productos disponibles
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actualizar Stock</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.image && (
                            <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt={product.name} />
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${product.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={stockUpdates[product._id] || ""}
                            onChange={(e) => setStockUpdates({ ...stockUpdates, [product._id]: e.target.value })}
                            className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Cantidad"
                          />
                          <button
                            onClick={() => handleQuickStockUpdate(product._id, product.stock, stockUpdates[product._id])}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            Agregar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
