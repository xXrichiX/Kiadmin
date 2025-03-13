import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/ResetPassword.css";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener el email y código de verificación de la URL o localStorage
  const [email, setEmail] = useState(() => {
    return location.state?.email || localStorage.getItem("resetEmail") || "";
  });
  
  const [code, setCode] = useState(() => {
    return location.state?.code || "";
  });
  
  useEffect(() => {
    // Verificar si tenemos el código necesario para restablecer la contraseña
    if (!code && !location.state?.code) {
      setError("Información de verificación incompleta. Por favor, solicita un nuevo código.");
    }
  }, [code, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden. Intenta de nuevo.");
      return;
    }
    
    // Validar que tengamos un código de verificación
    if (!code) {
      setError("Se requiere un código de verificación válido. Por favor, solicita un nuevo código.");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      
      // Enviar solicitud de restablecimiento de contraseña
      const response = await fetch(`${API_URL}/api/admins/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          code: code,
          newPassword: newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error al restablecer la contraseña");
      }
      
      // Mostrar mensaje de éxito
      setMessage("Contraseña restablecida exitosamente");
      
      // Redirigir al login después de un breve retraso
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Error al restablecer la contraseña");
    }
  };

  // Si no tenemos email o código, redirigir a la página de solicitud
  const handleBackToForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-image">
          <img
            src="https://res.cloudinary.com/dej4kxb37/image/upload/v1741658856/s4earu86aump4eooafk1.jpg"
            alt="Restaurante"
            className="background-image"
          />
        </div>
        <div className="reset-password-form">
          <div className="form-content">
            <h2 className="form-title">Restablecer Contraseña</h2>
            <p className="form-description">
              Ingresa tu nueva contraseña para la cuenta asociada con {email}.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="newPassword">Nueva Contraseña</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              {message && <p className="success-message">{message}</p>}
              <div className="button-container">
                <button type="submit" className="submit-button">
                  Restablecer Contraseña
                </button>
              </div>
              {(!email || !code) && (
                <div className="back-link">
                  <button
                    type="button"
                    onClick={handleBackToForgotPassword}
                    className="link-button"
                  >
                    Volver a solicitar código
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;