import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/RestaurantPage.css";

const RestaurantManagement = () => {
  /////////////////// ESTADOS ///////////////////
  const [hasRestaurant, setHasRestaurant] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("general");
  const [isEditing, setIsEditing] = useState(false);
  const [restaurant, setRestaurant] = useState(null);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

  // Datos del formulario
  const [formData, setFormData] = useState({
    // Información general
    name: "",
    image: "",
    
    // Ubicación
    country: "",
    city: "",
    postalCode: "",
    coordinates: {
      lat: 20.967370,
      lng: -89.592580
    },
    
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

  /////////////////// FUNCIONES AUXILIARES PARA FETCH ///////////////////
  const checkToken = () => {
    const token = Cookies.get("authToken");
    if (!token) {
      navigate("/login");
      return null;
    }
    return token;
  };

  const refreshToken = async () => {
    try {
      const refreshToken = Cookies.get("refreshToken");
      if (!refreshToken) {
        navigate("/login");
        return null;
      }
      
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        throw new Error("Error al refrescar el token");
      }
      
      const data = await response.json();
      Cookies.set("authToken", data.token, { expires: 7 });
      return data.token;
    } catch (err) {
      Cookies.remove("authToken");
      Cookies.remove("refreshToken");
      navigate("/login");
      return null;
    }
  };

  const fetchAPI = async (endpoint, method = "GET", body = null) => {
    let token = checkToken();
    if (!token) return null;

    try {
      const options = {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        ...(body && { body: JSON.stringify(body) }),
      };

      let response = await fetch(`${API_URL}${endpoint}`, options);

      // Si el token ha expirado, intentar refrescarlo y reintentar
      if (response.status === 401) {
        token = await refreshToken();
        if (!token) return null;
        
        options.headers.Authorization = `Bearer ${token}`;
        response = await fetch(`${API_URL}${endpoint}`, options);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error del servidor: ${response.status}`,
        }));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  /////////////////// OBTENER DATOS DEL RESTAURANTE ///////////////////
  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI("/api/restaurants/myRestaurant");
      
      if (data && data.code === "RESTAURANT_REQUIRED") {
        setHasRestaurant(false);
      } else if (data) {
        const simplifiedData = {
          id: data._id,
          name: data.name,
          image: data.image,
          country: data.location?.country || "",
          city: data.location?.city || "",
          street: data.location?.address?.street || "",
          number: data.location?.address?.number || "",
          crossStreets: data.location?.address?.crossStreets || "",
          colony: data.location?.address?.colony || "",
          references: data.location?.address?.references || "",
          postalCode: data.location?.postalCode || "",
          coordinates: data.location?.coordinates || { lat: 20.967370, lng: -89.592580 },
          phone: data.contact?.phone || "",
          email: data.contact?.email || "",
          website: data.contact?.website || ""
        };
        setRestaurant(simplifiedData);
        setHasRestaurant(true);
      }
    } catch (err) {
      setError(`Error al obtener datos del restaurante: ${err.message}`);
      setHasRestaurant(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantData();
  }, []);

  /////////////////// MANEJAR CAMBIOS EN INPUTS ///////////////////
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /////////////////// SUBIR IMAGEN A CLOUDINARY ///////////////////
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setImageUploading(true);
      
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      formDataObj.append('upload_preset', UPLOAD_PRESET);
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formDataObj
      });
      
      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }
      
      const data = await response.json();
      
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

  /////////////////// ABRIR MODAL PARA CREAR/EDITAR ///////////////////
  const openModal = (editing = false) => {
    setIsModalOpen(true);
    setIsEditing(editing);
    setCurrentTab("general");
    
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
        coordinates: restaurant.coordinates || { lat: 20.967370, lng: -89.592580 },
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
        coordinates: { lat: 20.967370, lng: -89.592580 },
        phone: "",
        email: "",
        website: ""
      });
    }
    setError("");
  };

  /////////////////// CANCELAR (CREACIÓN/EDICIÓN) ///////////////////
  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setError("");
  };

  /////////////////// VALIDAR RESTAURANTE ///////////////////
  const validateRestaurant = () => {
    const requiredFields = [
      { field: 'name', message: 'El nombre es obligatorio' },
      { field: 'image', message: 'La imagen es obligatoria' },
      { field: 'country', message: 'El país es obligatorio' },
      { field: 'city', message: 'La ciudad es obligatoria' },
      { field: 'postalCode', message: 'El código postal es obligatorio' },
      { field: 'street', message: 'La calle es obligatoria' },
      { field: 'number', message: 'El número es obligatorio' },
      { field: 'crossStreets', message: 'Las calles entre las que está ubicado son obligatorias' },
      { field: 'colony', message: 'La colonia es obligatoria' },
      { field: 'references', message: 'Las referencias son obligatorias' }
    ];

    for (const { field, message } of requiredFields) {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        setError(message);
        return false;
      }
    }

    setError("");
    return true;
  };

  /////////////////// CREAR/ACTUALIZAR RESTAURANTE ///////////////////
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateRestaurant()) return;

    try {
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
          postalCode: formData.postalCode,
          coordinates: formData.coordinates
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

      const method = isEditing ? "PUT" : "POST";
      const data = await fetchAPI("/api/restaurants/myRestaurant", method, requestBody);
      
      // Si es una creación, se recibe el token actualizado
      if (!isEditing && data.token) {
        Cookies.set("authToken", data.token, { expires: 7 });
      }
      
      // Actualizar todos los estados relevantes
      await fetchRestaurantData();
      
      setIsModalOpen(false);
      setSuccessMessage(isEditing ? "Restaurante actualizado correctamente" : "Restaurante creado correctamente");
      
      // Limpiar mensaje después de un tiempo
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el restaurante: ${err.message}`);
    }
  };

  /////////////////// ELIMINAR RESTAURANTE ///////////////////
  const deleteRestaurant = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este restaurante? Esta acción no se puede deshacer.')) return;
    
    try {
      await fetchAPI(`/api/intern/restaurants/${restaurant.id}`, "DELETE");
      
      setSuccessMessage("Restaurante eliminado correctamente");
      setHasRestaurant(false);
      setRestaurant(null);
      
      // Limpiar mensaje después de un tiempo
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(`Error al eliminar restaurante: ${err.message}`);
    }
  };

  /////////////////// CONECTAR CON STRIPE ///////////////////
  const handleStripeConnect = async () => {
    try {
      const data = await fetchAPI("/api/restaurants/connectStripe");
      
      if (data && data.url) {
        localStorage.setItem("stripeConnectInProgress", "true");
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió URL de Stripe');
      }
    } catch (err) {
      setError(`Error al conectar con Stripe: ${err.message}`);
    }
  };

  // Verificar si venimos de un proceso de conexión Stripe
  useEffect(() => {
    const stripeConnectInProgress = localStorage.getItem("stripeConnectInProgress");
    if (stripeConnectInProgress === "true") {
      localStorage.removeItem("stripeConnectInProgress");
      
      if (window.location.search.includes("success=true")) {
        setSuccessMessage("Conexión con Stripe realizada correctamente");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
      
      fetchRestaurantData();
    }
  }, []);

  /////////////////// RENDERIZADO DE FORMULARIO POR PESTAÑAS ///////////////////
  const renderFormContent = () => {
    switch(currentTab) {
      case "general":
        return (
          <div className="tab-content100">
            <div className="form-grid100">
              <div className="form-group100">
                <label>Nombre del Restaurante:</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre del restaurante"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group100 full-width100">
                <label>Imagen del Restaurante:</label>
                <div className="file-input-container100">
                  <label className="file-input-label100">
                    Seleccionar imagen
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="file-input100"
                    />
                  </label>
                </div>
                {imageUploading && <p className="uploading-message100">Subiendo imagen...</p>}
                {formData.image && (
                  <div className="image-preview100">
                    <img 
                      src={formData.image} 
                      alt="Vista previa" 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case "location":
        return (
          <div className="tab-content100">
            <div className="form-grid100">
              <div className="form-group100">
                <label>País:</label>
                <input
                  type="text"
                  name="country"
                  placeholder="País"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group100">
                <label>Ciudad:</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Ciudad"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group100">
                <label>Código Postal:</label>
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Código Postal"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
        );
      case "address":
        return (
          <div className="tab-content100">
            <div className="form-grid100">
              <div className="form-group100">
                <label>Calle:</label>
                <input
                  type="text"
                  name="street"
                  placeholder="Calle"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group100">
                <label>Número:</label>
                <input
                  type="text"
                  name="number"
                  placeholder="Número exterior"
                  value={formData.number}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group100">
                <label>Entre Calles:</label>
                <input
                  type="text"
                  name="crossStreets"
                  placeholder="Entre calles"
                  value={formData.crossStreets}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group100">
                <label>Colonia:</label>
                <input
                  type="text"
                  name="colony"
                  placeholder="Colonia"
                  value={formData.colony}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group100 full-width100">
                <label>Referencias:</label>
                <textarea
                  name="references"
                  placeholder="Referencias del lugar"
                  value={formData.references}
                  onChange={handleInputChange}
                  required
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
        );
      case "contact":
        return (
          <div className="tab-content100">
            <div className="form-grid100">
              <div className="form-group100">
                <label>Teléfono (opcional):</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Teléfono de contacto"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group100">
                <label>Correo Electrónico (opcional):</label>
                <input
                  type="email"
                  name="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group100">
                <label>Sitio Web (opcional):</label>
                <input
                  type="url"
                  name="website"
                  placeholder="https://www.ejemplo.com"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  /////////////////// RENDERIZADO ///////////////////
  return (
    <div className="restaurant-page100">
      {loading && (
        <div className="loading-container100">
          <div className="loading-spinner100"></div>
          <p>Cargando restaurante...</p>
        </div>
      )}
      {!loading && (
        <>
          <h2 className="page-title100">Gestión de Restaurante</h2>
          
          {/* Mensajes */}
          {error && <p className="error-message100">{error}</p>}
          {successMessage && <p className="success-message100">{successMessage}</p>}

          {/* Contenido principal */}
          {hasRestaurant ? (
            <div className="restaurant-details-container100">
              <div className="toolbar100">
                <button
                  onClick={() => openModal(true)}
                  className="edit-restaurant-btn100"
                >
                  Editar Restaurante
                </button>
                {/* Botón de eliminar comentado por seguridad
                <button
                  onClick={deleteRestaurant}
                  className="delete-restaurant-btn100"
                >
                  Eliminar Restaurante
                </button>
                */}
              </div>

              {/* Stripe Connect Button */}
              <div className="stripe-connect-container100">
                <button 
                  onClick={handleStripeConnect}
                  className="stripe-connect-btn100"
                >
                  Conectar con Stripe
                </button>
                <p className="stripe-info100">Conecta tu restaurante con Stripe para recibir pagos en línea de forma segura y rápida.</p>
              </div>

              <div className="restaurant-card100">
                <div className="restaurant-image-container100">
                  <img src={restaurant.image} alt={restaurant.name} />
                </div>
                
                <div className="restaurant-details100">
                  <h3>{restaurant.name}</h3>
                  
                  <div className="detail-section100">
                    <h4>Ubicación</h4>
                    <p>{restaurant.city}, {restaurant.country}</p>
                    <p>C.P. {restaurant.postalCode}</p>
                  </div>
                  
                  <div className="detail-section100">
                    <h4>Dirección</h4>
                    <p>{restaurant.street} {restaurant.number}, {restaurant.colony}</p>
                    <p>Entre: {restaurant.crossStreets}</p>
                    <p><strong>Referencias:</strong> {restaurant.references}</p>
                  </div>
                  
                  {(restaurant.phone || restaurant.email || restaurant.website) && (
                    <div className="detail-section100">
                      <h4>Contacto</h4>
                      {restaurant.phone && <p><strong>Teléfono:</strong> {restaurant.phone}</p>}
                      {restaurant.email && <p><strong>Email:</strong> {restaurant.email}</p>}
                      {restaurant.website && <p><strong>Sitio Web:</strong> {restaurant.website}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-restaurant-container100">
              <p className="no-restaurant-message100">Aún no has registrado un restaurante. Para comenzar a utilizar la plataforma, registra tu restaurante.</p>
              <button
                onClick={() => openModal(false)}
                className="create-restaurant-btn100"
              >
                Registrar mi Restaurante
              </button>
            </div>
          )}

          {/* Modal para crear o editar restaurante */}
          {isModalOpen && (
            <div className="modal-overlay100">
              <div className="modal-content100 compact-modal100">
                <h3>{isEditing ? "Editar Restaurante" : "Crear Nuevo Restaurante"}</h3>
                
                {/* Pestañas de navegación */}
                <div className="tabs-container100">
                  <div 
                    className={`tab100 ${currentTab === "general" ? "active100" : ""}`}
                    onClick={() => setCurrentTab("general")}
                  >
                    Información General
                  </div>
                  <div 
                    className={`tab100 ${currentTab === "location" ? "active100" : ""}`}
                    onClick={() => setCurrentTab("location")}
                  >
                    Ubicación
                  </div>
                  <div 
                    className={`tab100 ${currentTab === "address" ? "active100" : ""}`}
                    onClick={() => setCurrentTab("address")}
                  >
                    Dirección
                  </div>
                  <div 
                    className={`tab100 ${currentTab === "contact" ? "active100" : ""}`}
                    onClick={() => setCurrentTab("contact")}
                  >
                    Contacto
                  </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                  {renderFormContent()}
                  
                  <div className="modal-buttons100">
                    <button type="submit">{isEditing ? "Actualizar" : "Crear"}</button>
                    <button type="button" onClick={handleCancel}>Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RestaurantManagement;