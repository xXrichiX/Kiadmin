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
 // En Login.js
// Modifica tus funciones de redirección
const handleForgotPasswordRedirect = (e) => {
  e.preventDefault();
  // Intenta usar navigate sin el replace: true
  navigate("/forgot-password");
};

const handleRegisterRedirect = (e) => {
  e.preventDefault();
  // Intenta usar navigate sin el replace: true
  navigate("/register");
};

  return (
    <div className="login-page47">
      <div className="login-container47">
        {/* Imagen de fondo */}
        <div className="login-image47">
          <img
            src="https://res.cloudinary.com/dej4kxb37/image/upload/v1741658856/s4earu86aump4eooafk1.jpg"
            alt="Restaurante"
            className="background-image47"
          />
        </div>

        {/* Formulario */}
        <div className="login-form47">
          <div className="form-content47">
            <h1 className="form-title47">Iniciar Sesión</h1>
            <p className="form-welcome47">Bienvenido a Kibbi</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group47">
                <input
                  type="email"
                  className="form-input47"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="input-group47">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input47"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <span
                  className="password-toggle47"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <img
                    src={showPassword ? eyeIcon : invisibleIcon}
                    alt="Toggle Password"
                    className="password-icon47"
                  />
                </span>
              </div>

              {error && <p className="error-message47">{error}</p>}

              <div className="forgot-password47">
                <a href="#" onClick={handleForgotPasswordRedirect}>
                  ¿Olvidaste tu contraseña we?
                </a>
              </div>

              <div className="button-container47">
                <button type="submit" className="submit-button47" disabled={loading}>
                  {loading ? "Cargando..." : "Ingresar"}
                </button>
              </div>
            </form>

            <div className="register-link47">
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