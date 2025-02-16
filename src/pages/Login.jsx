import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Usamos useNavigate para redirigir
import "../styles/Login.css"; // Importa el CSS

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Función para manejar el submit del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    // Aquí se puede agregar la lógica para validar las credenciales
    if (email === "test@example.com" && password === "password123") {
      // Redirigir a la página principal si las credenciales son correctas
      navigate("/home");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  const handleForgotPasswordRedirect = () => {
    navigate("/forgot-password");
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Iniciar Sesión</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
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
          <div className="auth-links">
            <a 
              href="#" 
              onClick={handleForgotPasswordRedirect} 
              className="forgot-password-link"
            >
              ¿Olvidaste tu contraseña?
            </a>
            <a 
              href="#" 
              onClick={handleRegisterRedirect} 
              className="register-link"
            >
              Registrarte
            </a>
          </div>
          <button type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
