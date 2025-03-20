import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCost: 0,
    totalGains: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    canceledOrders: 0
  });
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);

  const navigate = useNavigate();

  // Función para verificar el token
  const checkToken = () => {
    const token = Cookies.get("authToken");
    if (!token) {
      navigate("/login");
      return null;
    }
    return token;
  };

  // Función genérica para fetch con autenticación
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

  // Función para cargar productos y crear un mapa
  const fetchProducts = async () => {
    try {
      const productsData = await fetchAPI("/api/products/mineProducts");
      if (Array.isArray(productsData)) {
        // Crear mapa de ID a nombre
        const productMap = productsData.reduce((acc, product) => {
          acc[product._id] = product.name;
          return acc;
        }, {});
        setProductsMap(productMap);
        return productMap;
      }
      return {};
    } catch (err) {
      console.error("Error al cargar productos:", err);
      return {};
    }
  };

  // Verificar endpoints disponibles
  const checkEndpoints = async () => {
    const endpoints = [
      "/api/orders/myDashboard/totalSale",
      "/api/orders/myDashboard/totalCost",
      "/api/orders/myDashboard/totalGains",
      "/api/orders/myDashboard/totalOrders",
      "/api/orders/myDashboard/paymentMethod",
      "/api/orders/myDashboard/topProducts",
      "/api/orders/myDashboard/topCategories"
    ];

    const results = await Promise.all(
      endpoints.map(async endpoint => {
        try {
          const response = await fetch(`${API_URL}${endpoint}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
            headers: {
              Authorization: `Bearer ${checkToken()}`
            }
          });
          return { endpoint, status: response.status, ok: response.ok };
        } catch (err) {
          return { endpoint, error: err.message, ok: false };
        }
      })
    );

    console.table(results);
    const failedEndpoints = results.filter(r => !r.ok);
    return failedEndpoints.length === 0;
  };

  // Función principal para cargar datos
  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      // Comprobar si los endpoints están disponibles
      const endpointsOk = await checkEndpoints();

      if (!endpointsOk) {
        console.warn("Algunos endpoints no están disponibles.");
        setError("Error al conectar con el servidor. Algunos datos pueden no estar disponibles.");
      }

      // Cargar productos primero para tener el mapa disponible
      const productMap = await fetchProducts();

      // Cargar datos con enfoque progresivo incluso si hay errores
      await Promise.allSettled([
        fetchTotalSales(),
        fetchTotalCost(),
        fetchTotalGains(),
        fetchTotalOrders(),
        fetchPaymentMethod(),
        fetchTopProducts(productMap),
        fetchTopCategories()
      ]);

    } catch (err) {
      console.error("Error al cargar el dashboard:", err);
      setError(`Error al cargar el dashboard: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Funciones individuales para cargar cada sección según los endpoints proporcionados
  const fetchTotalSales = async () => {
    try {
      const result = await fetchAPI(`/api/orders/myDashboard/totalSale?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      if (result && result.data) {
        setStats(prev => ({ ...prev, totalSales: result.data.totalSale || 0 }));
      }
    } catch (err) {
      console.error("Error al cargar ventas totales:", err);
    }
  };

  const fetchTotalCost = async () => {
    try {
      const result = await fetchAPI(`/api/orders/myDashboard/totalCost?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      if (result && result.data) {
        setStats(prev => ({ ...prev, totalCost: result.data.totalCost || 0 }));
      }
    } catch (err) {
      console.error("Error al cargar costo total:", err);
    }
  };

  const fetchTotalGains = async () => {
    try {
      const result = await fetchAPI(`/api/orders/myDashboard/totalGains?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      if (result && result.data) {
        setStats(prev => ({ ...prev, totalGains: result.data.totalGains || 0 }));
      }
    } catch (err) {
      console.error("Error al cargar ganancias totales:", err);
    }
  };

  const fetchTotalOrders = async () => {
    try {
      const result = await fetchAPI(`/api/orders/myDashboard/totalOrders?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      if (result && result.data) {
        setStats(prev => ({
          ...prev,
          totalOrders: result.data.totalGeneral || 0,
          completedOrders: result.data.totalFinalizado || 0,
          pendingOrders: result.data.totalPendiente || 0,
          inProgressOrders: result.data.totalPreparando || 0,
          canceledOrders: result.data.totalCancelado || 0
        }));
      }
    } catch (err) {
      console.error("Error al cargar órdenes totales:", err);
    }
  };

  const fetchPaymentMethod = async () => {
    try {
      const result = await fetchAPI(`/api/orders/myDashboard/paymentMethod?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      if (result && result.data) {
        // Procesar los métodos de pago para gráfico
        const methodsData = [
          {
            method: "Efectivo",
            count: result.data.cash?.count || 0,
            cost: result.data.cash?.cost || 0,
            sale: result.data.cash?.sale || 0,
            profit: result.data.cash?.profit || 0
          },
          {
            method: "Tarjeta",
            count: result.data.card?.count || 0,
            cost: result.data.card?.cost || 0,
            sale: result.data.card?.sale || 0,
            profit: result.data.card?.profit || 0
          }
        ];
        
        setPaymentMethods(methodsData);
      }
    } catch (err) {
      console.error("Error al cargar métodos de pago:", err);
      setPaymentMethods([]);
    }
  };

  const fetchTopProducts = async (productMap) => {
    try {
      const result = await fetchAPI(`/api/orders/myDashboard/topProducts?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      if (result && result.data && Array.isArray(result.data)) {
        // Asegurarnos de que tenemos algún dato
        if (result.data.length === 0) {
          setTopProducts([{ name: "Sin datos", value: 1, porcentaje: 100 }]);
          return;
        }

        // Procesar los datos para la gráfica de productos
        const totalProducts = result.data.reduce((sum, item) => sum + (item.quantity || 0), 0);

        // Si no hay productos, evitar división por cero
        if (totalProducts === 0) {
          setTopProducts([{ name: "Sin ventas", value: 1, porcentaje: 100 }]);
          return;
        }

        const formattedData = result.data.map(product => ({
          name: productMap[product.productId] || `Producto ${product.productId.substring(0, 6)}`,
          value: product.quantity || 0,
          porcentaje: parseFloat(((product.quantity / totalProducts) * 100).toFixed(1)) || 0
        }));

        setTopProducts(formattedData);
      } else {
        // Datos por defecto si no hay información
        setTopProducts([{ name: "Sin datos", value: 1, porcentaje: 100 }]);
      }
    } catch (err) {
      console.error("Error al cargar productos principales:", err);
      setTopProducts([{ name: "Error", value: 1, porcentaje: 100 }]);
    }
  };

  const fetchTopCategories = async () => {
    try {
      const result = await fetchAPI(`/api/orders/myDashboard/topCategories?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      if (result && result.data && Array.isArray(result.data)) {
        // Asegurarnos de que tenemos algún dato
        if (result.data.length === 0) {
          setCategoryData([{ name: "Sin datos", ventas: 0 }]);
          return;
        }

        // Formatear los datos para la gráfica de categorías basado en el formato de la API
        const formattedData = result.data.map(category => ({
          name: category.name ? category.name.substring(0, 15) : "Sin categoría",
          ventas: category.count || 0
        }));

        setCategoryData(formattedData);
      } else {
        // Datos por defecto si no hay información
        setCategoryData([{ name: "Sin datos", ventas: 0 }]);
      }
    } catch (err) {
      console.error("Error al cargar categorías principales:", err);
      setCategoryData([{ name: "Error", ventas: 0 }]);
    }
  };

  // Efecto para cargar datos cuando cambian las fechas o períodos
  useEffect(() => {
    if (API_URL) {
      fetchDashboardData();
    }
  }, [selectedPeriod, dateRange.startDate, dateRange.endDate]);

  // Navigate to orders page with filter
  const navigateToOrders = (status) => {
    navigate(`/orders?status=${status}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
  };

  // Colors for charts
  const COLORS = ["#AB0831", "#E74C3C", "#FF8C00", "#FFD700", "#2ECC71", "#3498DB", "#9B59B6"];

  // Función para formatear moneda
  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  // Rendering loading state
  if (loading) return (
    <div className="dashboard-loading12">
      <div className="loading-spinner12"></div>
      <p>Cargando estadísticas...</p>
    </div>
  );

  return (
    <div className="dashboard-container12">
      {error && (
        <div className="dashboard-error-banner12">
          <p>{error}</p>
          <button onClick={() => fetchDashboardData()} className="refresh-button12">
            Reintentar
          </button>
        </div>
      )}

      <div className="dashboard-header12">
        <h1>Dashboard de Ventas</h1>
        <div className="date-range-selector12">
          <label>Desde:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          />
          <label>Hasta:</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          />
        </div>
        <div className="period-selector12">
          {["day", "week", "month"].map((period) => {
            const handleClick = () => {
              const today = new Date();
              let startDate;

              switch (period) {
                case "day":
                  startDate = new Date(today.setDate(today.getDate() - 1));
                  break;
                case "week":
                  startDate = new Date(today.setDate(today.getDate() - 7));
                  break;
                case "month":
                  startDate = new Date(today.setMonth(today.getMonth() - 1));
                  break;
                default:
                  startDate = today;
              }

              setDateRange({
                startDate: startDate.toISOString().split("T")[0],
                endDate: new Date().toISOString().split("T")[0],
              });

              setSelectedPeriod(period);
            };

            return (
              <button
                key={period}
                className={selectedPeriod === period ? "active12" : ""}
                onClick={handleClick}
              >
                {period === "day" ? "Día" : period === "week" ? "Semana" : "Mes"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="dashboard_stats_cards12">
        <div className="dashboard_stat_card12 dashboard_stat_card-312" onClick={() => navigateToOrders("all")}>
          <div className="dashboard_stat_card-content12">
            <h3>Ventas Totales</h3>
            <p className="dashboard_stat_amount12">{formatCurrency(stats.totalSales)}</p>
            <p className="dashboard_stat_description12">Antes de descontar costos</p>
          </div>
          <div className="dashboard_stat_icon12 dashboard_income-icon12">💰</div>
        </div>

        <div className="dashboard_stat_card12 dashboard_stat_card-312">
          <div className="dashboard_stat_card-content12">
            <h3>Costo de Producción</h3>
            <p className="dashboard_stat_amount12">{formatCurrency(stats.totalCost)}</p>
            <p className="dashboard_stat_description12">Total de costos generados</p>
          </div>
          <div className="dashboard_stat_icon12 dashboard_cost-icon12">💸</div>
        </div>

        <div className="dashboard_stat_card12 dashboard_stat_card-312">
          <div className="dashboard_stat_card-content12">
            <h3>Ganancias Netas</h3>
            <p className="dashboard_stat_amount12">{formatCurrency(stats.totalGains)}</p>
            <p className="dashboard_stat_description12">Después de descontar costos</p>
          </div>
          <div className="dashboard_stat_icon12 dashboard_profit-icon12">📈</div>
        </div>

        <div className="dashboard_stat_card12 dashboard_stat_card-412" onClick={() => navigateToOrders("all")}>
          <div className="dashboard_stat_card-content12">
            <h3>Órdenes Totales</h3>
            <p className="dashboard_stat_amount12">{stats.totalOrders}</p>
            <div className="dashboard_stat_breakdown12">
              <span className="dashboard_completed12" onClick={(e) => { e.stopPropagation(); navigateToOrders("finalizado"); }}>
                Finalizadas: {stats.completedOrders}
              </span>
              <span className="dashboard_pending12" onClick={(e) => { e.stopPropagation(); navigateToOrders("pendiente"); }}>
                Pendientes: {stats.pendingOrders}
              </span>
              <span className="dashboard_in-progress12" onClick={(e) => { e.stopPropagation(); navigateToOrders("en preparacion"); }}>
                En preparación: {stats.inProgressOrders}
              </span>
              <span className="dashboard_canceled12" onClick={(e) => { e.stopPropagation(); navigateToOrders("cancelado"); }}>
                Canceladas: {stats.canceledOrders}
              </span>
            </div>
          </div>
          <div className="dashboard_stat_icon12 dashboard_orders-icon12">📋</div>
        </div>
      </div>

      <div className="top-products-section12">
        <h2>Productos Más Vendidos</h2>
        <div className="top-products-container12">
          <div className="pie-chart-container12">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} unidades`, "Vendidos"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="products-list-container12">
            <div className="products-list12">
              {topProducts.map((product, index) => (
                <div key={index} className="product-item12">
                  <div className="product-color12" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <div className="product-name12">{product.name}</div>
                  <div className="product-percentage12">{product.porcentaje}%</div>
                  <div className="product-value12">{product.value} unidades</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-charts12">
        <div className="chart-container12 payment-method-chart12">
          <h2>Cantidad por Método de Pago</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={paymentMethods}
              margin={{
                top: 5,
                right: 40,
                left: 2,
                bottom: 32,
              }}
              barSize={60}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="method" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}`, "Cantidad"]} />
              <Legend />
              <Bar dataKey="count" fill="#AB0831" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container12 sales-by-category12">
          <h2>Cantidad por Categoría</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={categoryData}
              margin={{
                top: 5,
                right: 40,
                left: 2,
                bottom: 32,
              }}
              barSize={60}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}`, "Cantidad"]} />
              <Legend />
              <Bar dataKey="ventas" name="Ventas" fill="#AB0831" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-actions12">
        <button className="export-button12">
          Exportar Informe
        </button>
        <button className="refresh-button12" onClick={() => fetchDashboardData()}>
          Actualizar Datos
        </button>
      </div>
    </div>
  );
};

export default Dashboard;