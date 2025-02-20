import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./components/VerifyCode";
import ResetPassword from "./pages/ResetPassword";
import HomePage from "./pages/HomePage";
import CategoriesPage from "./Home/CategoriesPage";
import KiosksPage from "./Home/KioskPage";
import ProductsPage from "./Home/ProductsPage";
import RestaurantPage from "./Home/RestaurantPage";
import Profile from "./Home/Profile";
import OrdersPage from "./Home/OrdersPage"; 

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
        <Route path="/home" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/kiosks" element={<KiosksPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/restaurant" element={<RestaurantPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<OrdersPage />} /> 
      </Routes>

      {/* Navegación */}
      <nav className="main-navigation">
        <Link to="/login">Login</Link> | <Link to="/register">Registro</Link> | 
        <Link to="/forgot-password">Recuperar Contraseña</Link> | 
        <Link to="/verify-code">Verificar Código</Link> | 
        <Link to="/reset-password">Restablecer Contraseña</Link> | 
        <Link to="/home">Home</Link> |
        <Link to="/categories">Categorías</Link> |
        <Link to="/kiosks">Kioskos</Link> |
        <Link to="/products">Productos</Link> |
        <Link to="/restaurant">Restaurante</Link> |
        <Link to="/profile">Perfil</Link> |
        <Link to="/orders">Órdenes</Link> 
      </nav>
    </div>
  );
}

export default App;
