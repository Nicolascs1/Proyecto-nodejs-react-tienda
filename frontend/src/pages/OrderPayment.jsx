import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function OrderPayment() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Debes iniciar sesión para ver la orden");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrder(response.data);
    } catch (error) {
      console.error("Error al obtener la orden:", error);
      setError("Error al cargar la orden");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/payments/create-checkout-session/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.url) {
        window.location.replace(response.data.url);
      } else {
        throw new Error("No se recibió la URL de pago de Stripe");
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      setError(error.response?.data?.message || "Error al procesar el pago");
    } finally {
      setProcessing(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen mt-16">
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
      <div className="flex items-center justify-center min-h-screen mt-16">
        <p className="text-xl">Cargando orden...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen mt-16">
        <p className="text-xl text-gray-600">Orden no encontrada</p>
        <button
          onClick={() => navigate("/orders")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Ver Mis Órdenes
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-6 text-center">💳 Pago de Orden #{orderId}</h1>
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Resumen de la Orden</h2>
          <div className="space-y-4">
            {order.products.map((item) => (
              <div key={item.product._id} className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                </div>
                <p className="font-semibold">${item.product.price * item.quantity}</p>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-blue-600">${order.totalPrice}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Información de Pago</h2>
          <p className="text-gray-600 mb-6">
            Serás redirigido a Stripe para completar tu pago de forma segura.
            Aceptamos tarjetas de crédito y débito.
          </p>
          <button
            onClick={handlePayment}
            disabled={processing || order.status === "Pagado"}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors duration-200"
          >
            {order.status === "Pagado" 
              ? "Orden Pagada" 
              : processing 
                ? "Procesando..." 
                : "Pagar con Stripe"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderPayment; 