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
    if (!newKioskName.trim() || !password.trim() || !description.trim()) {
      setError("Por favor, completa todos los campos requeridos.");
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
    if (!editingKiosk?.name?.trim() || !description?.trim()) {
      setError("Por favor, completa todos los campos requeridos.");
      return;
    }

    try {
      // Construir el cuerpo de la solicitud
      const body = {
        name: editingKiosk.name.trim(),
        description: description.trim(),
        ...(password?.trim() && { password: password.trim() }) // Agrega password solo si tiene valor
      };

      // Actualización: usar el nuevo endpoint para actualizar un kiosko
      const result = await fetchAPI(`/api/kiosks/myKiosk/${editingKiosk._id}`, "PUT", body);

      if (result) {
        // Obtener el kiosko actualizado para asegurar que tenemos datos frescos
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

  /////////////////// ABRIR Y CANCELAR FORMULARIOS ///////////////////
  const openCreateModal = () => {
    setIsCreating(true);
    setNewKioskName(`Kiosko ${kiosks.length + 1}`);
    setPassword("");
    setDescription("");
    setShowPassword(false);
    setError("");
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
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingKiosk(null);
    setNewKioskName("");
    setPassword("");
    setDescription("");
    setError("");
  };

  /////////////////// RENDERIZADO ///////////////////

  return (
    <div className="kiosks-page">
      <h2 className="page-title">Gestión de Kioskos</h2>
      {error && <p className="error-message">{error}</p>}
      
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando Kioskos...</p>
        </div>
      )}
      
      ...
      {/* Botón para crear un nuevo kiosko */}
      <button onClick={openCreateModal} className="create-kiosk-btn">
        Crear Nuevo Kiosko
      </button>

      {/* Modal de Creación */}
      {isCreating && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Crear Nuevo Kiosko</h3>
            <form onSubmit={handleSubmit} className="kiosk-form">
              <label>Nombre del Kiosko:</label>
              <input
                type="text"
                placeholder="Nombre personalizado"
                value={newKioskName}
                onChange={(e) => setNewKioskName(e.target.value)}
                required
                className="text-input"
              />

              <label>Descripción del Kiosko:</label>
              <input
                type="text"
                placeholder="Descripción del kiosko"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="text-input"
              />

              <label>Contraseña del Kiosko:</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña del kiosko"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="8"
                  className="text-input"
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <img
                    src={showPassword ? eyeIcon : invisibleIcon}
                    alt="Toggle Password"
                    className="password-icon"
                  />
                </span>
              </div>

              <div className="modal-buttons">
                <button type="submit" className="submit-btn">
                  Crear Kiosko
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-btn"
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Kiosko</h3>
            <form onSubmit={handleSubmit} className="kiosk-form">
              <label>Nombre del Kiosko:</label>
              <input
                type="text"
                placeholder="Nombre del kiosko"
                value={editingKiosk.name}
                onChange={(e) =>
                  setEditingKiosk({ ...editingKiosk, name: e.target.value })
                }
                required
                className="text-input"
              />

              <label>Descripción del Kiosko:</label>
              <input
                type="text"
                placeholder="Descripción del kiosko"
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                required
                className="text-input"
              />

              <label>Contraseña del Kiosko:</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nueva contraseña (opcional)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-input"
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <img
                    src={showPassword ? eyeIcon : invisibleIcon}
                    alt="Toggle Password"
                    className="password-icon"
                  />
                </span>
              </div>

              <div className="modal-buttons">
                <button type="submit" className="submit-btn">
                  Actualizar Kiosko
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-btn"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de kioskos */}
      <div className="kiosks-list">
        {kiosks.length > 0 ? (
          kiosks.map((kiosk) => (
            <div key={kiosk._id} className="kiosk-card">
              <h3 className="kiosk-title">{kiosk.name}</h3>
              <p className="kiosk-description">{kiosk.description}</p>
              <p className="kiosk-id">Serial: {kiosk._id}</p>
              <p className="kiosk-date">
                Creado: {new Date(kiosk.createdAt).toLocaleDateString()}
              </p>
              <div className="kiosk-status">
                <p>Estado: <span className={`status-${kiosk.status}`}>{kiosk.status}</span></p>
                <p>Conexión: {kiosk.isConnected ? "Conectado" : "Desconectado"}</p>
                {kiosk.connected_at && (
                  <p>Última conexión: {new Date(kiosk.connected_at).toLocaleString()}</p>
                )}
              </div>
              <button
                onClick={() => handleEditKiosk(kiosk)}
                className="edit-kiosk-btn"
              >
                ✏️ Editar
              </button>
              <button
                onClick={() => handleDeleteKiosk(kiosk._id)}
                className="delete-kiosk-btn"
              >
                🗑 Eliminar
              </button>
            </div>
          ))
        ) : (
          <p>No hay kioskos creados</p>
        )}
      </div>
    </div>
  );
};

export default KiosksPage;