import React, { useState } from "react";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulación de envío del formulario
    setMessage("Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Recuperar Contraseña</h2>
        <p>Introduce tu correo electrónico para recibir un enlace de recuperación.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Enviar Código</button>
        </form>
        {message && <p className="auth-message">{message}</p>}
        <div className="back-to-login">
          <a href="/login">Volver al inicio de sesión</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
