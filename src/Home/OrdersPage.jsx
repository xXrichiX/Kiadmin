import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/OrdersPage.css";

function OrdersPage() {
  /////////////////// ESTADOS ///////////////////
  const [orders, setOrders] = useState([]); // Estado para almacenar las órdenes
  const [products, setProducts] = useState([]); // Estado para almacenar los productos
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const [error, setError] = useState(""); // Estado para manejar errores
  const navigate = useNavigate(); // Hook para navegar entre rutas
  const API_URL = import.meta.env.VITE_API_URL; // URL de la API desde variables de entorno

  /////////////////// TRADUCCIÓN DE ESTADOS ///////////////////
  // Mapeo de estados de órdenes a nombres en español
  const statusTranslations = {
    pending: "Pendiente",
    "en preparacion": "En preparación",
    completed: "Completado",
    "pendiente de pago": "Pendiente de pago",
  };

  /////////////////// FUNCIONES AUXILIARES PARA FETCH ///////////////////
  const checkToken = () => {
    const token = Cookies.get("authToken");
    if (!token) {
      navigate("/login");
      return null;
    }
    return token;
  };

  const fetchAPI = async (endpoint, method = "GET", body = null) => {
    const token = checkToken();
    if (!token) return null;

    try {
      const options = {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        ...(body && { body: JSON.stringify(body) }),
      };

      const response = await fetch(`${API_URL}${endpoint}`, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error del servidor: ${response.status}`,
        }));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  /////////////////// OBTENER DATOS (ÓRDENES Y PRODUCTOS) ///////////////////
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener órdenes y productos en paralelo
        const [ordersData, productsData] = await Promise.all([
          fetchAPI("/api/orders/mineOrders"),
          fetchAPI("/api/products/mineProducts"),
        ]);

        // Actualizar estados con los datos obtenidos
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        // Manejar errores
        setError(err.message || "Ocurrió un error al obtener los datos");
      } finally {
        // Finalizar la carga
        setLoading(false);
      }
    };

    fetchData(); // Llamar a la función para obtener datos
  }, [navigate]);

  /////////////////// MAPA DE PRODUCTOS ///////////////////
  // Crear un mapa de productos para obtener nombres por ID
  const productMap = products.reduce((acc, product) => {
    acc[product._id] = product.name;
    return acc;
  }, {});

  /////////////////// CAMBIAR ESTADO DE UNA ORDEN ///////////////////
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Enviar solicitud para actualizar el estado de la orden
      await fetchAPI("/api/orders/myOrder", "PUT", {
        orderId,
        status: newStatus,
      });

      // Actualizar el estado localmente
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      // Manejar errores
      setError(err.message || "Ocurrió un error al actualizar la orden");
    }
  };

  /////////////////// RENDERIZADO CONDICIONAL ///////////////////
  if (loading) return <div className="loading">Cargando órdenes...</div>; // Mostrar mensaje de carga
  if (error) return <div className="error">Error: {error}</div>; // Mostrar mensaje de error

  return (
    <div className="orders-page">
      <h2 className="page-title">Lista de Órdenes</h2>
      <div className="orders-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Número de Orden</th>
              <th>Productos</th>
              <th>Cantidad</th>
              <th>Total</th>
              <th>Método de Pago</th>
              <th>Estado</th>
              <th>Tipo de Orden</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.numOrder}</td>
                <td>
                  {order.products.map((p) => (
                    <div key={p._id}>
                      {productMap[p.productId] || `Producto (${p.productId})`}
                    </div>
                  ))}
                </td>
                <td>
                  {order.products.map((p) => (
                    <div key={p._id}>x{p.quantity}</div>
                  ))}
                </td>
                <td>
                  ${order.totalPrice} {order.currency}
                </td>
                <td>{order.paymentMethod}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`status-select ${order.status}`}
                  >
                    {Object.keys(statusTranslations).map((status) => (
                      <option key={status} value={status}>
                        {statusTranslations[status]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{order.orderType}</td>
                <td>
                  {new Date(order.createdAt).toLocaleDateString()}
                  <br />
                  {new Date(order.createdAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrdersPage;