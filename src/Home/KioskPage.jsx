import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/KiosksPage.css";

const KiosksPage = () => {
  const [kiosks, setKiosks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [paymentType, setPaymentType] = useState("card");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
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

  const handleCreateKiosk = async (e) => {
    e.preventDefault();
    try {
      if (!password || password.length < 8) {
        throw new Error("La contraseña debe tener al menos 8 caracteres");
      }

      const token = Cookies.get("authToken");
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
      setShowForm(false);
      setPassword("");
      setError("");

    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditKiosk = (kioskId) => {
    navigate(`/edit-kiosk/${kioskId}`);
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

  if (loading) return <div className="loading-message">Cargando...</div>;

  return (
    <div className="kiosks-page">
      <h2 className="page-title">Gestión de Kioskos</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      <button 
        onClick={() => setShowForm(true)}
        className="create-kiosk-btn"
      >
        Crear Nuevo Kiosko
      </button>

      {showForm && (
        <form onSubmit={handleCreateKiosk} className="kiosk-form">
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

          <button type="submit" className="submit-btn">Crear Kiosko</button>
          <button 
            type="button" 
            onClick={() => setShowForm(false)} 
            className="cancel-btn"
          >
            Cancelar
          </button>
        </form>
      )}

      <div className="kiosks-list">
        {kiosks.length > 0 ? (
          kiosks.map((kiosk) => (
            <div key={kiosk._id} className="kiosk-card">
              <h3 className="kiosk-title">Kiosko {kiosk.paymentType}</h3>
              <p className="kiosk-id">ID: {kiosk._id}</p>
              <p className="kiosk-date">Creado: {new Date(kiosk.createdAt).toLocaleDateString()}</p>
              <button 
                onClick={() => handleEditKiosk(kiosk._id)} 
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
