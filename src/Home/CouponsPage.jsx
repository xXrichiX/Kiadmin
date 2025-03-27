import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/CouponsPage.css";

const CouponsPage = () => {
  /////////////////// STATE MANAGEMENT ///////////////////
  const [coupons, setCoupons] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [bulkCreateCount, setBulkCreateCount] = useState(1);
  const [formData, setFormData] = useState({
    validity: "",
    type: "percentage", 
    discount: "",
    description: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  /////////////////// AUTHENTICATION AND API FETCH HELPER ///////////////////
  const fetchAPI = async (endpoint, method = "GET", body = null) => {
    const token = Cookies.get("authToken");
    if (!token) {
      navigate("/login");
      return null;
    }

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
          message: `Error del Servidor: ${response.status}`,
        }));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      setError(`Error: ${err.message}`);
      return null;
    }
  };

  /////////////////// FETCH COUPONS ///////////////////
  const fetchAllCoupons = async () => {
    try {
      const data = await fetchAPI("/api/coupons/myCoupons");
      if (data) {
        setCoupons(data);
      }
      setLoading(false);
    } catch (err) {
      setError(`Error al obtener cupones: ${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCoupons();
  }, []);

  /////////////////// VALIDATION ///////////////////
  const validateCoupon = () => {
    setError("");

    if (!formData.validity) {
      setError("La fecha de expiración es obligatoria");
      return false;
    }

    if (!formData.discount) {
      setError("El monto de descuento es obligatorio");
      return false;
    }

    const discount = parseFloat(formData.discount);
    if (formData.type === 'percentage' && (discount < 0 || discount > 100)) {
      setError('El porcentaje debe estar entre 0 y 100');
      return false;
    }

    if (new Date(formData.validity) <= new Date()) {
      setError('La fecha de expiración debe ser en el futuro');
      return false;
    }

    return true;
  };

  /////////////////// CREATE COUPONS ///////////////////
  const createCoupons = async () => {
    if (!validateCoupon()) return;

    try {
      const createPromises = Array.from({ length: bulkCreateCount }, () => 
        fetchAPI("/api/coupons/myCoupon", "POST", formData)
      );

      await Promise.all(createPromises);
      
      setSuccessMessage(`${bulkCreateCount} Cupón(es) creado(s) exitosamente`);
      await fetchAllCoupons();
      
      // Reset form
      setIsCreating(false);
      setFormData({
        validity: "",
        type: "percentage",
        discount: "",
        description: ""
      });
      setBulkCreateCount(1);

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(`Error al crear cupones: ${err.message}`);
    }
  };

  /////////////////// EDIT COUPON ///////////////////
  const editCoupon = (coupon) => {
    setEditingCouponId(coupon._id);
    setFormData({
      validity: coupon.validity.split('T')[0],
      type: coupon.type,
      discount: coupon.discount.toString(),
      description: coupon.description || ""
    });
    setIsEditing(true);
    setIsCreating(false);
    setError("");
  };

  /////////////////// UPDATE COUPON ///////////////////
  const updateCoupon = async () => {
    if (!validateCoupon()) return;

    try {
      await fetchAPI(
        `/api/coupons/myCoupon/${editingCouponId}`, 
        "PUT", 
        formData
      );

      await fetchAllCoupons();
      
      // Reset form and states
      setIsEditing(false);
      setEditingCouponId(null);
      setFormData({
        validity: "",
        type: "percentage",
        discount: "",
        description: ""
      });
      setError("");
    } catch (err) {
      setError(`Error al actualizar cupón: ${err.message}`);
    }
  };

  /////////////////// DELETE COUPON ///////////////////
  const deleteCoupon = async (couponId) => {
    try {
      await fetchAPI(`/api/coupons/myCoupon/${couponId}`, "DELETE");
      await fetchAllCoupons();
      setSuccessMessage("Cupón eliminado exitosamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(`Error al eliminar cupón: ${err.message}`);
    }
  };

  /////////////////// HANDLE CANCEL ///////////////////
  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditingCouponId(null);
    setFormData({
      validity: "",
      type: "percentage",
      discount: "",
      description: ""
    });
    setError("");
  };

  /////////////////// RENDER ///////////////////
  return (
    <div className="coupons-page">
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando Cupones...</p>
        </div>
      )}

      {!loading && (
        <>
          <h2 className="page-title">Gestión de Cupones</h2>
          
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <div className="toolbar">
            <button 
              onClick={() => {
                setIsCreating(true);
                setIsEditing(false);
                setEditingCouponId(null);
                setFormData({
                  validity: "",
                  type: "percentage",
                  discount: "",
                  description: ""
                });
              }}
              className="create-coupon-btn"
            >
              Crear Nuevo Cupón
            </button>
          </div>

          {/* Modal for Creating/Editing Coupons */}
          {(isCreating || isEditing) && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>{isEditing ? "Editar Cupón" : "Crear Nuevo Cupón"}</h3>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Fecha de Expiración</label>
                    <input
                      type="date"
                      value={formData.validity}
                      onChange={(e) => setFormData(prev => ({
                        ...prev, 
                        validity: e.target.value
                      }))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tipo de Descuento</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({
                        ...prev, 
                        type: e.target.value
                      }))}
                    >
                      <option value="percentage">Porcentaje</option>
                      <option value="fixed">Monto Fijo</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Monto de Descuento</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData(prev => ({
                        ...prev, 
                        discount: e.target.value
                      }))}
                      placeholder={formData.type === 'percentage' ? '% Descuento' : 'Monto Fijo'}
                      min="0"
                      max={formData.type === 'percentage' ? 100 : undefined}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Descripción (Opcional)</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({
                        ...prev, 
                        description: e.target.value
                      }))}
                      placeholder="Descripción del cupón"
                    />
                  </div>

                  {isCreating && (
                    <div className="form-group">
                      <label>Crear Múltiples Cupones</label>
                      <select
                        value={bulkCreateCount}
                        onChange={(e) => setBulkCreateCount(Number(e.target.value))}
                      >
                        {[1, 5, 10, 20, 50].map(num => (
                          <option key={num} value={num}>x{num}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="modal-buttons">
                  <button onClick={isEditing ? updateCoupon : createCoupons}>
                    {isEditing ? "Actualizar" : "Crear"}
                  </button>
                  <button onClick={handleCancel}>Cancelar</button>
                </div>
              </div>
            </div>
          )}

          {/* Coupons List */}
          <div className="coupons-grid">
            {coupons.length === 0 ? (
              <div className="no-coupons-message">
                No hay cupones creados aún
              </div>
            ) : (
              coupons.map((coupon) => (
                <div key={coupon._id} className="coupon-card">
                  <div className="coupon-details">
                    <div className="coupon-code">
                      {coupon.type === 'percentage' 
                        ? `${coupon.discount}% Descuento` 
                        : `$${coupon.discount} Descuento`}
                    </div>
                    
                    <div className="coupon-info">
                      <span className="status-badge active">Activo</span>
                      <span className="coupon-type">
                        {coupon.type === 'percentage' ? 'Porcentaje' : 'Monto Fijo'}
                      </span>
                    </div>
                    
                    <div className="coupon-validity">
                      Válido Hasta: {new Date(coupon.validity).toLocaleDateString()}
                    </div>
                    
                    {coupon.description && (
                      <p className="coupon-description">{coupon.description}</p>
                    )}
                    
                    <div className="coupon-actions">
                      <button 
                        onClick={() => editCoupon(coupon)}
                        className="edit-btn"
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        onClick={() => deleteCoupon(coupon._id)}
                        className="delete-btn"
                      >
                        🗑 Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CouponsPage;