import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({ children }) => {
  const authToken = Cookies.get("authToken");

  // Si no hay token, redirige inmediatamente al login
  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  // Solo actualiza el token si es necesario (evita sobreescribir en cada render)
  if (!Cookies.get("authTokenUpdated")) {
    Cookies.set("authToken", authToken, {
      expires: 7, // Mantiene la sesión por 7 días
      secure: window.location.protocol === "https:",
      sameSite: "lax",
      path: "/"
    });
    Cookies.set("authTokenUpdated", "true", { path: "/" }); // Evita que se sobreescriba en cada render
  }

  // Retorna los componentes protegidos
  return children;
};

export default ProtectedRoute;