import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import ResetPassword from "./pages/ResetPassword";
import HomePage from "./pages/HomePage"; // Importar HomePage
import CategoriesPage from "./pages/CategoriesPage"; // 👈 Añadir importación
import KiosksPage from "./pages/KiosksPage"; // �� Nueva importación
import ProductsPage from "./pages/ProductsPage"; // 👈 Nueva importación
import RestaurantPage from "./pages/RestaurantPage";

function App() {
  return (
    <div className="App">
      <h1>Bienvenido a Kibbi (imagen)</h1>

      {/* Configuración de rutas */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<HomePage />} /> {/* Ruta de HomePage */}
        <Route path="/categories" element={<CategoriesPage />} /> {/* 👈 Nueva ruta */}
        <Route path="/kiosks" element={<KiosksPage />} /> {/* 👈 Nueva ruta */}
        <Route path="/products" element={<ProductsPage />} /> {/* 👈 Nueva ruta */}
        <Route path="/restaurant" element={<RestaurantPage />} />
      </Routes>

      {/* Navegación */}
      <nav className="main-navigation">
        <Link to="/login">Login</Link> | <Link to="/register">Registro</Link> | 
        <Link to="/forgot-password">Recuperar Contraseña</Link> | 
        <Link to="/verify-code">Verificar Código</Link> | 
        <Link to="/reset-password">Restablecer Contraseña</Link> | 
        <Link to="/home">Home</Link> {/* Enlace para ir a la página de inicio */}
        <Link to="/categories">Categorías</Link> {/* 👈 Nuevo enlace */}
        <Link to="/kiosks">Kioskos</Link> {/* 👈 Nuevo enlace */}
        <Link to="/products">Productos</Link> {/* 👈 Nuevo enlace */}
      </nav>
    </div>
  );
}

export default App;
