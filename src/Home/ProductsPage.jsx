import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/ProductsPage.css";

const ProductsPage = () => {
  /////////////////// ESTADOS ///////////////////
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [sortOrder, setSortOrder] = useState("default");
  const [currentTab, setCurrentTab] = useState("basic"); // Para la navegación por pestañas
  
  // Datos del formulario de producto
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    costPrice: "",
    salePrice: "",
    category: "",
    ingredients: "",
    availability: true,
    currency: "MXN"
  });

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

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

  /////////////////// OBTENER DATOS (PRODUCTOS Y CATEGORÍAS) ///////////////////
  const fetchAllProducts = async () => {
    try {
      const data = await fetchAPI("/api/products/mineProducts");
      if (data) {
        setProducts(data);
      }
      setLoading(false);
      return data;
    } catch (err) {
      setError(`Error al obtener productos: ${err.message}`);
      setLoading(false);
      return [];
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Obtener datos en paralelo para mejor rendimiento
        const [categoriesData, productsData] = await Promise.all([
          fetchAPI("/api/categories/mineCategory"),
          fetchAPI("/api/products/mineProducts")
        ]);
        
        setCategories(categoriesData);
        setProducts(productsData);
        setLoading(false);
      } catch (err) {
        setError(`Error al cargar datos: ${err.message}`);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  /////////////////// FILTRAR PRODUCTOS POR CATEGORÍA ///////////////////
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    
    if (categoryId === "all") {
      fetchAllProducts();
    } else {
      // Filtramos localmente para mejor UX
      setProducts(prev => prev.filter(product => product.category === categoryId));
    }
  };

  /////////////////// ORDENAR PRODUCTOS ///////////////////
  const sortProducts = (order) => {
    let sortedProducts = [...products];
    switch (order) {
      case "price_low":
        sortedProducts.sort((a, b) => parseFloat(a.salePrice) - parseFloat(b.salePrice));
        break;
      case "price_high":
        sortedProducts.sort((a, b) => parseFloat(b.salePrice) - parseFloat(a.salePrice));
        break;
      case "alphabetical":
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }
    return sortedProducts;
  };

  /////////////////// VALIDAR PRODUCTO ///////////////////
  const validateProduct = () => {
    const requiredFields = [
      { field: 'name', message: 'El nombre es obligatorio' },
      { field: 'description', message: 'La descripción es obligatoria' },
      { field: 'costPrice', message: 'El precio de costo es obligatorio' },
      { field: 'salePrice', message: 'El precio de venta es obligatorio' },
      { field: 'category', message: 'La categoría es obligatoria' }
    ];

    for (const { field, message } of requiredFields) {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        setError(message);
        return false;
      }
    }

    setError("");
    return true;
  };

  /////////////////// CREAR PRODUCTO ///////////////////
  const createProduct = async () => {
    if (!validateProduct()) return;

    try {
      // Formatear ingredientes si es necesario
      const productData = {
        ...formData,
        ingredients: Array.isArray(formData.ingredients) 
          ? formData.ingredients 
          : formData.ingredients.split(",").map(i => i.trim()).filter(i => i !== "")
      };

      await fetchAPI("/api/products/myProduct", "POST", productData);
      
      setSuccessMessage("Producto creado correctamente");
      await fetchAllProducts();
      
      // Limpiar formulario y estados
      setIsCreating(false);
      resetForm();
      
      // Limpiar mensaje después de un tiempo
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(`Error al crear el producto: ${err.message}`);
    }
  };

  /////////////////// ACTUALIZAR PRODUCTO ///////////////////
  const updateProduct = async () => {
    if (!validateProduct() || !editingProductId) return;

    try {
      // Formatear ingredientes
      const productData = {
        ...formData,
        ingredients: Array.isArray(formData.ingredients) 
          ? formData.ingredients 
          : formData.ingredients.split(",").map(i => i.trim()).filter(i => i !== "")
      };

      await fetchAPI(`/api/products/myProduct/${editingProductId}`, "PUT", productData);
      
      setSuccessMessage("Producto actualizado correctamente");
      await fetchAllProducts();
      
      // Limpiar formulario y estados
      setIsEditing(false);
      setEditingProductId(null);
      resetForm();
      
      // Limpiar mensaje después de un tiempo
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(`Error al actualizar el producto: ${err.message}`);
    }
  };

  /////////////////// ELIMINAR PRODUCTO ///////////////////
  const deleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await fetchAPI(`/api/products/myProduct/${productId}`, "DELETE");
      
      // Actualizar estado y mostrar mensaje
      setSuccessMessage("Producto eliminado correctamente");
      setProducts(products.filter((p) => p._id !== productId));
      
      // Limpiar mensaje después de un tiempo
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(`Error al eliminar producto: ${err.message}`);
    }
  };

  /////////////////// EDITAR PRODUCTO ///////////////////
  const editProduct = (product) => {
    setEditingProductId(product._id);
    setFormData({
      ...product,
      ingredients: Array.isArray(product.ingredients)
        ? product.ingredients.join(", ")
        : product.ingredients
    });
    setIsEditing(true);
    setIsCreating(false);
    setError("");
    setCurrentTab("basic");
  };

  /////////////////// RESET FORMULARIO ///////////////////
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      costPrice: "",
      salePrice: "",
      category: "",
      ingredients: "",
      availability: true,
      currency: "MXN"
    });
  };

  /////////////////// CANCELAR (CREACIÓN/EDICIÓN) ///////////////////
  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditingProductId(null);
    resetForm();
    setError("");
  };

  /////////////////// MANEJAR CAMBIOS EN INPUTS ///////////////////
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
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

  /////////////////// MANEJAR ENVÍO DEL FORMULARIO ///////////////////
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await updateProduct();
    } else {
      await createProduct();
    }
  };

  /////////////////// OBTENER NOMBRE DE CATEGORÍA POR ID ///////////////////
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category?.name || "Desconocida";
  };

  /////////////////// PRODUCTOS ORDENADOS ///////////////////
  const sortedProducts = sortProducts(sortOrder);

  /////////////////// RENDERIZADO DE FORMULARIO POR PESTAÑAS ///////////////////
  const renderFormContent = () => {
    switch(currentTab) {
      case "basic":
        return (
          <div className="tab-content69">
            <div className="form-grid69">
              <div className="form-group69">
                <label>Nombre:</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre del producto"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group69">
                <label>Categoría:</label>
                <select
                  name="category"
                  value={formData.category}
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
              
              <div className="form-group69 full-width69">
                <label>Descripción:</label>
                <textarea
                  name="description"
                  placeholder="Descripción del producto"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-group69">
                <label>Precio de costo:</label>
                <input
                  type="number"
                  name="costPrice"
                  placeholder="0.00"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group69">
                <label>Precio de venta:</label>
                <input
                  type="number"
                  name="salePrice"
                  placeholder="0.00"
                  value={formData.salePrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group69 checkbox69">
                <label>
                  <input
                    type="checkbox"
                    name="availability"
                    checked={formData.availability}
                    onChange={handleInputChange}
                  />
                  Disponible
                </label>
              </div>
            </div>
          </div>
        );
      case "details":
        return (
          <div className="tab-content69">
            <div className="form-group69">
              <label>Ingredientes (separados por comas):</label>
              <input
                type="text"
                name="ingredients"
                placeholder="Ingrediente1, Ingrediente2, ..."
                value={formData.ingredients}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group69">
              <label>Imagen:</label>
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
              />
              {imageUploading && <p>Subiendo imagen...</p>}
              {formData.image && (
                <div className="image-preview69">
                  <img 
                    src={formData.image} 
                    alt="Vista previa" 
                    style={{ maxWidth: '200px', maxHeight: '200px' }} 
                  />
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  /////////////////// RENDERIZADO ///////////////////
  return (
    <div className="products-page69">
      {loading && (
        <div className="loading-container69">
          <div className="loading-spinner69"></div>
          <p>Cargando productos...</p>
        </div>
      )}
      {!loading && (
        <>
          <h2 className="page-title69">Gestión de Productos</h2>
          
          {/* Mensajes */}
          {error && <p className="error-message69">{error}</p>}
          {successMessage && <p className="success-message69">{successMessage}</p>}

          {/* Barra de herramientas */}
          <div className="toolbar69">
            {/* Botón para crear un nuevo producto */}
            <button
              onClick={() => {
                setIsCreating(true);
                setIsEditing(false);
                setEditingProductId(null);
                resetForm();
                setError("");
                setCurrentTab("basic");
              }}
              className="create-product-btn69"
            >
              Crear Nuevo Producto
            </button>

            {/* Filtro por categoría */}
            <div className="category-filter69">
              <label>Filtrar por categoría:</label>
              <select 
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

            {/* Selector para ordenar productos */}
            <div className="sort-filter69">
              <label>Ordenar por:</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="default">Predeterminado</option>
                <option value="price_low">Precio (menor a mayor)</option>
                <option value="price_high">Precio (mayor a menor)</option>
                <option value="alphabetical">Orden alfabético</option>
                <option value="newest">Más recientes</option>
              </select>
            </div>
          </div>

          {/* Modal para crear o editar productos */}
          {(isCreating || isEditing) && (
            <div className="modal-overlay69">
              <div className="modal-content69 compact-modal69">
                <h3>{isEditing ? "Editar Producto" : "Crear Nuevo Producto"}</h3>
                
                {/* Pestañas de navegación */}
                <div className="tabs-container69">
                  <div 
                    className={`tab69 ${currentTab === "basic" ? "active69" : ""}`}
                    onClick={() => setCurrentTab("basic")}
                  >
                    Información Básica
                  </div>
                  <div 
                    className={`tab69 ${currentTab === "details" ? "active69" : ""}`}
                    onClick={() => setCurrentTab("details")}
                  >
                    Detalles y Multimedia
                  </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                  {renderFormContent()}
                  
                  <div className="modal-buttons69">
                    <button type="submit">{isEditing ? "Actualizar" : "Crear"}</button>
                    <button type="button" onClick={handleCancel}>Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Grid de productos */}
          <div className="products-grid69">
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product) => (
                <div key={product._id} className="product-card69">
                  <div className="product-image-container69">
                    <img src={product.image} alt={product.name} />
                    <span className={`availability-badge69 ${product.availability ? 'available69' : 'unavailable69'}`}>
                      {product.availability ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                  
                  <div className="product-details69">
                    <h3>{product.name}</h3>
                    <span className="category-name69">{getCategoryName(product.category)}</span>
                    <p className="product-description69">{product.description}</p>
                    
                    <div className="product-prices69">
                      <div className="price-container69">
                        <span className="price-label69">Costo:</span>
                        <span className="price-value69">${Number(product.costPrice).toFixed(2)}</span>
                      </div>
                      <div className="price-container69">
                        <span className="price-label69">Venta:</span>
                        <span className="price-value69">${Number(product.salePrice).toFixed(2)} {product.currency}</span>
                      </div>
                    </div>
                    
                    {product.ingredients && product.ingredients.length > 0 && (
                      <div className="ingredients-container69">
                        <span className="ingredients-label69">Ingredientes:</span>
                        <div className="ingredients-list69">
                          {Array.isArray(product.ingredients) 
                            ? product.ingredients.map((ingredient, index) => (
                                <span key={index} className="ingredient-tag69">{ingredient}</span>
                              ))
                            : <span className="ingredient-tag69">{product.ingredients}</span>
                          }
                        </div>
                      </div>
                    )}
                    
                    <div className="product-actions69">
                      <button onClick={() => editProduct(product)} className="edit-btn69">
                        Editar
                      </button>
                      <button onClick={() => deleteProduct(product._id)} className="delete-btn69">
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-products-message69">No hay productos disponibles</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductsPage;