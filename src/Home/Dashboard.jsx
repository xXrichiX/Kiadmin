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
import Cookies from "js-cookie";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [salesData, setSalesData] = useState({
    day: { total: 0, data: [] },
    week: { total: 0, data: [] },
    month: { total: 0, data: [] }
  });
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalOrders: 0,
    productionCost: 0,
    netProfit: 0,
    compareLastPeriod: 0
  });

  // Colores para gráficas
  const COLORS = ["#AB0831", "#E74C3C", "#FF8C00", "#FFD700", "#2ECC71", "#3498DB", "#9B59B6"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("authToken");
        if (!token) {
          throw new Error("No autenticado");
        }

        // En un caso real, aquí harías fetch de los datos desde tu API
        // Por ahora usaremos datos de muestra
        await simulateApiCall();
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  // Función para simular la llamada a API y generar datos de muestra
  const simulateApiCall = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Datos de ventas por día
        const dailyData = [
          { name: "9AM", ventas: 450 },
          { name: "10AM", ventas: 780 },
          { name: "11AM", ventas: 1200 },
          { name: "12PM", ventas: 1650 },
          { name: "1PM", ventas: 1250 },
          { name: "2PM", ventas: 1100 },
          { name: "3PM", ventas: 850 },
          { name: "4PM", ventas: 950 },
        ];

        // Datos de ventas por semana
        const weeklyData = [
          { name: "Lun", ventas: 4500 },
          { name: "Mar", ventas: 5200 },
          { name: "Mié", ventas: 4800 },
          { name: "Jue", ventas: 6100 },
          { name: "Vie", ventas: 7800 },
          { name: "Sáb", ventas: 8500 },
          { name: "Dom", ventas: 7200 },
        ];

        // Datos de ventas por mes
        const monthlyData = [
          { name: "Semana 1", ventas: 28000 },
          { name: "Semana 2", ventas: 35000 },
          { name: "Semana 3", ventas: 32000 },
          { name: "Semana 4", ventas: 38000 },
        ];

        // Productos más vendidos
        const topProductsData = [
          { name: "Hamburguesa Clásica", value: 120, porcentaje: 25 },
          { name: "Papas Fritas", value: 80, porcentaje: 17 },
          { name: "Refresco", value: 75, porcentaje: 16 },
          { name: "Pizza Margarita", value: 65, porcentaje: 14 },
          { name: "Ensalada César", value: 45, porcentaje: 9 },
          { name: "Helado", value: 40, porcentaje: 8 },
          { name: "Otros", value: 55, porcentaje: 11 },
        ];

        // Calcular valores para los stats modificados
        const totalSales = {
          day: 8230,
          week: 44100,
          month: 133000
        };
        
        const productionCost = {
          day: 4115,
          week: 22050,
          month: 66500
        };
        
        const netProfit = {
          day: totalSales.day - productionCost.day,
          week: totalSales.week - productionCost.week,
          month: totalSales.month - productionCost.month
        };

        setSalesData({
          day: { total: totalSales.day, cost: productionCost.day, profit: netProfit.day, data: dailyData },
          week: { total: totalSales.week, cost: productionCost.week, profit: netProfit.week, data: weeklyData },
          month: { total: totalSales.month, cost: productionCost.month, profit: netProfit.month, data: monthlyData }
        });

        setTopProducts(topProductsData);

        setStats({
          totalOrders: 528,
          productionCost: productionCost[selectedPeriod],
          netProfit: netProfit[selectedPeriod],
          compareLastPeriod: 12.5
        });

        resolve();
      }, 800);
    });
  };

  const renderActiveData = () => {
    return salesData[selectedPeriod].data;
  };

  if (loading) return <div className="dashboard-loading">Cargando estadísticas...</div>;
  if (error) return <div className="dashboard-error">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard de Ventas</h1>
        <div className="period-selector">
          <button
            className={selectedPeriod === "day" ? "active" : ""}
            onClick={() => setSelectedPeriod("day")}
          >
            Día
          </button>
          <button
            className={selectedPeriod === "week" ? "active" : ""}
            onClick={() => setSelectedPeriod("week")}
          >
            Semana
          </button>
          <button
            className={selectedPeriod === "month" ? "active" : ""}
            onClick={() => setSelectedPeriod("month")}
          >
            Mes
          </button>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-card-content">
            <h3>Ganancias Totales</h3>
            <p className="stat-amount">${salesData[selectedPeriod].total.toLocaleString()}</p>
            <p className="stat-comparison">
              <span className={stats.compareLastPeriod >= 0 ? "positive" : "negative"}>
                {stats.compareLastPeriod >= 0 ? "+" : ""}{stats.compareLastPeriod}%
              </span> vs periodo anterior
            </p>
          </div>
          <div className="stat-icon income-icon">💰</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <h3>Costo de Producción</h3>
            <p className="stat-amount">${salesData[selectedPeriod].cost.toLocaleString()}</p>
            <p className="stat-comparison">
              <span className="negative">+5.2%</span> vs periodo anterior
            </p>
          </div>
          <div className="stat-icon cost-icon">💸</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <h3>Ganancias Netas</h3>
            <p className="stat-amount">${salesData[selectedPeriod].profit.toLocaleString()}</p>
            <p className="stat-comparison">
              <span className="positive">+7.3%</span> vs periodo anterior
            </p>
          </div>
          <div className="stat-icon profit-icon">📈</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <h3>Órdenes Totales</h3>
            <p className="stat-amount">{stats.totalOrders}</p>
            <p className="stat-comparison">
              <span className="positive">+8.2%</span> vs periodo anterior
            </p>
          </div>
          <div className="stat-icon orders-icon">📋</div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container sales-chart">
          <h2>Ventas por {selectedPeriod === "day" ? "Hora" : selectedPeriod === "week" ? "Día" : "Semana"}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={renderActiveData()}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Ventas"]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#AB0831"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container top-products-chart">
          <h2>Productos Más Vendidos</h2>
          <div className="top-products-container">
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={topProducts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
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
            <div className="products-list">
              {topProducts.map((product, index) => (
                <div key={index} className="product-item">
                  <div className="product-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <div className="product-name">{product.name}</div>
                  <div className="product-percentage">{product.porcentaje}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container sales-by-category">
          <h2>Ventas por Categoría</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: "Comida", ventas: 16500 },
                { name: "Bebidas", ventas: 8700 },
                { name: "Postres", ventas: 4800 },
                { name: "Combos", ventas: 12300 },
                { name: "Extras", ventas: 1800 },
              ]}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Ventas"]} />
              <Legend />
              <Bar dataKey="ventas" fill="#AB0831" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container hourly-sales">
          <h2>Tráfico por Hora</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { hora: "9-10", clientes: 24 },
                { hora: "10-11", clientes: 43 },
                { hora: "11-12", clientes: 58 },
                { hora: "12-13", clientes: 75 },
                { hora: "13-14", clientes: 62 },
                { hora: "14-15", clientes: 48 },
                { hora: "15-16", clientes: 39 },
                { hora: "16-17", clientes: 45 },
                { hora: "17-18", clientes: 52 },
                { hora: "18-19", clientes: 68 },
                { hora: "19-20", clientes: 55 },
                { hora: "20-21", clientes: 41 },
              ]}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hora" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}`, "Clientes"]} />
              <Bar dataKey="clientes" fill="#3498DB" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;