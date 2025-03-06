import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css"; // Importa el archivo CSS
import RestaurantManagement from "../Home/RestaurantPage"; // Asegúrate de la ruta correcta
import CategoriesPage from "../Home/CategoriesPage";
import ProductsPage from "../Home/ProductsPage";
import KiosksPage from "../Home/KioskPage";
import Profile from "../Home/Profile";
import OrdersPage from "../Home/OrdersPage";
import Dashboard from "../Home/Dashboard";

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(true); // Mantiene el menú abierto por defecto
  const [activeSection, setActiveSection] = useState("dashboard"); // Sección activa por defecto cambiada a "dashboard"

  useEffect(() => {
    const checkRestaurant = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const API_URL = process.env.REACT_APP_API_URL; 
        const response = await fetch(`${API_URL}/api/restaurants/myRestaurant`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await response.json();

        if (response.status === 403) {
          Cookies.remove("authToken");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Error al verificar restaurante");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkRestaurant();
  }, [navigate]);

  // Función para alternar el menú
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    Cookies.remove("authToken");
    navigate("/login");
  };

  // Función para cambiar la sección activa
  const changeSection = (section) => {
    setActiveSection(section);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="home-page">
      {/* Menú Vertical */}
      <div className={`slider-menu ${isMenuOpen ? "open" : ""}`}>
        <ul>
          <li
            className={activeSection === "dashboard" ? "active" : ""}
            onClick={() => changeSection("dashboard")}
          >
            Dashboard
          </li>
          <li
            className={activeSection === "restaurant" ? "active" : ""}
            onClick={() => changeSection("restaurant")}
          >
            Restaurante
          </li>
          <li
            className={activeSection === "kiosks" ? "active" : ""}
            onClick={() => changeSection("kiosks")}
          >
            Kioskos
          </li>
          <li
            className={activeSection === "categories" ? "active" : ""}
            onClick={() => changeSection("categories")}
          >
            Categorías
          </li>
          <li
            className={activeSection === "products" ? "active" : ""}
            onClick={() => changeSection("products")}
          >
            Productos
          </li>
          <li
            className={activeSection === "orders" ? "active" : ""}
            onClick={() => changeSection("orders")}
          >
            Órdenes
          </li>
        </ul>
      </div>

      {/* Menú Horizontal */}
      <div className="top-menu">
        <button className="menu-toggle-button" onClick={toggleMenu}>
          {isMenuOpen ? "Cerrar Menú" : "Abrir Menú"}
        </button>
        <button
          className={`profile-button ${activeSection === "profile" ? "active" : ""}`}
          onClick={() => changeSection("profile")}
        >
          Perfil
        </button>
        <button className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      {/* Contenido Principal */}
      <div className={`content-area ${isMenuOpen ? "menu-open" : ""}`}>
        <div className="content">
          {/* Mostrar el contenido de acuerdo a la sección seleccionada */}
          {activeSection === "dashboard" && <Dashboard />}
          {activeSection === "categories" && <CategoriesPage />}
          {activeSection === "kiosks" && <KiosksPage />}
          {activeSection === "products" && <ProductsPage />}
          {activeSection === "restaurant" && <RestaurantManagement />}
          {activeSection === "orders" && <OrdersPage />}
          {activeSection === "profile" && <Profile />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
