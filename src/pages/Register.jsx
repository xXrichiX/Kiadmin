import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import "../styles/Register.css";
import eyeIcon from "../assets/ojo.png"; // Importar ícono de ojo visible
import invisibleIcon from "../assets/invisible.png"; // Importar ícono de ojo invisible

function Register() {
  /////////////////// ESTADOS ///////////////////
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    phone: "",
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: "",
  }); // Estado para almacenar los datos del formulario

  const [errors, setErrors] = useState({}); // Estado para manejar errores de validación
  const [formError, setFormError] = useState(""); // Estado para manejar errores generales del formulario
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Estado para mostrar/ocultar confirmación de contraseña
  const [loading, setLoading] = useState(false); // Estado para controlar el estado de carga
  const navigate = useNavigate(); // Hook para navegar entre rutas

  // Desestructuración de los datos del formulario
  const { name, lastName, phone, birthDate, email, password, confirmPassword } = formData;

  /////////////////// FUNCIONES AUXILIARES ///////////////////

  // Función para formatear el número de teléfono mientras el usuario escribe
  const formatPhoneNumber = (value) => {
    const numericValue = value.replace(/\D/g, ""); // Elimina todos los caracteres que no sean dígitos
    const truncatedValue = numericValue.slice(0, 10); // Limita a 10 dígitos

    // Formatea el número de teléfono según su longitud
    if (truncatedValue.length <= 3) {
      return truncatedValue;
    } else if (truncatedValue.length <= 6) {
      return `(${truncatedValue.slice(0, 3)}) ${truncatedValue.slice(3)}`;
    } else {
      return `(${truncatedValue.slice(0, 3)}) ${truncatedValue.slice(3, 6)}-${truncatedValue.slice(6)}`;
    }
  };

  /////////////////// MANEJADORES DE EVENTOS ///////////////////

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si el campo es "phone", formatea el número de teléfono
    if (name === "phone") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: formatPhoneNumber(value),
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }

    // Limpia el error del campo si existe
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Función para validar el formulario
  const validateForm = () => {
    const newErrors = {};

    // Validación del nombre
    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    // Validación del apellido
    if (!lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio";
    }

    // Validación del teléfono
    const phoneDigits = phone.replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length !== 10) {
      newErrors.phone = "Ingrese un número de teléfono válido de 10 dígitos";
    }

    // Validación de la fecha de nacimiento
    if (!birthDate) {
      newErrors.birthDate = "La fecha de nacimiento es obligatoria";
    } else {
      const today = new Date();
      const birthDateObj = new Date(birthDate);
      if (isNaN(birthDateObj.getTime())) {
        newErrors.birthDate = "Fecha no válida";
      } else {
        const age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();
        if (age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())))) {
          newErrors.birthDate = "Debe ser mayor de 18 años";
        }
      }
    }

    // Validación del correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = "Ingrese un correo electrónico válido";
    }

    // Validación de la contraseña
    if (!password || password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    // Validación de la confirmación de la contraseña
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    // Establece los errores y retorna true si no hay errores
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para redirigir al usuario a la página de inicio de sesión
  const handleLoginRedirect = (e) => {
    e.preventDefault();
    navigate("/login", { replace: true });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    // Valida el formulario antes de enviar
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL; // Obtener la URL de la API desde las variables de entorno

    try {
      // Envía los datos del formulario al servidor
      const response = await fetch(`${API_URL}/api/admins/start-register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: name,
          lastName,
          phone: phone.replace(/\D/g, ""), // Envía solo los dígitos del teléfono
          birthDate,
          email,
          password,
        }),
      });

      // Maneja la respuesta del servidor
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error en el registro");
      }

      const data = await response.json();

      // Guarda el ID temporal en cookies y el perfil en localStorage
      Cookies.set("tempId", data.tempId, { 
        expires: 1,
        secure: true,
        sameSite: "strict",
        path: "/"
      });
      
      localStorage.setItem(
        "userProfile",
        JSON.stringify({
          name,
          lastName,
          phone,
          birthDate,
          email,
        })
      );

      // Redirige al usuario a la página de verificación de código INMEDIATAMENTE SIN setTimeout
      navigate("/verify-code", { state: { tempId: data.tempId }, replace: true });
    } catch (err) {
      // Maneja errores durante el registro
      setFormError(err.message || "Error al registrar usuario");
      console.error("Error de registro:", err);
      setLoading(false);
    }
  };

  /////////////////// RENDERIZADO ///////////////////
  return (
    <div className="register-page09">
      <div className="register-container09">
        {/* Imagen de fondo */}
        <div className="register-image09">
          <img
            src="https://res.cloudinary.com/dej4kxb37/image/upload/v1741658856/s4earu86aump4eooafk1.jpg"
            alt="Restaurante"
            className="background-image09"
          />
        </div>

        {/* Formulario de registro */}
        <div className="register-form09">
          <div className="form-content09">
            <h2 className="form-title09">Registro</h2>
            <form onSubmit={handleSubmit} noValidate>
              {/* Campo de nombre */}
              <div className="input-group09">
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  value={name}
                  onChange={handleChange}
                  className={errors.name ? "input-error09" : ""}
                  required
                  disabled={loading}
                />
                {errors.name && <span className="error-text09">{errors.name}</span>}
              </div>

              {/* Campo de apellido */}
              <div className="input-group09">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Apellido"
                  value={lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "input-error09" : ""}
                  required
                  disabled={loading}
                />
                {errors.lastName && <span className="error-text09">{errors.lastName}</span>}
              </div>

              {/* Campo de teléfono */}
              <div className="input-group09">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Teléfono (XXX) XXX-XXXX"
                  value={phone}
                  onChange={handleChange}
                  className={errors.phone ? "input-error09" : ""}
                  required
                  disabled={loading}
                />
                {errors.phone && <span className="error-text09">{errors.phone}</span>}
              </div>

              {/* Campo de fecha de nacimiento */}
              <div className="input-group09">
                <label htmlFor="birthDate" className="date-label09">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={birthDate}
                  onChange={handleChange}
                  className={errors.birthDate ? "input-error09" : ""}
                  required
                  disabled={loading}
                />
                {errors.birthDate && <span className="error-text09">{errors.birthDate}</span>}
              </div>

              {/* Campo de correo electrónico */}
              <div className="input-group09">
                <input
                  type="email"
                  name="email"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={handleChange}
                  className={errors.email ? "input-error09" : ""}
                  required
                  disabled={loading}
                />
                {errors.email && <span className="error-text09">{errors.email}</span>}
              </div>

              {/* Campo de contraseña */}
              <div className="input-group09">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña (mínimo 8 caracteres)"
                  value={password}
                  onChange={handleChange}
                  className={errors.password ? "input-error09" : ""}
                  required
                  disabled={loading}
                />
                <span
                  className="password-toggle09"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <img
                    src={showPassword ? eyeIcon : invisibleIcon}
                    alt="Toggle Password"
                    className="password-icon09"
                  />
                </span>
                {errors.password && <span className="error-text09">{errors.password}</span>}
              </div>

              {/* Campo de confirmación de contraseña */}
              <div className="input-group09">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirmar Contraseña"
                  value={confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "input-error09" : ""}
                  required
                  disabled={loading}
                />
                <span
                  className="password-toggle09"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <img
                    src={showConfirmPassword ? eyeIcon : invisibleIcon}
                    alt="Toggle Password"
                    className="password-icon09"
                  />
                </span>
                {errors.confirmPassword && <span className="error-text09">{errors.confirmPassword}</span>}
              </div>

              {/* Mensaje de error general del formulario */}
              {formError && <p className="form-error-message09">{formError}</p>}

              {/* Botón para enviar el formulario */}
              <div className="button-container09">
                <button type="submit" className="submit-button09" disabled={loading}>
                  {loading ? "Procesando..." : "Registrarse"}
                </button>
              </div>
            </form>

            {/* Enlace para redirigir a la página de inicio de sesión */}
            <div className="auth-links09">
              <p>
                ¿Ya tienes cuenta?{" "}
                <a href="#" onClick={handleLoginRedirect} className="login-link09">
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