import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Importa el archivo CSS
import eyeIcon from "../assets/ojo.png"; // Importa el ícono de ojo (mostrar contraseña)
import invisibleIcon from "../assets/invisible.png"; // Importa el ícono de ojo tachado (ocultar contraseña)

function Login() {
  /////////////////// ESTADOS ///////////////////
  const [email, setEmail] = useState(""); // Estado para almacenar el correo electrónico
  const [password, setPassword] = useState(""); // Estado para almacenar la contraseña
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar la contraseña
  const [error, setError] = useState(""); // Estado para manejar errores
  const navigate = useNavigate(); // Hook para navegar entre rutas

  /////////////////// MANEJAR ENVÍO DEL FORMULARIO ///////////////////
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    const API_URL = import.meta.env.VITE_API_URL; // Obtener la URL de la API desde las variables de entorno

    try {
      // Enviar la solicitud de inicio de sesión
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

      const data = await response.json(); // Convertir la respuesta a JSON

      // Si la respuesta no es exitosa, lanzar un error
      if (!response.ok) {
        throw new Error(data.message || "Error de autenticación");
      }

      // Eliminar cookies antiguas (si existen)
      Cookies.remove("authToken");
      Cookies.remove("tempId");

      // Establecer la cookie con el token de autenticación
      Cookies.set("authToken", data.token, {
        expires: 1, // Expira en 1 día
        secure: true, // Solo se envía en conexiones HTTPS
        sameSite: "strict", // Prevenir ataques CSRF
        path: "/", // Disponible en toda la aplicación
      });

      // Guardar los datos del usuario en el localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/home"); // Redirigir a la página de inicio
    } catch (err) {
      setError(err.message || "Error al iniciar sesión"); // Manejar errores
    }
  };

  /////////////////// MANEJAR REDIRECCIÓN A RECUPERACIÓN DE CONTRASEÑA ///////////////////
  const handleForgotPasswordRedirect = () => {
    navigate("/forgot-password"); // Redirigir a la página de recuperación de contraseña
  };

  /////////////////// MANEJAR REDIRECCIÓN A REGISTRO ///////////////////
  const handleRegisterRedirect = () => {
    navigate("/register"); // Redirigir a la página de registro
  };

  /////////////////// RENDERIZADO ///////////////////
  return (
    <div className="login-page">
      <div className="login-container">
        {/* Imagen de fondo */}
        <div className="login-image">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1934&q=80"
            alt="Restaurante"
            className="background-image"
          />
        </div>

        {/* Formulario de inicio de sesión */}
        <div className="login-form">
          <div className="form-content">
            <h1 className="form-title">Iniciar Sesión</h1>
            <p className="form-welcome">Bienvenido a Kibbi</p>

            {/* Formulario */}
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="email"
                  className="form-input"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Actualizar el estado del correo electrónico
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"} // Mostrar u ocultar la contraseña
                  className="form-input"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // Actualizar el estado de la contraseña
                  required
                />
                {/* Botón para mostrar/ocultar la contraseña */}
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)} // Alternar entre mostrar y ocultar la contraseña
                >
                  <img
                    src={showPassword ? eyeIcon : invisibleIcon} // Cambiar el ícono según el estado
                    alt="Toggle Password"
                    className="password-icon"
                  />
                </span>
              </div>

              {/* Mostrar mensajes de error */}
              {error && <p className="error-message">{error}</p>}

              {/* Enlace para recuperar contraseña */}
              <div className="forgot-password">
                <a href="#" onClick={handleForgotPasswordRedirect}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div> 

              {/* Botón para enviar el formulario */}
              <div className="button-container">
                <button type="submit" className="submit-button">
                  Ingresar
                </button>
              </div>
            </form>

            {/* Enlace para registrarse */}
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