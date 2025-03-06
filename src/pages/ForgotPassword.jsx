import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  /////////////////// ESTADOS ///////////////////
  const [email, setEmail] = useState(""); // Estado para almacenar el correo electrónico
  const [message, setMessage] = useState(""); // Estado para mostrar mensajes al usuario
  const navigate = useNavigate(); // Hook para navegar entre rutas

  /////////////////// MANEJAR ENVÍO DEL FORMULARIO ///////////////////
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    try {
      const API_URL = import.meta.env.VITE_API_URL; // Obtener la URL de la API desde las variables de entorno

      // Enviar la solicitud para recuperar la contraseña
      const response = await fetch(`${API_URL}/api/intern/admins/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }), // Enviar el correo electrónico en el cuerpo de la solicitud
      });

      const data = await response.json(); // Convertir la respuesta a JSON

      // Verificar si la respuesta no es exitosa
      if (!response.ok) {
        throw new Error(data.message || "Error al enviar el correo de recuperación.");
      }

      // Establecer una cookie con el ID temporal
      document.cookie = `tempId=${data.tempId}; path=/; secure=true; SameSite=Strict`;

      // Mostrar un mensaje de confirmación al usuario
      setMessage("Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.");

      // Redirigir a la página de verificación de código después de 3 segundos
      setTimeout(() => navigate("/verify-code"), 3000);
    } catch (err) {
      // Manejar errores y mostrar un mensaje al usuario
      setMessage(err.message || "Hubo un error al procesar tu solicitud.");
    }
  };

  /////////////////// RENDERIZADO ///////////////////
  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        {/* Imagen de fondo */}
        <div className="forgot-password-image">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1934&q=80"
            alt="Restaurante"
            className="background-image"
          />
        </div>

        {/* Formulario de recuperación de contraseña */}
        <div className="forgot-password-form">
          <div className="form-content">
            <h2 className="form-title">Recuperar Contraseña</h2>
            <p className="form-description">
              Introduce tu correo electrónico para recibir un enlace de recuperación.
            </p>

            {/* Formulario */}
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Actualizar el estado del correo electrónico
                  required
                />
              </div>
              <div className="button-container">
                <button type="submit" className="submit-button">
                  Enviar Código
                </button>
              </div>
            </form>

            {/* Mostrar mensajes al usuario */}
            {message && <p className="auth-message">{message}</p>}

            {/* Enlace para volver al inicio de sesión */}
            <div className="back-to-login">
              <a href="/login" className="login-link">
                Volver al inicio de sesión
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;