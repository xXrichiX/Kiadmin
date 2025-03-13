import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./components/VerifyCode";
import ResetPassword from "./pages/ResetPassword";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import CategoriesPage from "./Home/CategoriesPage";
import KiosksPage from "./Home/KioskPage";
import ProductsPage from "./Home/ProductsPage";
import RestaurantPage from "./Home/RestaurantPage";
import Profile from "./Home/Profile";
import OrdersPage from "./Home/OrdersPage";
import Dashboard from "./Home/Dashboard";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Ruta por defecto - redirige a login en la primera ejecución */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Rutas protegidas */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/categories" 
          element={
            <ProtectedRoute>
              <CategoriesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/kiosks" 
          element={
            <ProtectedRoute>
              <KiosksPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/products" 
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/restaurant" 
          element={
            <ProtectedRoute>
              <RestaurantPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
