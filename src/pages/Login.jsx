import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Importa el CSS

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://orderandout-refactor.onrender.com/api/admins/login/admin", {
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

      Cookies.remove("authToken");
      Cookies.remove("tempId");
      
      Cookies.set("authToken", data.token, { 
        expires: 1,
        secure: true, 
        sameSite: "strict",
        path: "/"
      });

      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/home");
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
    <div className="login-page">
      <div className="login-container">
        <div className="login-image">
          {/* Imagen de fondo representativa de un restaurante o café */}
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1934&q=80"
            alt="Restaurante"
            className="background-image"
          />
        </div>
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
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>

              {error && <p className="error-message">{error}</p>}


              <div className="forgot-password">
                <a href="#" onClick={handleForgotPasswordRedirect}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="button-container">
                <button type="submit" className="submit-button">
                  Ingresar
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