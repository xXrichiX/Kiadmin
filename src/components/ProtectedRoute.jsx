import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  let authToken = Cookies.get('authToken');

  useEffect(() => {
    if (!authToken) {
      navigate('/login');
    } else {
      // Renovar el tiempo del token cada vez que el usuario entra
      Cookies.set('authToken', authToken, { expires: 7 }); // Expira en 7 días
    }
  }, [authToken, navigate]);

  if (!authToken) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
