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
  /////////////////// ESTADOS ///////////////////
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const [error, setError] = useState(""); // Estado para manejar errores
  const navigate = useNavigate(); // Hook para navegar entre rutas
  const [isMenuOpen, setIsMenuOpen] = useState(true); // Estado para controlar si el menú está abierto o cerrado
  const [activeSection, setActiveSection] = useState("dashboard"); // Estado para la sección activa (por defecto: "dashboard")

  /////////////////// EFECTO PARA VERIFICAR EL RESTAURANTE ///////////////////
  useEffect(() => {
    const checkRestaurant = async () => {
      try {
        const token = Cookies.get("authToken"); // Obtener el token de autenticación
        if (!token) {
          navigate("/login"); // Redirigir al login si no hay token
          return;
        }

        const API_URL = import.meta.env.VITE_API_URL; // Obtener la URL de la API desde las variables de entorno
        const response = await fetch(`${API_URL}/api/restaurants/myRestaurant`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        // Si el token no es válido, redirigir al login
        if (response.status === 403) {
          Cookies.remove("authToken");
          navigate("/login");
          return;
        }

        // Si la respuesta no es exitosa, lanzar un error
        if (!response.ok) {
          throw new Error(data.message || "Error al verificar restaurante");
        }
      } catch (err) {
        setError(err.message); // Manejar errores
      } finally {
        setLoading(false); // Finalizar la carga
      }
    };

    checkRestaurant(); // Llamar a la función para verificar el restaurante
  }, [navigate]);

  /////////////////// FUNCIÓN PARA ALTERNAR EL MENÚ ///////////////////
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Cambiar el estado del menú (abrir/cerrar)
  };

  /////////////////// FUNCIÓN PARA CERRAR SESIÓN ///////////////////
  const handleLogout = () => {
    Cookies.remove("authToken"); // Eliminar el token de autenticación
    navigate("/login"); // Redirigir al login
  };

  /////////////////// FUNCIÓN PARA CAMBIAR LA SECCIÓN ACTIVA ///////////////////
  const changeSection = (section) => {
    setActiveSection(section); // Cambiar la sección activa
  };

  /////////////////// RENDERIZADO ///////////////////
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="home-page">
      {/* Menú Vertical */}
      <div className={`slider-menu ${isMenuOpen ? "open" : ""}`}>
        <ul>
          <li
            className={activeSection === "dashboard" ? "active" : ""}
            onClick={() => changeSection("dashboard")}
          >
            Estadisticas
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