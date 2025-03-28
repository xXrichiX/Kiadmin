import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/CouponsPage.css";

const CouponsPage = () => {
  /////////////////// STATE MANAGEMENT ///////////////////
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [bulkCreateCount, setBulkCreateCount] = useState(1);
  const [formData, setFormData] = useState({
    code: "",
    validity: "",
    type: "percentage", 
    discount: "",
    description: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  // Estado para los filtros
  const [filters, setFilters] = useState({
    status: "valid", // Por defecto mostrar activos
    type: "",
    searchTerm: ""
  });
  // Estadísticas de cupones
  const [couponStats, setCouponStats] = useState({
    total: 0,
    valid: 0,
    expired: 0,
    consumed: 0,
    disabled: 0
  });

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Estados de cupones
  const couponStatuses = {
    "valid": "Válido",
    "expired": "Expirado",
    "consumed": "Consumido",
    "disabled": "Deshabilitado"
  };

  // Tipos de cupones
  const couponTypes = {
    "percentage": "Porcentaje",
    "fixed": "Monto Fijo"
  };

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
      setLoading(true);
      const data = await fetchAPI("/api/coupons/mineCoupons");
      if (data) {
        // Procesar estado del cupón basado en la fecha de validez
        const processedCoupons = data.map(coupon => {
          let status = coupon.status || 'valid';
          const now = new Date();
          const validityDate = new Date(coupon.validity);
          
          // Solo actualizamos el estado a expirado si está válido pero la fecha ya pasó
          if (status === 'valid' && validityDate < now) {
            status = "expired";
          }
          
          return {
            ...coupon,
            status
          };
        });
        
        setCoupons(processedCoupons);
        applyFilters(processedCoupons);
        calculateCouponStats(processedCoupons);
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

  // Aplicar filtros a los cupones
  const applyFilters = (couponList) => {
    let result = [...couponList];
    
    // Filtrar por estado
    if (filters.status) {
      result = result.filter(coupon => coupon.status === filters.status);
    }
    
    // Filtrar por tipo
    if (filters.type) {
      result = result.filter(coupon => coupon.type === filters.type);
    }
    
    // Filtrar por término de búsqueda (código o descripción)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(coupon => 
        coupon.code.toLowerCase().includes(searchLower) ||
        (coupon.description && coupon.description.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredCoupons(result);
  };

  // Calcular estadísticas de cupones
  const calculateCouponStats = (couponList) => {
    const stats = {
      total: couponList.length,
      valid: couponList.filter(coupon => coupon.status === "valid").length,
      expired: couponList.filter(coupon => coupon.status === "expired").length,
      consumed: couponList.filter(coupon => coupon.status === "consumed").length,
      disabled: couponList.filter(coupon => coupon.status === "disabled").length
    };
    setCouponStats(stats);
  };

  // Actualizar filtros cuando cambian
  useEffect(() => {
    if (coupons.length > 0) {
      applyFilters(coupons);
    }
  }, [filters, coupons]);

  // Manejar cambios en filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Resetear filtros
  const resetFilters = () => {
    setFilters({
      status: "valid",
      type: "",
      searchTerm: ""
    });
  };

  /////////////////// VALIDATION ///////////////////
  const validateCoupon = () => {
    setError("");

    if (!formData.code) {
      setError("El código de cupón es obligatorio");
      return false;
    }

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
        code: "",
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
      code: coupon.code,
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
        code: "",
        validity: "",
        type: "percentage",
        discount: "",
        description: ""
      });
      setError("");
    } catch (err) {
      setError(`Error al actualizar el cupón: ${err.message}`);
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
      code: "",
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

          {/* Resumen de estadísticas */}
          <div className="stats-container">
            <div className="stat-card">
              <h3>Cupones Totales</h3>
              <p>{couponStats.total}</p>
            </div>
            <div className="stat-card valid">
              <h3>Válidos</h3>
              <p>{couponStats.valid}</p>
            </div>
            <div className="stat-card expired">
              <h3>Expirados</h3>
              <p>{couponStats.expired}</p>
            </div>
            <div className="stat-card consumed">
              <h3>Consumidos</h3>
              <p>{couponStats.consumed}</p>
            </div>
            <div className="stat-card disabled">
              <h3>Deshabilitados</h3>
              <p>{couponStats.disabled}</p>
            </div>
          </div>

          {/* Panel de filtros */}
          <div className="filters-panel">
            <h3>Filtros</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="status">Estado:</label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  {Object.keys(couponStatuses).map(status => (
                    <option key={status} value={status}>
                      {couponStatuses[status]}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="type">Tipo de Cupón:</label>
                <select
                  id="type"
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  {Object.keys(couponTypes).map(type => (
                    <option key={type} value={type}>
                      {couponTypes[type]}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="searchTerm">Buscar:</label>
                <input
                  type="text"
                  id="searchTerm"
                  name="searchTerm"
                  placeholder="Código o descripción..."
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            
            <div className="filter-actions">
              <button onClick={resetFilters} className="reset-btn">
                Limpiar Filtros
              </button>
            </div>
          </div>

          <div className="toolbar">
            <button 
              onClick={() => {
                setIsCreating(true);
                setIsEditing(false);
                setEditingCouponId(null);
                setFormData({
                  code: "",
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
                    <label>Código de Cupón</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({
                        ...prev, 
                        code: e.target.value.toUpperCase()
                      }))}
                      placeholder="Código único del cupón"
                      maxLength="10"
                    />
                  </div>

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
          <div className="results-info">
            <p>Mostrando {filteredCoupons.length} de {coupons.length} cupones</p>
          </div>

          <div className="coupons-grid">
            {filteredCoupons.length === 0 ? (
              <div className="no-coupons-message">
                No hay cupones que coincidan con los filtros seleccionados
              </div>
            ) : (
              filteredCoupons.map((coupon) => (
                <div key={coupon._id} className={`coupon-card ${coupon.status}`}>
                  <div className="coupon-details">
                    <div className="coupon-code">
                      <strong>Código:</strong> {coupon.code}
                    </div>
                    
                    <div className="coupon-value">
                      {coupon.type === 'percentage' 
                        ? `${coupon.discount}% Descuento` 
                        : `$${coupon.discount} Descuento`}
                    </div>
                    
                    <div className="coupon-info">
                      <span className={`status-badge ${coupon.status}`}>
                        {couponStatuses[coupon.status] || coupon.status}
                      </span>
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
                        disabled={coupon.status !== 'valid'}
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