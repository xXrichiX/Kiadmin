import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = process.env.REACT_APP_API_URL; 

      const response = await fetch(`${API_URL}/api/intern/admins/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error al enviar el correo");
      }

      document.cookie = `tempId=${data.tempId}; path=/`;
      setMessage("Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.");
      setTimeout(() => navigate("/verify-code"), 3000);
    } catch (err) {
      setMessage(err.message || "Error al enviar el correo");
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-image">
          {/* Imagen de fondo representativa */}
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1934&q=80"
            alt="Restaurante"
            className="background-image"
          />
        </div>
        <div className="forgot-password-form">
          <div className="form-content">
            <h2 className="form-title">Recuperar Contraseña</h2>
            <p className="form-description">
              Introduce tu correo electrónico para recibir un enlace de recuperación.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="button-container">
                <button type="submit" className="submit-button">
                  Enviar Código
                </button>
              </div>
            </form>
            {message && <p className="auth-message">{message}</p>}
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