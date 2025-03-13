import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/ProductsPage.css";

const ProductsPage = () => {
  // Estados
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState(getEmptyProduct());
  const [successMessage, setSuccessMessage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;
  
  // Producto vacío para formulario
  function getEmptyProduct() {
    return {
      name: "",
      description: "",
      image: "",
      costPrice: "",
      salePrice: "",
      category: "",
      ingredients: "",
      availability: true,
      currency: "MXN"
    };
  }

  // Validación de producto
  const validateProduct = () => {
    const requiredFields = [
      { field: 'name', message: 'El nombre es obligatorio' },
      { field: 'description', message: 'La descripción es obligatoria' },
      { field: 'image', message: 'La imagen es obligatoria' },
      { field: 'costPrice', message: 'El precio de costo es obligatorio' },
      { field: 'salePrice', message: 'El precio de venta es obligatorio' },
      { field: 'category', message: 'La categoría es obligatoria' }
    ];

    for (const { field, message } of requiredFields) {
      if (!newProduct[field] || (typeof newProduct[field] === 'string' && !newProduct[field].trim())) {
        setError(message);
        return false;
      }
    }

    setError("");
    return true;
  };

  // Obtener token de autenticación
  const getToken = () => {
    const token = Cookies.get("authToken");
    if (!token) {
      navigate("/login");
      return null;
    }
    return token;
  };

  // Crear headers de autenticación
  const createAuthHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  });

  // Helper para peticiones con autenticación
  const fetchWithAuth = useCallback(async (endpoint, options = {}) => {
    const token = getToken();
    if (!token) return null;
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...createAuthHeaders(token),
          ...(options.headers || {})
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(`Error ${response.status}: ${errorData.message || JSON.stringify(errorData)}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error en fetchWithAuth (${endpoint}):`, error);
      throw error;
    }
  }, [API_URL, navigate]);

  // Obtener todos los productos
  const fetchAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      const productsData = await fetchWithAuth("/api/products/mineProducts");
      setProducts(productsData);
      return productsData;
    } catch (err) {
      setError(`Error al obtener productos: ${err.message}`);
      console.error("Error al obtener productos:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);
  
  // Carga inicial de datos
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = getToken();
        if (!token) return;
        
        setLoading(true);
        
        // Peticiones en paralelo para mejor rendimiento
        const [categoriesData, productsData] = await Promise.all([
          fetchWithAuth("/api/categories/mineCategory"),
          fetchWithAuth("/api/products/mineProducts")
        ]);
        
        setCategories(categoriesData);
        setProducts(productsData);
      } catch (err) {
        setError(`Error al cargar datos: ${err.message}`);
        console.error("Error en fetchInitialData:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [fetchWithAuth]);

  // Filtrar productos por categoría
  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    
    // Filtrado local para mejor UX
    if (categoryId === "all") {
      fetchAllProducts();
    } else {
      setProducts(prev => prev.filter(product => product.category === categoryId));
    }
  }, [fetchAllProducts]);

  // Eliminar producto
  const deleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await fetchWithAuth(`/api/products/myProduct/${productId}`, { method: "DELETE" });
      
      // Actualizar estado y mostrar mensaje
      setSuccessMessage("Producto eliminado correctamente");
      setProducts(products.filter((p) => p._id !== productId));
      
      // Limpiar mensaje después de un tiempo
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(`Error al eliminar producto: ${err.message}`);
    }
  };

  // Formatear ingredientes para API
  const formatIngredients = (ingredients) => {
    if (Array.isArray(ingredients)) return ingredients;
    return ingredients.split(",").map(i => i.trim()).filter(i => i !== "");
  };

  // Crear producto
  const createProduct = async () => {
    if (!validateProduct()) return;

    try {
      const productData = {
        ...newProduct,
        ingredients: formatIngredients(newProduct.ingredients)
      };

      await fetchWithAuth("/api/products/myProduct", {
        method: "POST",
        body: JSON.stringify(productData)
      });

      setSuccessMessage("Producto creado correctamente");
      await fetchAllProducts();
      closeModal();
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(`Error al crear producto: ${err.message}`);
    }
  };

  // Actualizar producto
  const updateProduct = async () => {
    if (!validateProduct() || !editingProduct) return;

    try {
      const productId = editingProduct._id;
      const productData = {
        ...newProduct,
        ingredients: formatIngredients(newProduct.ingredients)
      };

      await fetchWithAuth(`/api/products/myProduct/${productId}`, {
        method: "PUT",
        body: JSON.stringify(productData)
      });

      setSuccessMessage("Producto actualizado correctamente");
      await fetchAllProducts();
      closeModal();
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(`Error al actualizar producto: ${err.message}`);
    }
  };

  // Subir imagen a Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setImageUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }
      
      const data = await response.json();
      
      // Actualizar el newProduct con la URL de la imagen
      setNewProduct(prevData => ({
        ...prevData,
        image: data.secure_url
      }));
      
    } catch (err) {
      setError("Error al subir la imagen: " + err.message);
    } finally {
      setImageUploading(false);
    }
  };

  // Abrir modal
  const openModal = (product = null) => {
    if (product) {
      const productForEdit = {
        ...product,
        ingredients: Array.isArray(product.ingredients)
          ? product.ingredients.join(", ")
          : product.ingredients
      };
      setEditingProduct(product);
      setNewProduct(productForEdit);
    } else {
      setEditingProduct(null);
      setNewProduct(getEmptyProduct());
    }
    setIsModalOpen(true);
    setError("");
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setNewProduct(getEmptyProduct());
    setError("");
  };

  // Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingProduct) {
      await updateProduct();
    } else {
      await createProduct();
    }
  };

  // Obtener nombre de categoría por ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category?.name || "Desconocida";
  };

  return (
    <div className="products-container">
      {/* Título y Mensajes */}
      <header className="products-header">
        <h1 className="products-title">Gestión de Productos</h1>
        
        {/* Mensajes de notificación */}
        {successMessage && (
          <div className="notification success">
            {successMessage}
            <button className="close-btn" onClick={() => setSuccessMessage("")}>×</button>
          </div>
        )}
        
        {error && (
          <div className="notification error">
            {error}
            <button className="close-btn" onClick={() => setError("")}>×</button>
          </div>
        )}
      </header>
      
      {/* Barra de herramientas */}
      {!loading && (
        <div className="products-toolbar">
          <button onClick={() => openModal()} className="add-product-btn">
            <span className="btn-icon">+</span> Agregar Producto
          </button>
          
          <div className="category-filter">
            <select 
              className="category-select"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      {/* Estado de carga */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando productos...</p>
        </div>
      )}
      
      {/* Grid de productos */}
      {!loading && (
        <div className="products-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <article key={product._id} className="product-item">
                <div className="product-image-wrapper">
                  <img src={product.image} alt={product.name} />
                  <span className={`product-badge ${product.availability ? 'available' : 'unavailable'}`}>
                    {product.availability ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
                
                <div className="product-info">
                  <h2 className="product-name">{product.name}</h2>
                  <div className="product-category">{getCategoryName(product.category)}</div>
                  <p className="product-description">{product.description}</p>
                  
                  <div className="product-price">
                    <div className="price-tag">
                      <span className="price-label">Precio</span>
                      <span className="price-value">${Number(product.salePrice).toFixed(2)} {product.currency}</span>
                    </div>
                    <div className="cost-tag">
                      <span className="cost-label">Costo</span>
                      <span className="cost-value">${Number(product.costPrice).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {product.ingredients && product.ingredients.length > 0 && (
                    <div className="product-ingredients">
                      <h3>Ingredientes</h3>
                      <div className="ingredients-tags">
                        {Array.isArray(product.ingredients) 
                          ? product.ingredients.map((ingredient, index) => (
                              <span key={index} className="ingredient-tag">{ingredient}</span>
                            ))
                          : <span className="ingredient-tag">{product.ingredients}</span>
                        }
                      </div>
                    </div>
                  )}
                  
                  <div className="product-actions">
                    <button onClick={() => openModal(product)} className="edit-btn">
                      Editar
                    </button>
                    <button onClick={() => deleteProduct(product._id)} className="delete-btn">
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="no-products">
              <p>No hay productos disponibles en esta categoría</p>
            </div>
          )}
        </div>
      )}
      
      {/* Modal para crear/editar producto */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={(e) => {
          if (e.target.className === 'modal-backdrop') closeModal();
        }}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingProduct ? "Editar Producto" : "Crear Producto"}</h2>
              <button onClick={closeModal} className="close-modal-btn">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="product-form">
              {error && <div className="form-error">{error}</div>}
              
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="name">Nombre</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Nombre del producto"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="description">Descripción</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe tu producto..."
                    value={newProduct.description}
                    onChange={handleInputChange}
                    rows="3"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="category">Categoría</label>
                  <select
                    id="category"
                    name="category"
                    value={newProduct.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="image-row">
                <div className="image-upload">
                  <label>Imagen del producto</label>
                  <div className="image-upload-button">
                    <input
                      type="file"
                      id="imageUpload"
                      name="imageUpload"
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                    <label htmlFor="imageUpload" className={imageUploading ? 'uploading' : ''}>
                      {imageUploading ? 'Subiendo...' : 'Seleccionar imagen'}
                    </label>
                  </div>
                  
                  {newProduct.image && (
                    <div className="image-preview-container">
                      <img src={newProduct.image} alt="Vista previa" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-row prices-row">
                <div className="form-field">
                  <label htmlFor="costPrice">Precio de costo</label>
                  <div className="price-input-wrapper">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      id="costPrice"
                      name="costPrice"
                      placeholder="0.00"
                      value={newProduct.costPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-field">
                  <label htmlFor="salePrice">Precio de venta</label>
                  <div className="price-input-wrapper">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      id="salePrice"
                      name="salePrice"
                      placeholder="0.00"
                      value={newProduct.salePrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="ingredients">Ingredientes (separados por comas)</label>
                  <input
                    type="text"
                    id="ingredients"
                    name="ingredients"
                    placeholder="Ej: Harina, Azúcar, Sal"
                    value={newProduct.ingredients}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-field">
                  <div className="availability-field">
                    <label className="availability-label">
                      <input
                        type="checkbox"
                        name="availability"
                        checked={newProduct.availability}
                        onChange={handleInputChange}
                      />
                      <span className="checkbox-text">Producto disponible</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="form-buttons">
                <button type="button" onClick={closeModal} className="cancel-button">
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  {editingProduct ? "Actualizar" : "Crear"} Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;