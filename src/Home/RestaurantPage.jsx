import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/RestaurantPage.css";

const RestaurantManagement = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME || "dej4kxb37";
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET || "KibbiKiosk";
  
  const [hasRestaurant, setHasRestaurant] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const navigate = useNavigate();

  // Estados para el formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [isEditing, setIsEditing] = useState(false);
  const [restaurant, setRestaurant] = useState(null);

  // Datos del formulario
  const [formData, setFormData] = useState({
    // Información general
    name: "",
    image: "",
    
    // Ubicación
    country: "",
    city: "",
    postalCode: "",
    
    // Dirección
    street: "",
    number: "",
    crossStreets: "",
    colony: "",
    references: "",
    
    // Contacto (opcionales)
    phone: "",
    email: "",
    website: ""
  });

  // Verifica si el usuario ya tiene un restaurante
  useEffect(() => {
    const checkRestaurant = async () => {
      try {
        const token = Cookies.get("authToken");
        
        const response = await fetch(`${API_URL}/api/restaurants/myRestaurant`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.status === 401 || response.status === 403) {
          Cookies.remove("authToken");
          navigate("/login");
          return;
        }

        const data = await response.json();

        // Refrescar el token después de una petición exitosa
        Cookies.set('authToken', token, { expires: 7 });

        if (data.code === "RESTAURANT_REQUIRED") {
          setHasRestaurant(false);
        } else if (response.ok) {
          const simplifiedData = {
            id: data._id,
            name: data.name,
            image: data.image,
            country: data.location.country,
            city: data.location.city,
            street: data.location.address.street,
            number: data.location.address.number,
            crossStreets: data.location.address.crossStreets,
            colony: data.location.address.colony,
            references: data.location.address.references,
            postalCode: data.location.postalCode,
            phone: data.contact?.phone || "",
            email: data.contact?.email || "",
            website: data.contact?.website || ""
          };
          setRestaurant(simplifiedData);
          setHasRestaurant(true);
        } else {
          throw new Error(data.message || "Error al obtener restaurante");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkRestaurant();
  }, [navigate, API_URL]);

  // Maneja los cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Maneja la subida de imágenes a Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setImageUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }
      
      const data = await response.json();
      
      // Actualizar el formData con la URL de la imagen
      setFormData(prevData => ({
        ...prevData,
        image: data.secure_url
      }));
      
    } catch (err) {
      setError("Error al subir la imagen: " + err.message);
    } finally {
      setImageUploading(false);
    }
  };

  // Abre el modal para crear o editar
  const openModal = (editing = false) => {
    setIsModalOpen(true);
    setIsEditing(editing);
    setActiveTab("general");
    
    if (editing && restaurant) {
      // Precarga los datos del restaurante
      setFormData({
        name: restaurant.name || "",
        image: restaurant.image || "",
        country: restaurant.country || "",
        city: restaurant.city || "",
        street: restaurant.street || "",
        number: restaurant.number || "",
        crossStreets: restaurant.crossStreets || "",
        colony: restaurant.colony || "",
        references: restaurant.references || "",
        postalCode: restaurant.postalCode || "",
        phone: restaurant.phone || "",
        email: restaurant.email || "",
        website: restaurant.website || ""
      });
    } else {
      // Limpia el formulario para crear
      setFormData({
        name: "",
        image: "",
        country: "México", // Valor por defecto
        city: "",
        street: "",
        number: "",
        crossStreets: "",
        colony: "",
        references: "",
        postalCode: "",
        phone: "",
        email: "",
        website: ""
      });
    }
    setError("");
  };

  // Cierra el modal
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setError("");
  };

  // Cambia entre pestañas del formulario
  const changeTab = (tab) => {
    setActiveTab(tab);
  };

  // Verifica si los campos requeridos de la pestaña actual están completos
  const isTabComplete = (tab) => {
    switch (tab) {
      case "general":
        return formData.name && formData.image;
      case "location":
        return formData.country && formData.city && formData.postalCode;
      case "address":
        return formData.street && formData.number && formData.crossStreets && 
               formData.colony && formData.references;
      case "contact":
        return true; // Campos opcionales
      default:
        return false;
    }
  };

  // Avanza a la siguiente pestaña
  const nextTab = () => {
    if (activeTab === "general") changeTab("location");
    else if (activeTab === "location") changeTab("address");
    else if (activeTab === "address") changeTab("contact");
  };

  // Retrocede a la pestaña anterior
  const prevTab = () => {
    if (activeTab === "contact") changeTab("address");
    else if (activeTab === "address") changeTab("location");
    else if (activeTab === "location") changeTab("general");
  };

  // Envía la solicitud para crear o editar el restaurante
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validar campos requeridos
      if (!formData.name || !formData.image || !formData.country || 
          !formData.city || !formData.street || !formData.number || 
          !formData.crossStreets || !formData.colony || 
          !formData.references || !formData.postalCode) {
        throw new Error("Todos los campos obligatorios deben ser completados");
      }

      const token = Cookies.get("authToken");
      const url = `${API_URL}/api/restaurants/myRestaurant`;
      const method = isEditing ? "PUT" : "POST";

      const requestBody = {
        name: formData.name,
        image: formData.image,
        location: { 
          country: formData.country, 
          city: formData.city, 
          address: {
            street: formData.street,
            number: formData.number,
            crossStreets: formData.crossStreets,
            colony: formData.colony,
            references: formData.references
          },
          postalCode: formData.postalCode
        }
      };

      // Agregar contacto solo si hay algún campo lleno
      if (formData.phone || formData.email || formData.website) {
        requestBody.contact = {
          phone: formData.phone || null,
          email: formData.email || null,
          website: formData.website || null
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al guardar restaurante");
      }

      // Refrescar el token después de guardar exitosamente
      Cookies.set('authToken', token, { expires: 7 });

      // Actualiza el estado del restaurante
      const simplifiedData = {
        id: data._id,
        name: data.name,
        image: data.image,
        country: data.location.country,
        city: data.location.city,
        street: data.location.address.street,
        number: data.location.address.number,
        crossStreets: data.location.address.crossStreets,
        colony: data.location.address.colony,
        references: data.location.address.references,
        postalCode: data.location.postalCode,
        phone: data.contact?.phone || "",
        email: data.contact?.email || "",
        website: data.contact?.website || ""
      };
      
      setRestaurant(simplifiedData);
      setHasRestaurant(true);
      closeModal();
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Elimina el restaurante
  const handleDeleteRestaurant = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este restaurante? Esta acción no se puede deshacer.")) {
      return;
    }
    
    try {
      const token = Cookies.get("authToken");
      const response = await fetch(`${API_URL}/api/intern/restaurants/${restaurant.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Error al eliminar restaurante");
      }

      // Refrescar el token después de eliminar exitosamente
      Cookies.set('authToken', token, { expires: 7 });

      setHasRestaurant(false);
      setRestaurant(null);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Función para renderizar la sección actual del formulario
  const renderFormSection = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="form-section">
            <h4>Información General</h4>
            <div className="form-group">
              <label htmlFor="name">Nombre del Restaurante*</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nombre del restaurante"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="image">Imagen del Restaurante*</label>
              <div className="image-upload-container">
                <input
                  id="imageUpload"
                  type="file"
                  name="imageUpload"
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="image-upload-input"
                />
                <label htmlFor="imageUpload" className="image-upload-label">
                  {imageUploading ? "Subiendo..." : "Seleccionar imagen"}
                </label>
                {formData.image && (
                  <div className="image-preview">
                    <img src={formData.image} alt="Vista previa" className="preview-img" />
                    <input
                      id="image"
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="image-url-input"
                      placeholder="URL de la imagen"
                      readOnly
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case "location":
        return (
          <div className="form-section">
            <h4>Ubicación</h4>
            <div className="form-group">
              <label htmlFor="country">País</label>
              <input
                id="country"
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="País"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">Ciudad</label>
              <input
                id="city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Ciudad"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="postalCode">Código Postal</label>
              <input
                id="postalCode"
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                placeholder="Código Postal"
                required
              />
            </div>
          </div>
        );
      case "address":
        return (
          <div className="form-section">
            <h4>Dirección</h4>
            <div className="form-group">
              <label htmlFor="street">Calle*</label>
              <input
                id="street"
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="Calle"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="number">Número</label>
              <input
                id="number"
                type="text"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                placeholder="Número exterior"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="crossStreets">Entre Calles</label>
              <input
                id="crossStreets"
                type="text"
                name="crossStreets"
                value={formData.crossStreets}
                onChange={handleInputChange}
                placeholder="Entre calles"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="colony">Colonia</label>
              <input
                id="colony"
                type="text"
                name="colony"
                value={formData.colony}
                onChange={handleInputChange}
                placeholder="Colonia"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="references">Referencias</label>
              <input
                id="references"
                type="text"
                name="references"
                value={formData.references}
                onChange={handleInputChange}
                placeholder="Referencias del lugar"
                required
              />
            </div>
          </div>
        );
      case "contact":
        return (
          <div className="form-section">
            <h4>Información de Contacto <small>(Opcional)</small></h4>
            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Teléfono de contacto"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="website">Sitio Web</label>
              <input
                id="website"
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://www.ejemplo.com"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="restaurant-page">
    <h2 className="page-title">Gestión de Restaurante</h2>
    {error && <p className="error-message">{error}</p>}
  
    {loading ? (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-message">Cargando Restaurante...</p>
      </div>
    ) : hasRestaurant ? (
      <div className="restaurant-details">
        <div className="restaurant-header">
          <h3>{restaurant.name}</h3>
          <div className="restaurant-actions">
            <button onClick={() => openModal(true)} className="edit-restaurant-btn">
              <i className="icon-edit"></i> Editar Restaurante
            </button>
              {/* 
              <button onClick={handleDeleteRestaurant} className="delete-restaurant-btn">
                <i className="icon-trash"></i> Eliminar
              </button>
              */}
            </div>
          </div>
          
          <div className="restaurant-image-container">
            <img src={restaurant.image} alt={restaurant.name} className="restaurant-image" />
          </div>
          
          <div className="restaurant-info">
            <div className="info-section">
              <h4>Dirección</h4>
              <p>
                {restaurant.street} {restaurant.number}, {restaurant.colony}<br/>
                Entre: {restaurant.crossStreets}<br/>
                {restaurant.city}, {restaurant.country}, C.P. {restaurant.postalCode}
              </p>
              <p><strong>Referencias:</strong> {restaurant.references}</p>
            </div>
            
            {(restaurant.phone || restaurant.email || restaurant.website) && (
              <div className="info-section">
                <h4>Contacto</h4>
                {restaurant.phone && <p><strong>Teléfono:</strong> {restaurant.phone}</p>}
                {restaurant.email && <p><strong>Email:</strong> {restaurant.email}</p>}
                {restaurant.website && <p><strong>Sitio Web:</strong> {restaurant.website}</p>}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="create-restaurant-container">
          <p className="create-restaurant-message">Aún no has registrado un restaurante. Para comenzar a utilizar la plataforma, registra tu restaurante.</p>
          <button onClick={() => openModal(false)} className="create-restaurant-btn">
            <i className="icon-plus"></i> Registrar mi Restaurante
          </button>
        </div>
      )}

      {/* Modal para crear/editar restaurante */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? "Editar Restaurante" : "Registrar Restaurante"}</h3>
              <button className="close-modal-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-tabs">
              <button 
                className={`tab-btn ${activeTab === "general" ? "active" : ""}`}
                onClick={() => changeTab("general")}
              >
                General
              </button>
              <button 
                className={`tab-btn ${activeTab === "location" ? "active" : ""}`}
                onClick={() => changeTab("location")}
              >
                Ubicación
              </button>
              <button 
                className={`tab-btn ${activeTab === "address" ? "active" : ""}`}
                onClick={() => changeTab("address")}
              >
                Dirección
              </button>
              <button 
                className={`tab-btn ${activeTab === "contact" ? "active" : ""}`}
                onClick={() => changeTab("contact")}
              >
                Contacto
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="restaurant-form">
              {renderFormSection()}
              
              <div className="form-navigation">
                {activeTab !== "general" && (
                  <button 
                    type="button" 
                    className="nav-btn prev-btn" 
                    onClick={prevTab}
                  >
                    Anterior
                  </button>
                )}
                
                {activeTab !== "contact" ? (
                  <button 
                    type="button" 
                    className="nav-btn next-btn" 
                    onClick={nextTab}
                    disabled={!isTabComplete(activeTab)}
                  >
                    Siguiente
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="nav-btn submit-btn"
                    disabled={
                      !isTabComplete("general") || 
                      !isTabComplete("location") || 
                      !isTabComplete("address")
                    }
                  >
                    {isEditing ? "Actualizar" : "Crear Restaurante"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RestaurantManagement;