import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children }) => {
  const authToken = Cookies.get('authToken');

  // Si no hay token, redirige inmediatamente al login
  if (!authToken) {
    return <Navigate to="/login" replace />;
  }
  
  // Si hay token, renovamos su tiempo de expiración
  Cookies.set('authToken', authToken, { 
    expires: 7,
    secure: window.location.protocol === "https:",
    sameSite: "lax",
    path: "/"
  });
  
  // Retorna los componentes hijos (contenido protegido)
  return children;
};

export default ProtectedRoute;