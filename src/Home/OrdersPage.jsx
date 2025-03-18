import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/OrdersPage.css";

function OrdersPage() {
  // Estados
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    cancelled: 0,
  });
  
  // Estado para mostrar detalles de productos
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 20; // Fijo a 20 órdenes por página
  
  // Filtros
  const [filters, setFilters] = useState({
    status: "",
    orderType: "",
    dateFrom: "",
    dateTo: "",
    paymentMethod: "",
    searchTerm: "",
    sortBy: "dateDesc", // Ordenar por fecha descendente por defecto
  });
  
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Traducción de estados
  const statusTranslations = {
    "finalizado": "Finalizado",
    "preparando": "Preparando",
    "pendiente": "Pendiente",
    "cancelado": "Cancelado",
  };

  // Traducción de tipos de orden
  const orderTypeTranslations = {
    "llevar": "Para llevar",
    "comer aquí": "Para comer aquí",
  };

  // Métodos de pago disponibles
  const paymentMethods = ["efectivo", "tarjeta", "transferencia"];

  // Opciones de ordenación
  const sortOptions = [
    { value: "dateDesc", label: "Más recientes primero" },
    { value: "dateAsc", label: "Más antiguas primero" },
    { value: "numberAsc", label: "Número de orden (ascendente)" },
    { value: "numberDesc", label: "Número de orden (descendente)" },
    { value: "priceAsc", label: "Precio (menor a mayor)" },
    { value: "priceDesc", label: "Precio (mayor a menor)" },
  ];

  // Funciones auxiliares para fetch
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

  // Obtener datos (órdenes y productos)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener órdenes y productos en paralelo
        const [ordersData, productsData] = await Promise.all([
          fetchAPI("/api/orders/mineOrders"),
          fetchAPI("/api/products/mineProducts"),
        ]);

        // Verificar y actualizar estados con los datos obtenidos
        const validOrders = Array.isArray(ordersData) ? ordersData : [];
        
        // Asegurarse de que todas las órdenes tengan un estado válido
        const processedOrders = validOrders.map(order => ({
          ...order,
          status: order.status || "pendiente" // Establecer "pendiente" como valor predeterminado
        }));
        
        setOrders(processedOrders);
        setFilteredOrders(processedOrders);
        setProducts(Array.isArray(productsData) ? productsData : []);
        
        // Calcular estadísticas
        calculateOrderStats(processedOrders);
      } catch (err) {
        setError(err.message || "Ocurrió un error al obtener los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Calcular estadísticas de órdenes
  const calculateOrderStats = (orders) => {
    const stats = {
      total: orders.length,
      completed: orders.filter(order => order.status === "finalizado").length,
      pending: orders.filter(order => order.status === "pendiente").length,
      inProgress: orders.filter(order => order.status === "preparando").length,
      cancelled: orders.filter(order => order.status === "cancelado").length,
    };
    setOrderStats(stats);
  };

  // Aplicar ordenación a las órdenes
  const applySorting = (orders, sortBy) => {
    const sortedOrders = [...orders];
    
    switch (sortBy) {
      case "dateDesc":
        return sortedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "dateAsc":
        return sortedOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "numberAsc":
        return sortedOrders.sort((a, b) => (a.numOrder || 0) - (b.numOrder || 0));
      case "numberDesc":
        return sortedOrders.sort((a, b) => (b.numOrder || 0) - (a.numOrder || 0));
      case "priceAsc":
        return sortedOrders.sort((a, b) => (a.totalSale || 0) - (b.totalSale || 0));
      case "priceDesc":
        return sortedOrders.sort((a, b) => (b.totalSale || 0) - (a.totalSale || 0));
      default:
        return sortedOrders;
    }
  };

  // Filtrar órdenes
  useEffect(() => {
    let result = [...orders];
    
    // Filtrar por estado
    if (filters.status) {
      result = result.filter(order => order.status === filters.status);
    }
    
    // Filtrar por tipo de orden
    if (filters.orderType) {
      result = result.filter(order => order.orderType === filters.orderType);
    }
    
    // Filtrar por método de pago
    if (filters.paymentMethod) {
      result = result.filter(order => order.paymentMethod === filters.paymentMethod);
    }
    
    // Filtrar por rango de fechas
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(order => new Date(order.createdAt) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Establecer a final del día
      result = result.filter(order => new Date(order.createdAt) <= toDate);
    }
    
    // Filtrar por término de búsqueda (en número de orden o notas)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(order => 
        (order.numOrder?.toString().includes(searchLower)) ||
        (order.notes?.toLowerCase().includes(searchLower))
      );
    }
    
    // Aplicar ordenación
    result = applySorting(result, filters.sortBy);
    
    setFilteredOrders(result);
    setCurrentPage(1); // Resetear a primera página al filtrar
  }, [filters, orders]);

  // Cambiar estado de una orden
  const handleStatusChange = async (orderId, newStatus) => {
    // Asegurarse de que el nuevo estado sea uno de los permitidos
    if (!["pendiente", "preparando", "finalizado", "cancelado"].includes(newStatus)) {
      setError("Estado no válido");
      return;
    }

    try {
      await fetchAPI(`/api/orders/myOrder/${orderId}`, "PUT", {
        status: newStatus,
      });

      // Actualizar el estado localmente
      setOrders((prevOrders) => {
        const updatedOrders = prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        );
        calculateOrderStats(updatedOrders);
        return updatedOrders;
      });
    } catch (err) {
      setError(err.message || "Ocurrió un error al actualizar la orden");
    }
  };

  // Formatear precio con moneda - CORREGIDO
  const formatPrice = (price, currency = "MXN") => {
    // Asegurarse de que price es un número
    const numericPrice = Number(price);
    
    if (isNaN(numericPrice)) {
      return `$0.00 ${currency}`;
    }
    
    return `$${numericPrice.toFixed(2)} ${currency}`;
  };

  // Calcular ganancia
  const calculateProfit = (sale, cost) => {
    // Asegurarse de que ambos valores son numéricos
    const numSale = Number(sale) || 0;
    const numCost = Number(cost) || 0;
    return numSale - numCost;
  };

  // Manejar cambios en filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Resetear filtros
  const resetFilters = () => {
    setFilters({
      status: "",
      orderType: "",
      dateFrom: "",
      dateTo: "",
      paymentMethod: "",
      searchTerm: "",
      sortBy: "dateDesc", // Mantener la ordenación por defecto
    });
  };

  // Toggle para expandir detalles de productos
  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Obtener resumen de productos
  const getProductSummary = (orderProducts) => {
    if (!orderProducts || orderProducts.length === 0) return "Sin productos";
    
    // Si hay más de 2 productos, mostrar solo los primeros 2 y un contador
    if (orderProducts.length > 2) {
      const firstTwo = orderProducts.slice(0, 2).map(p => {
        const productInfo = products.find(prod => prod._id === p.productId) || {};
        const productName = p.name || productInfo.name || 'Producto';
        return `${productName} (${p.quantity})`;
      }).join(', ');
      
      return `${firstTwo} y ${orderProducts.length - 2} más`;
    }
    
    // Mostrar todos si son 2 o menos
    return orderProducts.map(p => {
      const productInfo = products.find(prod => prod._id === p.productId) || {};
      const productName = p.name || productInfo.name || 'Producto';
      return `${productName} (${p.quantity})`;
    }).join(', ');
  };

  // Obtener vista detallada de productos - CORREGIDO
  const DetailedProducts = ({ products: orderProducts, orderCurrency = "MXN" }) => {
    return (
      <div className="detailed-products">
        <table className="product-details-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {orderProducts && orderProducts.map((product, index) => {
              // Buscar información del producto en la lista de productos
              const productInfo = products.find(p => p._id === product.productId) || {};
              
              // Usar el nombre del producto desde los datos de la orden o buscar en la lista de productos
              const productName = product.name || productInfo.name || `Producto ${index + 1}`;
              
              // Asegurarse de que el precio y la cantidad sean números válidos
              const price = parseFloat(product.price) || 0;
              const quantity = parseInt(product.quantity) || 0;
              
              // Calcular el subtotal
              const subtotal = price * quantity;
              
              return (
                <tr key={index}>
                  <td>{productName}</td>
                  <td>{quantity}</td>
                  <td>{formatPrice(price, orderCurrency)}</td>
                  <td>{formatPrice(subtotal, orderCurrency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Truncar notas largas
  const truncateNotes = (notes, maxLength = 20) => {
    if (!notes) return "-";
    return notes.length > maxLength 
      ? `${notes.substring(0, maxLength)}...` 
      : notes;
  };

  // Lógica de paginación
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Renderizado condicional
  if (loading) return <div className="loading">Cargando órdenes...</div>;
  if (error) return <div className="error">Error: {error}</div>;


  return (
    <div className="orders-page">
      <h2 className="page-title">Gestión de Órdenes</h2>
      
      {/* Resumen de estadísticas */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Órdenes Totales</h3>
          <p>{orderStats.total}</p>
        </div>
        <div className="stat-card completed">
          <h3>Finalizadas</h3>
          <p>{orderStats.completed}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pendientes</h3>
          <p>{orderStats.pending}</p>
        </div>
        <div className="stat-card in-progress">
          <h3>En Preparación</h3>
          <p>{orderStats.inProgress}</p>
        </div>
        <div className="stat-card cancelled">
          <h3>Canceladas</h3>
          <p>{orderStats.cancelled}</p>
        </div>
      </div>
      
      {/* Panel de filtros */}
      <div className="filters-panel">
        <h3>Filtros</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="status">Estado:</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              {Object.keys(statusTranslations).map(status => (
                <option key={status} value={status}>
                  {statusTranslations[status]}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="orderType">Tipo de Orden:</label>
            <select
              id="orderType"
              name="orderType"
              value={filters.orderType}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              {Object.keys(orderTypeTranslations).map(type => (
                <option key={type} value={type}>
                  {orderTypeTranslations[type]}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="paymentMethod">Método de Pago:</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={filters.paymentMethod}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Campo de ordenación */}
          <div className="filter-group">
            <label htmlFor="sortBy">Ordenar por:</label>
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="dateFrom">Desde:</label>
            <input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="dateTo">Hasta:</label>
            <input
              type="date"
              id="dateTo"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="searchTerm">Buscar:</label>
            <input
              type="text"
              id="searchTerm"
              name="searchTerm"
              placeholder="Número de orden o notas..."
              value={filters.searchTerm}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        
        <div className="filter-actions">
          <button onClick={resetFilters} className="reset-btn">
            Limpiar Filtros
          </button>
        </div>
      </div>
      
      {/* Resultados y tabla */}
      <div className="results-info">
        <p>Mostrando {currentOrders.length} de {filteredOrders.length} órdenes</p>
      </div>
      
      <div className="orders-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Productos</th>
              <th>Costo</th>
              <th>Venta</th>
              <th>Ganancia</th>
              <th>Método de Pago</th>
              <th>Estado</th>
              <th>Tipo de Orden</th>
              <th>Fecha</th>
              <th>Notas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length === 0 ? (
              <tr>
                <td colSpan="11" className="no-orders">No hay órdenes disponibles con los filtros seleccionados</td>
              </tr>
            ) : (
              currentOrders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr className={order.status.replace(/ /g, '-')}>
                    <td>{order.numOrder}</td>
                    <td className="products-cell">
                      {getProductSummary(order.products)}
                    </td>
                    <td>{formatPrice(order.totalCost || 0, order.currency)}</td>
                    <td>{formatPrice(order.totalSale || 0, order.currency)}</td>
                    <td>{formatPrice(calculateProfit(order.totalSale || 0, order.totalCost || 0), order.currency)}</td>
                    <td>{order.paymentMethod}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`status-select ${order.status.replace(/ /g, '-')}`}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="preparando">Preparando</option>
                        <option value="finalizado">Finalizado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                    <td>{orderTypeTranslations[order.orderType] || order.orderType}</td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString()}
                      <br />
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="notes-cell">
                      {truncateNotes(order.notes)}
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleOrderDetails(order._id)} 
                        className="detail-toggle-btn"
                      >
                        {expandedOrder === order._id ? 'Ocultar' : 'Detalles'}
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === order._id && (
                    <tr className="expanded-row">
                      <td colSpan="11" className="product-details-container">
                        <div className="expanded-content">
                          <div className="details-section">
                            <h4>Productos</h4>
                            <DetailedProducts products={order.products} orderCurrency={order.currency} />
                          </div>
                          
                          {order.notes && (
                            <div className="details-section">
                              <h4>Notas</h4>
                              <div className="order-notes">{order.notes}</div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Paginación */}
      {filteredOrders.length > 0 && (
        <div className="pagination">
          <button 
            onClick={() => paginate(1)} 
            disabled={currentPage === 1}
            className="page-btn"
          >
            &laquo;
          </button>
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
            className="page-btn"
          >
            &lt;
          </button>
          
          <span className="page-info">
            Página {currentPage} de {totalPages}
          </span>
          
          <button 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            &gt;
          </button>
          <button 
            onClick={() => paginate(totalPages)} 
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            &raquo;
          </button>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;