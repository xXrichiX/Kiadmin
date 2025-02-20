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


const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(true); // Mantiene el menú abierto por defecto
  const [activeSection, setActiveSection] = useState("home"); // Sección activa

  useEffect(() => {
    const checkRestaurant = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("https://orderandout.onrender.com/api/intern/restaurants/mine", {
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
    navigate("/login");
  };

  // Función para ir al perfil del usuario
  const handleProfile = () => {
    navigate("/perfil");
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
          <li onClick={() => changeSection("dashboard")}>Dashboard</li>
          <li onClick={() => changeSection("categories")}>Categorías</li>
          <li onClick={() => changeSection("kiosks")}>Kioskos</li>
          <li onClick={() => changeSection("products")}>Productos</li>
          <li onClick={() => changeSection("restaurant")}>Restaurante</li>
          <li onClick={() => changeSection("orders")}>Órdenes</li>
        </ul>
      </div>

      {/* Menú Horizontal */}
      <div className="top-menu">
        <button className="menu-toggle-button" onClick={toggleMenu}>
          {isMenuOpen ? "Cerrar Menú" : "Abrir Menú"}
        </button>

        <button className="profile-button" onClick={() => setActiveSection("profile")}>
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
          {activeSection === "home" && <h2>Bienvenido al Home 🏠</h2>}
          {activeSection === "dashboard" && <h2>Dashboard</h2>}
          {activeSection === "categories" && <CategoriesPage />}
          {activeSection === "kiosks" && <KiosksPage />}
          {activeSection === "products" && <ProductsPage />}
          {activeSection === "restaurant" && <RestaurantManagement />} 
          {activeSection === "orders" && <OrdersPage />}
          {activeSection === "profile" && <Profile />} {/* 👈 Aquí agregamos Profile */}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
