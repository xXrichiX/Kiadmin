import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/KiosksPage.css";
import eyeIcon from "../assets/ojo.png";
import invisibleIcon from "../assets/invisible.png";

const KiosksPage = () => {
  /////////////////// ESTADOS ///////////////////
  const [kiosks, setKiosks] = useState([]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [editingKiosk, setEditingKiosk] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKioskName, setNewKioskName] = useState("");
  const [description, setDescription] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

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

  /////////////////// VALIDACIONES ///////////////////
  const validatePassword = (pass) => {
    // Validar que la contraseña tenga al menos 8 caracteres, una mayúscula, una minúscula y un número
    const hasMinLength = pass.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    
    if (!hasMinLength) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }
    if (!hasUpperCase) {
      return "La contraseña debe incluir al menos una letra mayúscula.";
    }
    if (!hasLowerCase) {
      return "La contraseña debe incluir al menos una letra minúscula.";
    }
    if (!hasNumber) {
      return "La contraseña debe incluir al menos un número.";
    }
    
    return "";
  };

  const validateKioskName = (name) => {
    if (!name.trim()) {
      return "El nombre del kiosko es obligatorio.";
    }
    
    // Verificar que el nombre no esté repetido
    const nameExists = kiosks.some(
      (kiosk) => kiosk.name.toLowerCase() === name.toLowerCase() && 
                (editingKiosk ? kiosk._id !== editingKiosk._id : true)
    );
    
    if (nameExists) {
      return "Ya existe un kiosko con este nombre. Por favor, elija otro nombre.";
    }
    
    return "";
  };

  const validateDescription = (desc) => {
    if (!desc.trim()) {
      return "La descripción es obligatoria.";
    }
    return "";
  };

  /////////////////// OBTENER DATOS (KIOSKOS) ///////////////////
  useEffect(() => {
    const fetchKiosks = async () => {
      try {
        // Actualización: usar el nuevo endpoint para obtener los kioskos
        const data = await fetchAPI("/api/kiosks/mineKiosks");
        if (data) {
          setKiosks(data);
        }
        setLoading(false);
      } catch (err) {
        setError(`Error al obtener kioskos: ${err.message}`);
        setLoading(false);
      }
    };

    fetchKiosks();
  }, [API_URL, navigate]);

  /////////////////// CREAR UN KIOSKO ///////////////////
  const createKiosk = async () => {
    // Limpiar errores previos
    setNameError("");
    setDescriptionError("");
    setPasswordError("");
    setError("");
    
    // Validar cada campo individualmente
    const nameValidationError = validateKioskName(newKioskName);
    const descriptionValidationError = validateDescription(description);
    const passwordValidationError = validatePassword(password);
    
    // Establecer errores si existen
    let hasErrors = false;
    
    if (nameValidationError) {
      setNameError(nameValidationError);
      hasErrors = true;
    }
    
    if (descriptionValidationError) {
      setDescriptionError(descriptionValidationError);
      hasErrors = true;
    }
    
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      hasErrors = true;
    }
    
    // Si hay errores, detener la creación
    if (hasErrors) {
      return;
    }

    try {
      // Actualización: usar el nuevo endpoint para crear un kiosko
      const result = await fetchAPI("/api/kiosks/myKiosk", "POST", {
        name: newKioskName.trim(),
        password: password.trim(),
        description: description.trim(),
      });

      // Añadir el nuevo kiosko al estado
      if (result && result.kiosk) {
        setKiosks((prev) => [...prev, result.kiosk]);
      } else {
        throw new Error("No se recibió respuesta válida al crear el kiosko");
      }

      // Limpiar formulario y estados
      handleCancel();
    } catch (err) {
      setError(`Error al crear el kiosko: ${err.message}`);
    }
  };

  /////////////////// EDITAR UN KIOSKO ///////////////////
  const updateKiosk = async () => {
    // Limpiar errores previos
    setNameError("");
    setDescriptionError("");
    setPasswordError("");
    setError("");
    
    // Validar nombre y descripción
    const nameValidationError = validateKioskName(editingKiosk.name);
    const descriptionValidationError = validateDescription(description);
    
    // Validar contraseña solo si se proporciona una nueva
    let passwordValidationError = "";
    if (password.trim()) {
      passwordValidationError = validatePassword(password);
    }
    
    // Establecer errores si existen
    let hasErrors = false;
    
    if (nameValidationError) {
      setNameError(nameValidationError);
      hasErrors = true;
    }
    
    if (descriptionValidationError) {
      setDescriptionError(descriptionValidationError);
      hasErrors = true;
    }
    
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      hasErrors = true;
    }
    
    if (hasErrors) {
      return;
    }

    try {
      // Construir el cuerpo de la solicitud
      const body = {
        name: editingKiosk.name.trim(),
        description: description.trim(),
        ...(password?.trim() && { password: password.trim() }) // Agrega password solo si tiene valor
      };

      const result = await fetchAPI(`/api/kiosks/myKiosk/${editingKiosk._id}`, "PUT", body);

      if (result) {
        const updatedKiosk = await fetchAPI(`/api/kiosks/myKiosk/${editingKiosk._id}`, "GET");
        
        // Actualizar la lista de kioskos en el estado local
        setKiosks((prev) =>
          prev.map((kiosk) =>
            kiosk._id === editingKiosk._id ? updatedKiosk : kiosk
          )
        );
      }

      // Limpiar el formulario y los estados
      handleCancel();
    } catch (err) {
      setError(`Error al actualizar el kiosko: ${err?.message || "Error desconocido"}`);
    }
  };

  /////////////////// ELIMINAR UN KIOSKO ///////////////////
  const handleDeleteKiosk = async (kioskId) => {
    try {
      // Actualización: usar el nuevo endpoint para eliminar un kiosko
      await fetchAPI(`/api/kiosks/myKiosk/${kioskId}`, "DELETE");

      // Actualizar el estado local después de eliminar
      setKiosks((prev) => prev.filter((kiosk) => kiosk._id !== kioskId));
      setError(""); // Limpiar errores
    } catch (err) {
      setError(`Error al eliminar el kiosko: ${err.message}`);
    }
  };

  /////////////////// MANEJAR ENVÍO DEL FORMULARIO ///////////////////
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isCreating) {
      await createKiosk();
    } else if (editingKiosk) {
      await updateKiosk();
    }
  };

  /////////////////// MANEJAR CAMBIOS EN LOS CAMPOS ///////////////////
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(""); // Limpiar errores al cambiar
  };

  const handleNameChange = (e) => {
    if (isCreating) {
      setNewKioskName(e.target.value);
    } else {
      setEditingKiosk({ ...editingKiosk, name: e.target.value });
    }
    setNameError(""); // Limpiar errores al cambiar
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    setDescriptionError(""); // Limpiar errores al cambiar
  };

  /////////////////// ABRIR Y CANCELAR FORMULARIOS ///////////////////
  const openCreateModal = () => {
    setIsCreating(true);
    setNewKioskName(`Kiosko ${kiosks.length + 1}`);
    setPassword("");
    setDescription("");
    setShowPassword(false);
    setError("");
    setNameError("");
    setDescriptionError("");
    setPasswordError("");
  };

  const handleEditKiosk = (kiosk) => {
    // Asegurarse de que tenemos todos los datos necesarios
    if (!kiosk) {
      setError("No se pudo cargar el kiosko para editar");
      return;
    }
    
    // Establecer los valores correctos en todos los estados
    setEditingKiosk({...kiosk});
    setIsCreating(false);
    setPassword("");
    // Importante: asegúrate de que description se inicialice correctamente
    setDescription(kiosk.description || "");
    setShowPassword(false);
    setError("");
    setNameError("");
    setDescriptionError("");
    setPasswordError("");
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingKiosk(null);
    setNewKioskName("");
    setPassword("");
    setDescription("");
    setError("");
    setNameError("");
    setDescriptionError("");
    setPasswordError("");
  };

  /////////////////// RENDERIZADO ///////////////////

  return (
    <div className="kiosks-page25">
      <h2 className="page-title25">Gestión de Kioskos</h2>
      {error && <p className="error-message25">{error}</p>}
      
      {/* Botón para crear un nuevo kiosko */}
      <button onClick={openCreateModal} className="create-kiosk-btn25">
        Crear Nuevo Kiosko
      </button>

      {/* Modal de Creación */}
      {isCreating && (
        <div className="modal-overlay25">
          <div className="modal-content25">
            <h3>Crear Nuevo Kiosko</h3>
            <form onSubmit={handleSubmit} className="kiosk-form25">
              <label>Nombre del Kiosko:</label>
              <input
                type="text"
                placeholder="Nombre personalizado"
                value={newKioskName}
                onChange={handleNameChange}
                required
                className={nameError ? "text-input25 input-error25" : "text-input25"}
              />
              {nameError && <p className="error-message25 inline-error">{nameError}</p>}

              <label>Descripción del Kiosko:</label>
              <input
                type="text"
                placeholder="Descripción del kiosko"
                value={description}
                onChange={handleDescriptionChange}
                required
                className={descriptionError ? "text-input25 input-error25" : "text-input25"}
              />
              {descriptionError && <p className="error-message25 inline-error">{descriptionError}</p>}

              <label>Contraseña del Kiosko:</label>
              <div className="password-input-container25">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña del kiosko"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  className={passwordError ? "text-input25 input-error25" : "text-input25"}
                />
                <span
                  className="password-toggle25"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <img
                    src={showPassword ? eyeIcon : invisibleIcon}
                    alt="Toggle Password"
                    className="password-icon25"
                  />
                </span>
              </div>
              {passwordError && <p className="error-message25 inline-error">{passwordError}</p>}
              <p className="password-requirements25">
                La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número.
              </p>

              <div className="modal-buttons25">
                <button type="submit" className="submit-btn25">
                  Crear Kiosko
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-btn25"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {editingKiosk && (
        <div className="modal-overlay25">
          <div className="modal-content25">
            <h3>Editar Kiosko</h3>
            <form onSubmit={handleSubmit} className="kiosk-form25">
              <label>Nombre del Kiosko:</label>
              <input
                type="text"
                placeholder="Nombre del kiosko"
                value={editingKiosk.name}
                onChange={handleNameChange}
                required
                className={nameError ? "text-input25 input-error25" : "text-input25"}
              />
              {nameError && <p className="error-message25 inline-error">{nameError}</p>}

              <label>Descripción del Kiosko:</label>
              <input
                type="text"
                placeholder="Descripción del kiosko"
                value={description} 
                onChange={handleDescriptionChange}
                required
                className={descriptionError ? "text-input25 input-error25" : "text-input25"}
              />
              {descriptionError && <p className="error-message25 inline-error">{descriptionError}</p>}

              <label>Contraseña del Kiosko:</label>
              <div className="password-input-container25">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nueva contraseña (opcional)"
                  value={password}
                  onChange={handlePasswordChange}
                  className={passwordError ? "text-input25 input-error25" : "text-input25"}
                />
                <span
                  className="password-toggle25"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <img
                    src={showPassword ? eyeIcon : invisibleIcon}
                    alt="Toggle Password"
                    className="password-icon25"
                  />
                </span>
              </div>
              {passwordError && <p className="error-message25 inline-error">{passwordError}</p>}
              {password && (
                <p className="password-requirements25">
                  La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número.
                </p>
              )}

              <div className="modal-buttons25">
                <button type="submit" className="submit-btn25">
                  Actualizar Kiosko
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-btn25"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sección de carga o lista de kioskos */}
      {loading ? (
        <div className="loading-container25">
          <div className="loading-spinner25"></div>
          <p>Cargando Kioskos...</p>
        </div>
      ) : (
        <div className="kiosks-list25">
          {kiosks.length > 0 ? (
            kiosks.map((kiosk) => (
              <div key={kiosk._id} className="kiosk-card25">
                <h3 className="kiosk-title25">{kiosk.name}</h3>
                <p className="kiosk-description25">{kiosk.description}</p>
                <p className="kiosk-id25">Serial: {kiosk._id}</p>
                <p className="kiosk-date25">
                  Creado: {new Date(kiosk.createdAt).toLocaleDateString()}
                </p>
                <div className="kiosk-status25">
                  <p>Estado: <span className={`status-${kiosk.status}25`}>{kiosk.status}</span></p>
                  <p>Conexión: {kiosk.isConnected ? "Conectado" : "Desconectado"}</p>
                  {kiosk.connected_at && (
                    <p>Última conexión: {new Date(kiosk.connected_at).toLocaleString()}</p>
                  )}
                </div>
                <button
                  onClick={() => handleEditKiosk(kiosk)}
                  className="edit-kiosk-btn25"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDeleteKiosk(kiosk._id)}
                  className="delete-kiosk-btn25"
                >
                  🗑 Eliminar
                </button>
              </div>
            ))
          ) : (
            <p>No hay kioskos creados</p>
          )}
        </div>
      )}
    </div>
  );
};

export default KiosksPage;