import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "../styles/Register.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    phone: "",
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { name, lastName, phone, birthDate, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const API_URL = process.env.REACT_APP_API_URL;
    try {
      const response = await fetch(`${API_URL}/api/admins/start-register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: name,
          lastName,
          phone,
          birthDate,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en el registro");
      }

      // Guardar ID temporal en cookies y perfil en localStorage
      Cookies.set("tempId", data.tempId, { expires: 1 });
      localStorage.setItem("userProfile", JSON.stringify({
        name,
        lastName,
        phone,
        birthDate,
        email,
      }));

      navigate("/verify-code", { state: { tempId: data.tempId } });
    } catch (err) {
      setError(err.message || "Error al registrar usuario");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-image">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1934&q=80"
            alt="Restaurante"
            className="background-image"
          />
        </div>
        <div className="register-form">
          <div className="form-content">
            <h2 className="form-title">Registro</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  value={name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Apellido"
                  value={lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Teléfono"
                  value={phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="date"
                  name="birthDate"
                  placeholder="Fecha de Nacimiento"
                  value={birthDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmar Contraseña"
                  value={confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="button-container">
                <button type="submit" className="submit-button">
                  Registrarse
                </button>
              </div>
            </form>
            <div className="auth-links">
              <p>
                ¿Ya tienes cuenta?{" "}
                <a href="#" onClick={handleLoginRedirect} className="login-link">
                  Inicia Sesión
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;