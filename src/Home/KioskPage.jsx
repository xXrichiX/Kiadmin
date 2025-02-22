import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/KiosksPage.css";

const KiosksPage = () => {
  const [kiosks, setKiosks] = useState([]);
  const [paymentType, setPaymentType] = useState("card");
  const [password, setPassword] = useState("");
  const [editingKiosk, setEditingKiosk] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false); // Para el formulario de creación
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKiosks = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("https://orderandout.onrender.com/api/intern/kiosks/mine", {
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

  // Función unificada para crear o actualizar un kiosko
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!password || password.length < 8) {
        throw new Error("La contraseña debe tener al menos 8 caracteres");
      }

      const token = Cookies.get("authToken");
      if (editingKiosk) {
        // Actualizar kiosko existente
        const response = await fetch(`https://orderandout.onrender.com/api/intern/kiosks/${editingKiosk._id}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            paymentType,
            password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error al actualizar el kiosko");
        }

        setKiosks(kiosks.map(kiosk => kiosk._id === editingKiosk._id ? data : kiosk));
      } else {
        // Crear nuevo kiosko
        const response = await fetch("https://orderandout.onrender.com/api/intern/kiosks", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            paymentType,
            password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error al crear kiosko");
        }

        setKiosks([...kiosks, data]);
      }
      handleCancel(); // Limpia el formulario y sale del modo de edición/creación
    } catch (err) {
      setError(err.message);
    }
  };

  // Configura el formulario para editar un kiosko, precargando sus datos
  const handleEditKiosk = (kiosk) => {
    setEditingKiosk(kiosk);
    setPaymentType(kiosk.paymentType);
    setPassword(kiosk.password || "");
    setIsCreating(true); // Abre la ventana modal
    setError("");
  };

  const handleDeleteKiosk = async (kioskId) => {
    try {
      const token = Cookies.get("authToken");
      const response = await fetch(`https://orderandout.onrender.com/api/intern/kiosks/${kioskId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Error al eliminar kiosko");
      }

      setKiosks(kiosks.filter(kiosk => kiosk._id !== kioskId));
    } catch (err) {
      setError("Error al eliminar el kiosko");
    }
  };

  // Limpia el formulario y resetea el modo de edición
  const handleCancel = () => {
    setPaymentType("card");
    setPassword("");
    setEditingKiosk(null);
    setIsCreating(false); // Cierra la ventana modal
    setError("");
  };

  if (loading) return <div className="loading-message">Cargando...</div>;

  return (
    <div className="kiosks-page">
      <h2 className="page-title">Gestión de Kioskos</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      {/* Botón para crear un nuevo kiosko (siempre visible) */}
      <button 
        onClick={() => {
          setIsCreating(true);
          setEditingKiosk(null); // Asegura que no estemos en modo edición
          setPaymentType("card");
          setPassword("");
          setError("");
        }}
        className="create-kiosk-btn"
      >
        Crear Nuevo Kiosko
      </button>

      {/* Ventana modal para el formulario de creación/edición */}
      {(isCreating || editingKiosk) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingKiosk ? "Editar Kiosko" : "Crear Nuevo Kiosko"}</h3>
            <form onSubmit={handleSubmit} className="kiosk-form">
              <label>Tipo de Pago:</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="select-input"
              >
                <option value="card">Tarjeta</option>
                <option value="cash">Efectivo</option>
                <option value="both">Ambos</option>
              </select>

              <label>Contraseña del Kiosko:</label>
              <input
                type="password"
                placeholder="Contraseña del kiosko"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="8"
                className="text-input"
              />

              <div className="modal-buttons">
                <button type="submit" className="submit-btn">
                  {editingKiosk ? "Actualizar Kiosko" : "Crear Kiosko"}
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
              <h3 className="kiosk-title">Kiosko {kiosk.paymentType}</h3>
              <p className="kiosk-id">ID: {kiosk._id}</p>
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