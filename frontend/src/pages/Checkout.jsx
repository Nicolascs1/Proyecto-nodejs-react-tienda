import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(response.data.products);
        setLoading(false);
      } catch (error) {
        setError("Error al cargar el carrito");
        setLoading(false);
      }
    };

    if (user) {
      fetchCart();
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");

      // 1. Crear la orden
      const orderResponse = await axios.post(
        "http://localhost:5000/api/orders",
        { cartId: cartItems[0]._id }, // Asumimos que todos los items son del mismo carrito
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const orderId = orderResponse.data._id;
      setOrder(orderResponse.data);

      // 2. Crear sesión de pago en Stripe
      const paymentResponse = await axios.post(
        `http://localhost:5000/api/payments/create-checkout-session/${orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (paymentResponse.data.url) {
        // Redirigir a la página de pago de Stripe
        window.location.replace(paymentResponse.data.url);
      } else {
        throw new Error("No se recibió la URL de Stripe");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error al procesar el pago");
      setProcessing(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!cartItems.length) return <div>Tu carrito está vacío</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Resumen del pedido */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
          {cartItems.map((item) => (
            <div key={item._id} className="flex justify-between mb-2">
              <span>
                {item.product.name} x {item.quantity}
              </span>
              <span>${item.product.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>
        </div>

        {/* Información de pago */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Información de Pago</h2>
          <p className="mb-4">
            Serás redirigido a Stripe para completar el pago de forma segura.
          </p>
          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {processing ? "Procesando..." : "Pagar con Stripe"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
  