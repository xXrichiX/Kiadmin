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

  const fetchAPI = async (endpoint, method = "GET", body = null) => {
    const token = checkToken();
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

      const response = await fetch(`${API_URL}${endpoint}`, options);

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
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        const data = await fetchAPI("/api/restaurants/myRestaurant");
        
        if (data.code === "RESTAURANT_REQUIRED") {
          setHasRestaurant(false);
        } else {
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
        }
      } catch (err) {
        setError(`Error al obtener datos del restaurante: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, []);

  /////////////////// VALIDACIONES DE FORMULARIO ///////////////////
  const validateField = (name, value) => {
    // Valores máximos permitidos
    const maxLengths = {
      name: 50,
      street: 100,
      number: 10,
      crossStreets: 100,
      colony: 50,
      references: 200,
      postalCode: 5,  // Modificado a 5 exactamente
      phone: 10,      // Modificado a 10 exactamente
      email: 100,
      website: 100
    };

    // Patrones de validación
    const patterns = {
      name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s&'".,-]{3,}$/,
      postalCode: /^\d{5}$/,  // Exactamente 5 dígitos
      phone: /^\d{10}$/,      // Exactamente 10 dígitos
      email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      website: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/
    };

    // Validar longitud máxima
    if (maxLengths[name] && value.length > maxLengths[name]) {
      return `El campo no puede tener más de ${maxLengths[name]} caracteres`;
    }

    // Validaciones específicas por campo
    switch (name) {
      case 'name':
        if (!patterns.name.test(value)) {
          return "El nombre debe contener al menos 3 caracteres y solo puede incluir letras, espacios y algunos símbolos (&'\".,-)";
        }
        break;
      case 'postalCode':
        if (value && !patterns.postalCode.test(value)) {
          return "El código postal debe contener exactamente 5 dígitos";
        }
        break;
      case 'phone':
        if (value && !patterns.phone.test(value)) {
          return "El teléfono debe contener exactamente 10 dígitos";
        }
        break;
      case 'email':
        if (value && !patterns.email.test(value)) {
          return "El correo electrónico debe tener un formato válido";
        }
        break;
      case 'website':
        if (value && !patterns.website.test(value)) {
          return "La URL del sitio web debe tener un formato válido";
        }
        break;
    }

    return null;
  };

  /////////////////// MANEJAR CAMBIOS EN INPUTS ///////////////////
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Para teléfono y código postal, permitir solo dígitos y aplicar restricción de longitud
    let processedValue = value;
    if (name === 'phone' || name === 'postalCode') {
      // Eliminar caracteres no numéricos
      processedValue = value.replace(/\D/g, '');
      
      // Limitar longitud
      if (name === 'phone' && processedValue.length > 10) {
        processedValue = processedValue.slice(0, 10);
      } else if (name === 'postalCode' && processedValue.length > 5) {
        processedValue = processedValue.slice(0, 5);
      }
    }
    
    // Validar el campo
    const validationError = validateField(name, processedValue);
    
    if (validationError) {
      setError(validationError);
      // Actualizar el estado incluso si hay error de validación para que el usuario pueda seguir escribiendo
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
      return;
    }
    
    // Si pasa la validación, actualizar el estado y limpiar errores
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Solo limpiar el error si fue causado por este campo
    if (error.includes(name) || error.includes(name.charAt(0).toUpperCase() + name.slice(1))) {
      setError("");
    }
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

    // Verificar campos obligatorios
    for (const { field, message } of requiredFields) {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        setError(message);
        return false;
      }
      
      // Validar el contenido del campo
      const validationError = validateField(field, formData[field]);
      if (validationError) {
        setError(validationError);
        return false;
      }
    }

    // Validar campos opcionales que tienen contenido
    const optionalFields = ['phone', 'email', 'website'];
    for (const field of optionalFields) {
      if (formData[field] && formData[field].trim()) {
        const validationError = validateField(field, formData[field]);
        if (validationError) {
          setError(validationError);
          return false;
        }
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

      const method = isEditing ? "PUT" : "POST";
      const data = await fetchAPI("/api/restaurants/myRestaurant", method, requestBody);
      
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
      setIsModalOpen(false);
      setSuccessMessage(isEditing ? "Restaurante actualizado correctamente" : "Restaurante creado correctamente");
      
      // Limpiar mensaje después de un tiempo
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el restaurante: ${err.message}`);
    }
  };

  /////////////////// CONECTAR CON STRIPE ///////////////////
  const handleStripeConnect = async () => {
    try {
      const token = checkToken();
      if (!token) return;
      
      const response = await fetch(`${API_URL}/api/restaurants/connectStripe`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error del servidor: ${response.status}`,
        }));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Redirect to Stripe Connect URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió URL de Stripe');
      }
    } catch (err) {
      setError(`Error al conectar con Stripe: ${err.message}`);
    }
  };

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
                <input
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
                {imageUploading && <p>Subiendo imagen...</p>}
                {formData.image && (
                  <div className="image-preview100">
                    <img 
                      src={formData.image} 
                      alt="Vista previa" 
                      style={{ maxWidth: '200px', maxHeight: '200px' }} 
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
                  placeholder="Código Postal (5 dígitos)"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  maxLength="5"
                  pattern="\d{5}"
                  required
                />
                <small>Debe contener exactamente 5 dígitos</small>
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
                  placeholder="Teléfono de contacto (10 dígitos)"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength="10"
                  pattern="\d{10}"
                />
                <small>Debe contener exactamente 10 dígitos</small>
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
                {/* Botón de eliminar comentado como en el original
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
  {
  <button 
    onClick={handleStripeConnect}
    className="stripe-connect-btn100"
  >
    Conectar con Stripe
  </button>
  }

  {
  <p className="stripe-info100">
    Conecta tu restaurante con Stripe para recibir pagos en línea.
  </p>
  }
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