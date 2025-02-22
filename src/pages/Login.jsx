import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Importa el CSS
import "../assets/cafecito.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

      Cookies.remove("tempId");
      Cookies.set("authToken", data.token, { expires: 1, secure: true, sameSite: "strict" });

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
    <div className="l-form">
      <div className="form-container">
        <div className="image-container">
          {/* Aquí va la imagen de fondo, usa una imagen  que sea representativa de un restaurante o café */}
          <img src="/assets/cafecito.jpg" alt="Comida" className="background-image" />
          </div>
        <div className="form">
          <div className="form__content">
            <h1 className="form__title">Iniciar Sesión</h1>
            <p className="form__welcome">Bienvenido a Kibbi</p>
            <form onSubmit={handleSubmit}>
              <div className="form__div">
                <input
                  type="email"
                  className="form__input"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form__div">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form__input"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="form__icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>

              {error && <p className="error-message">{error}</p>}

              <div className="form__forgot">
                <a href="#" onClick={handleForgotPasswordRedirect}>¿Olvidaste tu contraseña?</a>
              </div>
              <div className="form__button-container">
                <button type="submit" className="form__button">Ingresar</button>
              </div>
            </form>
            <div className="form__social">
              <p>¿No tienes cuenta?</p>
              <a href="#" onClick={handleRegisterRedirect}>Regístrate</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
