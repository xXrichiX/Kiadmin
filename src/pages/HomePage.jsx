// src/pages/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";  // Importa el archivo CSS

const HomePage = () => {
  const navigate = useNavigate();

  // Función para cerrar sesión
  const handleLogout = () => {
    // Aquí se puede agregar lógica para cerrar sesión, como eliminar datos del localStorage o contexto
    navigate("/login");  // Redirige al login después de cerrar sesión
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <h1>Bienvenido a la Página de Inicio</h1>
        <p>¡Has iniciado sesión correctamente!</p>

        <button className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default HomePage;
