import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Asegúrate que exista este archivo CSS
import eyeIcon from "../assets/ojo.png"; // Asegúrate que existan estas imágenes
import invisibleIcon from "../assets/invisible.png";

function Login() {
  // Estados
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const API_URL = import.meta.env.VITE_API_URL;

    try {
      // Enviar solicitud de inicio de sesión
      const response = await fetch(`${API_URL}/api/admins/login/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error de autenticación");
      }

      // Guardar token en cookies
      Cookies.remove("authToken");
      Cookies.set("authToken", data.token, {
        expires: 1, // 1 día
        secure: window.location.protocol === "https:",
        sameSite: "lax", // Cambiado a lax para mayor compatibilidad
        path: "/",
      });

      // También guardamos en localStorage para compatibilidad con código existente
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Usar setTimeout para retrasar la navegación al siguiente ciclo de eventos
      setTimeout(() => {
        navigate("/home", { replace: true });
      }, 10);
      
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
      setLoading(false);
    }
  };

  // Manejadores de redirección
  const handleForgotPasswordRedirect = (e) => {
    e.preventDefault();
    setTimeout(() => {
      navigate("/forgot-password");
    }, 10);
  };

  const handleRegisterRedirect = (e) => {
    e.preventDefault();
    setTimeout(() => {
      navigate("/register");
    }, 10);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Imagen de fondo */}
        <div className="login-image">
          <img
            src="https://res.cloudinary.com/dej4kxb37/image/upload/v1741658856/s4earu86aump4eooafk1.jpg"
            alt="Restaurante"
            className="background-image"
          />
        </div>

        {/* Formulario */}
        <div className="login-form">
          <div className="form-content">
            <h1 className="form-title">Iniciar Sesión</h1>
            <p className="form-welcome">Bienvenido a Kibbi</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="email"
                  className="form-input"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <img
                    src={showPassword ? eyeIcon : invisibleIcon}
                    alt="Toggle Password"
                    className="password-icon"
                  />
                </span>
              </div>

              {error && <p className="error-message">{error}</p>}

              <div className="forgot-password">
                <a href="#" onClick={handleForgotPasswordRedirect}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <div className="button-container">
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? "Cargando..." : "Ingresar"}
                </button>
              </div>
            </form>

            <div className="register-link">
              <p>¿No tienes cuenta?</p>
              <a href="#" onClick={handleRegisterRedirect}>
                Regístrate
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;