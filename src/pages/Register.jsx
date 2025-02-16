import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Usamos useNavigate para redirigir
import "../styles/Register.css"; // Importa el CSS

function Register() {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Nuevo estado para la confirmación de contraseña
  const [error, setError] = useState(""); // Estado para manejar el error de contraseñas no coincidentes
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validación para asegurar que las contraseñas coinciden
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // Aquí se puede agregar la lógica para registrar al usuario
    console.log("Usuario registrado", { name, lastName, phone, birthDate, email, password });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Registro</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <div className="input-group">
            <span>📞</span>
            <input
              type="number"
              placeholder="Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <p className="error-message">{error}</p>} {/* Mensaje de error si las contraseñas no coinciden */}
          <button type="submit">Registrarse</button>
        </form>
        <div className="auth-links">
          <a href="#" onClick={handleLoginRedirect} className="login-link">
            ¿Ya tienes cuenta?
          </a>
        </div>
      </div>
    </div>
  );
}

export default Register;
