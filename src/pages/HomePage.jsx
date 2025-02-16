import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";  // Importa el archivo CSS

const HomePage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(true);  // Mantiene el menú abierto por defecto

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
    navigate("/perfil");  // Ruta para el perfil del usuario
  };

  return (
    <div className="home-page">
      {/* Menú Vertical */}
      <div className={`slider-menu ${isMenuOpen ? "open" : ""}`}>
        <ul>
          <li onClick={() => navigate("/ventas")}>Dashboard</li>
          <li onClick={() => navigate("/productos")}>Kioskos</li>
          <li onClick={() => navigate("/reportes")}>Categorías</li>
          <li onClick={() => navigate("/categorias")}>productos</li>
          <li onClick={() => navigate("/proveedores")}>órdenes</li>
        </ul>
      </div>

      {/* Menú Horizontal */}
      <div className="top-menu">
        {/* Botón de abrir/cerrar menú */}
        <button className="menu-toggle-button" onClick={toggleMenu}>
          {isMenuOpen ? "Cerrar Menú" : "Abrir Menú"}
        </button>

        {/* Botón de perfil del usuario */}
        <button className="profile-button" onClick={handleProfile}>
          Perfil
        </button>
        
        {/* Botón de cerrar sesión */}
        <button className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      {/* Contenido Principal */}
      <div className={`content-area ${isMenuOpen ? "menu-open" : ""}`}>
        <div className="content">
          {/* Aquí se puede agregar cualquier otro contenido necesario */}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
