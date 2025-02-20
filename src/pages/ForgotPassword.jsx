import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // 👈 Agregamos useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simulación de envío del formulario
      const response = await fetch("https://orderandout.onrender.com/api/intern/admins/forgot-password", {
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

      // Guardamos un identificador temporal en cookies
      document.cookie = `tempId=${data.tempId}; path=/`;

      // Mensaje de confirmación y redirección
      setMessage("Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.");
      setTimeout(() => navigate("/verify-code"), 3000); // 👈 Redirige después de 3 segundos

    } catch (err) {
      setMessage(err.message || "Error al enviar el correo");
    }
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
