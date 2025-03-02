import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/KiosksPage.css";
import eyeIcon from "../assets/ojo.png";
import invisibleIcon from "../assets/invisible.png";

const KiosksPage = () => {
  const [kiosks, setKiosks] = useState([]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [editingKiosk, setEditingKiosk] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKioskName, setNewKioskName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKiosks = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("https://orderandout-refactor.onrender.com/api/kiosks/mineKiosks", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await response.json();

        if (response.ok) {
          setKiosks(data);
        } else {
          throw new Error(data.message || "Error al obtener kioskos");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKiosks();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get("authToken");
      
      if (editingKiosk) {
        // Editar kiosko existente
        const response = await fetch(`https://orderandout-refactor.onrender.com/api/kiosks/myKiosk/${editingKiosk._id}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: editingKiosk.name,
            password: password
          })
        });

        if (!response.ok) {
          throw new Error("Error al actualizar el kiosko");
        }
      } else {
        // Crear nuevo kiosko
        const response = await fetch("https://orderandout-refactor.onrender.com/api/kiosks/myKiosk", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: newKioskName,
            password: password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error al crear kiosko");
        }
      }

      // Recargar lista después de editar/crear
      const updatedKiosks = await fetchKiosks();
      setKiosks(updatedKiosks);
      handleCancel();
      
    } catch (err) {
      setError(err.message);
    }
  };

  const openCreateModal = () => {
    setIsCreating(true);
    setNewKioskName(`Kiosko ${kiosks.length + 1}`);
    setPassword("");
    setShowPassword(false);
    setError("");
  };

  const handleEditKiosk = (kiosk) => {
    setEditingKiosk(kiosk);
    setIsCreating(false);
    setPassword(kiosk.password || "");
    setShowPassword(false);
    setError("");
  };

  const handleDeleteKiosk = async (kioskId) => {
    try {
      const token = Cookies.get("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`https://orderandout-refactor.onrender.com/api/kiosks/myKiosk/${kioskId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("Error parseando respuesta:", parseError);
      }

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: ${text}`);
      }

      const updatedKiosks = await fetchKiosks();
      setKiosks(updatedKiosks);
    } catch (err) {
      setError(`Error al eliminar: ${err.message}`);
      console.error("Detalles completos:", {
        error: err,
        kioskId,
        responseText: err.responseText || "No hay respuesta"
      });
    }
  };

  const handleCancel = () => {
    setPassword("");
    setShowPassword(false);
    setEditingKiosk(null);
    setIsCreating(false);
    setError("");
  };

  const fetchKiosks = async () => {
    const response = await fetch("https://orderandout-refactor.onrender.com/api/kiosks/mineKiosks", {
      headers: { "Authorization": `Bearer ${Cookies.get("authToken")}` }
    });
    return await response.json();
  };

  if (loading) return <div className="loading-message">Cargando...</div>;

  return (
    <div className="kiosks-page">
      <h2 className="page-title">Gestión de Kioskos</h2>
      
      {error && <p className="error-message">{error}</p>}
      
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
                onChange={(e) => setEditingKiosk({...editingKiosk, name: e.target.value})}
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

      <div className="kiosks-list">
        {kiosks.length > 0 ? (
          kiosks.map((kiosk) => (
            <div key={kiosk._id} className="kiosk-card">
              <h3 className="kiosk-title">{kiosk.name}</h3>
              <p className="kiosk-id">Serial: {kiosk._id}</p>
              <p className="kiosk-date">Creado: {new Date(kiosk.createdAt).toLocaleDateString()}</p>
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