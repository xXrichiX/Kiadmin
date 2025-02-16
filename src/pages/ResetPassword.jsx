import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ResetPassword.css";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación básica para asegurar que las contraseñas coinciden
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden. Intenta de nuevo.");
      return;
    }

    // Aquí puedes agregar la lógica para actualizar la contraseña en la base de datos

    // Si todo está bien, redirigimos al usuario a la página de inicio de sesión (o la página deseada)
    navigate("/login");
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <h2>Restablecer Contraseña</h2>
        <p>Ingresa tu nueva contraseña.</p>
        <form className="reset-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">Nueva Contraseña</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={handleNewPasswordChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit">Restablecer Contraseña</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
