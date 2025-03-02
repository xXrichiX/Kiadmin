import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/OrdersPage.css";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Estado para traducción de estados
  const statusTranslations = {
    pending: 'Pendiente',
    'en preparacion': 'En preparación',
    completed: 'Completado',
    'pendiente de pago': 'Pendiente de pago'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) return navigate("/login");
        
        // Obtener órdenes y productos en paralelo
        const [ordersResponse, productsResponse] = await Promise.all([
          fetch("https://orderandout-refactor.onrender.com/api/orders/mineOrders", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("https://orderandout-refactor.onrender.com/api/products/mineProducts", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // Procesar respuestas
        const ordersData = await ordersResponse.json();
        const productsData = await productsResponse.json();
        
        if (!ordersResponse.ok || !productsResponse.ok) {
          throw new Error(ordersData.message || productsData.message || "Error al cargar datos");
        }

        setOrders(ordersData);
        setProducts(productsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Crear mapa de IDs a nombres de productos
  const productMap = products.reduce((acc, product) => {
    acc[product._id] = product.name;
    return acc;
  }, {});

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = Cookies.get("authToken");
      const response = await fetch("https://orderandout-refactor.onrender.com/api/orders/myOrder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          status: newStatus
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar estado");
      }

      // Actualizar estado local
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
    } catch (err) {
      setError(err.message);
      console.error("Error actualizando orden:", err);
    }
  };

  if (loading) return <div className="loading">Cargando órdenes...</div>;
  if (error) return <div className="error">Error: {error}</div>;

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
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order.numOrder}</td>
                <td>
                  {order.products.map(p => (
                    <div key={p._id}>
                      {productMap[p.productId] || `Producto (${p.productId})`}
                    </div>
                  ))}
                </td>
                <td>
                  {order.products.map(p => (
                    <div key={p._id}>
                      x{p.quantity}
                    </div>
                  ))}
                </td>
                <td>${order.totalPrice} {order.currency}</td>
                <td>{order.paymentMethod}</td>
                <td>
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`status-select ${order.status}`}
                  >
                    {Object.keys(statusTranslations).map(status => (
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