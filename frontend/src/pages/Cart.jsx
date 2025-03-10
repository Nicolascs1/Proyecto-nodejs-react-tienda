import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Obteniendo carrito...');
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Respuesta del carrito:', response.data);
      setCart(response.data.cart || response.data);
    } catch (error) {
      console.error('Error al obtener el carrito:', error);
      toast.error('Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Actualizando cantidad:', { productId, newQuantity });
      
      const response = await axios.put(
        `http://localhost:5000/api/cart/products/${productId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      console.log('Respuesta de actualización:', response.data);
      
      if (response.data.cart) {
        setCart(response.data.cart);
        toast.success('Cantidad actualizada');
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar cantidad');
      await fetchCart();
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCart();
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('Error al eliminar producto');
    }
  };

  const handleProceedToCheckout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!cart || !cart._id) {
        toast.error('No hay productos en el carrito');
        return;
      }

      // Crear la orden
      await axios.post('http://localhost:5000/api/orders',
        { cartId: cart._id },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      toast.success('Orden creada exitosamente');
      navigate('/orders');
    } catch (error) {
      console.error('Error al crear la orden:', error);
      toast.error('Error al crear la orden');
    }
  };

  if (loading) {
    return <div className="text-center mt-20">Cargando carrito...</div>;
  }

  // Verificar si el carrito está vacío
  if (!cart || !cart.products || cart.products.length === 0) {
    return (
      <div className="text-center mt-20">
        <p className="text-xl mb-4">Tu carrito está vacío</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Ver Productos
        </button>
      </div>
    );
  }

  const calculateTotal = () => {
    return cart.products.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h2 className="text-2xl font-bold mb-6">Tu Carrito</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cart.products.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md p-6">
            {item.product.image && (
              <img 
                src={item.product.image} 
                alt={item.product.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <h3 className="text-lg font-semibold mb-2">{item.product.name}</h3>
            <p className="text-gray-600 mb-2">${item.product.price}</p>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={updating || item.quantity <= 1}
                >
                  -
                </button>
                <span className="mx-2">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={updating || item.quantity >= item.product.stock}
                >
                  +
                </button>
              </div>
              <button
                onClick={() => handleRemoveProduct(item.product._id)}
                className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={updating}
              >
                Eliminar
              </button>
            </div>
            <p className="text-right font-semibold">
              Total: ${item.product.price * item.quantity}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col items-end">
        <p className="text-xl font-bold mb-4">
          Total del Carrito: ${calculateTotal()}
        </p>
        <button
          onClick={handleProceedToCheckout}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={updating}
        >
          Generar Orden
        </button>
      </div>
    </div>
  );
};

export default Cart;
  