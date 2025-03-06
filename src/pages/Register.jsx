import React, { useState, useEffect } from "react";
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
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const { name, lastName, phone, birthDate, email, password, confirmPassword } = formData;

  // Función para formatear el número de teléfono mientras el usuario escribe
  const formatPhoneNumber = (value) => {
    // Eliminar todos los caracteres no numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Limitar a 10 dígitos
    const truncatedValue = numericValue.slice(0, 10);
    
    // Formatear como (XXX) XXX-XXXX
    if (truncatedValue.length <= 3) {
      return truncatedValue;
    } else if (truncatedValue.length <= 6) {
      return `(${truncatedValue.slice(0, 3)}) ${truncatedValue.slice(3)}`;
    } else {
      return `(${truncatedValue.slice(0, 3)}) ${truncatedValue.slice(3, 6)}-${truncatedValue.slice(6)}`;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Manejar formato especial para el teléfono
    if (name === "phone") {
      setFormData(prevState => ({
        ...prevState,
        [name]: formatPhoneNumber(value)
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
    
    // Limpiar errores específicos cuando el usuario comienza a corregir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar nombre
    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }
    
    // Validar apellido
    if (!lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio";
    }
    
    // Validar teléfono (debe tener 10 dígitos después de quitar formateo)
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length !== 10) {
      newErrors.phone = "Ingrese un número de teléfono válido de 10 dígitos";
    }
    
    // Validar fecha de nacimiento
    if (!birthDate) {
      newErrors.birthDate = "La fecha de nacimiento es obligatoria";
    } else {
      const today = new Date();
      const birthDateObj = new Date(birthDate);
      
      // Verificar si la fecha es válida
      if (isNaN(birthDateObj.getTime())) {
        newErrors.birthDate = "Fecha no válida";
      } 
      // Verificar si la persona es mayor de 18 años
      else {
        const age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();
        
        if (age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())))) {
          newErrors.birthDate = "Debe ser mayor de 18 años";
        }
      }
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = "Ingrese un correo electrónico válido";
    }
    
    // Validar contraseña
    if (!password || password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }
    
    // Validar confirmación de contraseña
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginRedirect = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
      return;
    }

    const API_URL = process.env.REACT_APP_API_URL || "https://api.example.com";  // Fallback para desarrollo
    
    try {
      const response = await fetch(`${API_URL}/api/admins/start-register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: name,
          lastName,
          phone: phone.replace(/\D/g, ''),  // Enviar solo los dígitos
          birthDate,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error en el registro");
      }

      const data = await response.json();

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
      setFormError(err.message || "Error al registrar usuario");
      console.error("Error de registro:", err);
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
            <form onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  value={name}
                  onChange={handleChange}
                  className={errors.name ? "input-error" : ""}
                  required
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              <div className="input-group">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Apellido"
                  value={lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "input-error" : ""}
                  required
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
              <div className="input-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Teléfono (XXX) XXX-XXXX"
                  value={phone}
                  onChange={handleChange}
                  className={errors.phone ? "input-error" : ""}
                  required
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
              <div className="input-group">
                <label htmlFor="birthDate" className="date-label">Fecha de Nacimiento</label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={birthDate}
                  onChange={handleChange}
                  className={errors.birthDate ? "input-error" : ""}
                  required
                />
                {errors.birthDate && <span className="error-text">{errors.birthDate}</span>}
              </div>
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={handleChange}
                  className={errors.email ? "input-error" : ""}
                  required
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña (mínimo 8 caracteres)"
                  value={password}
                  onChange={handleChange}
                  className={errors.password ? "input-error" : ""}
                  required
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
              <div className="input-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmar Contraseña"
                  value={confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "input-error" : ""}
                  required
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
              {formError && <p className="form-error-message">{formError}</p>}
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