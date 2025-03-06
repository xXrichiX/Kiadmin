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
  const [description, setDescription] = useState(""); // Nuevo estado para la descripción

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL; // URL de la API desde variables de entorno

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
      const newKiosk = await fetchAPI("/api/kiosks/myKiosk", "POST", {
        name: newKioskName.trim(),
        password: password.trim(),
        description: description.trim(), // Añadir descripción al cuerpo de la solicitud
      });

      // Añadir el nuevo kiosko al estado
      setKiosks((prev) => [...prev, newKiosk]);

      // Limpiar formulario y estados
      handleCancel();
    } catch (err) {
      setError(`Error al crear el kiosko: ${err.message}`);
    }
  };

  /////////////////// EDITAR UN KIOSKO ///////////////////
  const updateKiosk = async () => {
    if (!editingKiosk?.name.trim() || !description.trim()) {
      setError("Por favor, completa todos los campos requeridos.");
      return;
    }

    try {
      const body = {
        name: editingKiosk.name.trim(),
        description: description.trim(),
      };

      // Solo actualizar la contraseña si se proporciona una nueva
      if (password.trim()) {
        body.password = password.trim();
      }

      const updatedKiosk = await fetchAPI(`/api/kiosks/myKiosk/${editingKiosk._id}`, "PUT", body);

      // Actualizar el estado local con la respuesta
      setKiosks((prev) =>
        prev.map((kiosk) =>
          kiosk._id === editingKiosk._id ? updatedKiosk : kiosk
        )
      );

      // Limpiar formulario y estados
      handleCancel();
    } catch (err) {
      setError(`Error al actualizar el kiosko: ${err.message}`);
    }
  };

  /////////////////// ELIMINAR UN KIOSKO ///////////////////
  const handleDeleteKiosk = async (kioskId) => {
    try {
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
      if (!newKioskName.trim() || !password.trim() || !description.trim()) {
        setError("Por favor, completa todos los campos requeridos.");
        return;
      }
      await createKiosk();
    } else if (editingKiosk) {
      if (!editingKiosk.name.trim() || !description.trim()) {
        setError("Por favor, completa todos los campos requeridos.");
        return;
      }
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
    setEditingKiosk(kiosk);
    setIsCreating(false);
    setPassword(""); // No prellenar la contraseña al editar
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
  if (loading) return <div className="loading-message">Cargando...</div>;

  return (
    <div className="kiosks-page">
      <h2 className="page-title">Gestión de Kioskos</h2>
      {error && <p className="error-message">{error}</p>}

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
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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