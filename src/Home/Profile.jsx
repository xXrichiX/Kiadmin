import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "../styles/Profile.css";

function Profile() {
  // Estados
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    birthDate: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Funciones auxiliares
  const formatPhoneNumber = (value) => {
    if (!value) return "";
    const numericValue = value.toString().replace(/\D/g, "");
    const truncatedValue = numericValue.slice(0, 10);

    if (truncatedValue.length <= 3) {
      return truncatedValue;
    } else if (truncatedValue.length <= 6) {
      return `(${truncatedValue.slice(0, 3)}) ${truncatedValue.slice(3)}`;
    } else {
      return `(${truncatedValue.slice(0, 3)}) ${truncatedValue.slice(3, 6)}-${truncatedValue.slice(6)}`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "No especificada";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Efectos
  useEffect(() => {
    const token = Cookies.get("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchUserData(token);
  }, [navigate]);

  // Solicitudes API
  const fetchUserData = async (token) => {
    const API_URL = import.meta.env.VITE_API_URL;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/admins/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al cargar los datos del perfil");
      }

      const userData = await response.json();
      
      setUser(userData);
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone ? formatPhoneNumber(userData.phone) : "",
        birthDate: formatDate(userData.birthDate),
        email: userData.email || "",
      });
      
      setLoading(false);
    } catch (err) {
      setError(err.message || "Error al cargar el perfil");
      setLoading(false);
      console.error("Error al cargar el perfil:", err);
    }
  };

  const updateUserData = async () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = Cookies.get("authToken");
    
    try {
      // Preparar datos para enviar (excluyendo el campo "email")
      const dataToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone.replace(/\D/g, ""),
        birthDate: formData.birthDate,
        // No incluimos el campo "email" aquí
      };
      
      const response = await fetch(`${API_URL}/api/admins/me`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend), // Enviamos solo los campos editables
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al actualizar el perfil");
      }
  
      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);
      
      // Actualizar usuario en localStorage para compatibilidad
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...storedUser,
        ...updatedUser,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
      }));
      
      alert("Perfil actualizado con éxito");
    } catch (err) {
      setError(err.message || "Error al actualizar el perfil");
      console.error("Error al actualizar el perfil:", err);
    }
  };

  // Manejadores de eventos
  const handleChange = (e) => {
    const { name, value } = e.target;

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

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { firstName, lastName, phone, birthDate, email } = formData;

    if (!firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio";
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length !== 10) {
      newErrors.phone = "Ingrese un número de teléfono válido de 10 dígitos";
    }

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = "Ingrese un correo electrónico válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    updateUserData();
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone ? formatPhoneNumber(user.phone) : "",
      birthDate: formatDate(user.birthDate),
      email: user.email || "",
    });
    setErrors({});
    setIsEditing(false);
  };
// Renderizado
if (loading) {
  return (
    <div className="profile-container">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    </div>
  );
}

if (error && !user) {
  return (
    <div className="profile-container">
      <div className="error">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate("/login")} className="redirect-button">
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="profile-container">
      <div className="profile-card">
        {isEditing ? (
          // Formulario de edición
          <div className="edit-profile-form">
            <h2 className="form-title">Editar Perfil</h2>
            {error && <p className="form-error-message">{error}</p>}
            
            <form onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <label htmlFor="firstName">Nombre</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? "input-error" : ""}
                  required
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="lastName">Apellido</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "input-error" : ""}
                  required
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="(XXX) XXX-XXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? "input-error" : ""}
                  required
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="birthDate">Fecha de Nacimiento</label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className={errors.birthDate ? "input-error" : ""}
                  required
                />
                {errors.birthDate && <span className="error-text">{errors.birthDate}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "input-error" : ""}
                  disabled // Deshabilitar el campo de correo
                  required
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-buttons">
                <button type="button" onClick={handleCancel} className="cancel-button">
                  Cancelar
                </button>
                <button type="submit" className="save-button">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        ) : (
          // Vista de perfil
          <>
            <div className="profile-header">
              <h2>{`${user.firstName} ${user.lastName}`}</h2>
              <p className="profile-email">{user.email}</p>
            </div>
            <div className="profile-details">
              <p className="detail-item">
                <strong className="detail-label">Teléfono:</strong>
                <span className="detail-value">
                  {user.phone ? formatPhoneNumber(user.phone) : "No especificado"}
                </span>
              </p>
              <p className="detail-item">
                <strong className="detail-label">Fecha de Nacimiento:</strong>
                <span className="detail-value">
                  {user.birthDate ? formatDisplayDate(user.birthDate) : "No especificada"}
                </span>
              </p>
              <p className="detail-item">
                <strong className="detail-label">Restaurante:</strong>
                <span className="detail-value">
                  {user.restaurant ? user.restaurant.name : "No asociado a restaurante"}
                </span>
              </p>
              {user.isVerified && (
                <p className="detail-item verified">
                  <strong className="detail-label">Estado:</strong>
                  <span className="detail-value">Verificado</span>
                </p>
              )}
            </div>
            <button onClick={() => setIsEditing(true)} className="edit-profile-btn">
              Editar Perfil
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;