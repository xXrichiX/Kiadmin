import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Usamos useNavigate para redirigir
import Cookies from "js-cookie";
import "../styles/Login.css"; // Importa el CSS

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Función para manejar el submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://orderandout.onrender.com/api/intern/admins/login/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error de autenticación");
      }

      // Limpiar tempId y guardar nuevo token
      Cookies.remove("tempId"); // 👈 Limpiar tempId anterior
      Cookies.set("authToken", data.token, { 
        expires: 1,
        secure: true,
        sameSite: 'strict'
      });
      
      navigate("/home"); // 👈 Redirigir a homePage

    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    }
  };

  const handleForgotPasswordRedirect = () => {
    navigate("/forgot-password");
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Iniciar Sesión</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="auth-links">
            <a 
              href="#" 
              onClick={handleForgotPasswordRedirect} 
              className="forgot-password-link"
            >
              ¿Olvidaste tu contraseña?
            </a>
            <a 
              href="#" 
              onClick={handleRegisterRedirect} 
              className="register-link"
            >
              Registrarte
            </a>
          </div>
          <button type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
