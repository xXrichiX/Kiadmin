import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/CategoriesPage.css";

const CategoriesPage = () => {
  /////////////////// ESTADOS ///////////////////
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("default");
  const [nameError, setNameError] = useState("");
  
  // Nuevos estados para el diálogo de confirmación de eliminación
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const navigate = useNavigate();
  // URL base fija para garantizar que todas las solicitudes usen la URL correcta
  const API_URL = import.meta.env.VITE_API_URL; // Obtener la URL de la API desde las variables de entorno

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
  const validateCategoryName = (catName) => {
    // Verificar que el nombre no esté repetido
    const nameExists = categories.some(
      (category) => 
        category.name.toLowerCase() === catName.toLowerCase() && 
        (isEditing ? category._id !== editingCategoryId : true)
    );
    
    if (nameExists) {
      return "Ya existe una categoría con este nombre. Por favor, elija otro nombre.";
    }
    
    return "";
  };

  /////////////////// OBTENER DATOS (CATEGORÍAS) ///////////////////
  const fetchAllCategories = async () => {
    try {
      // Actualizado: Uso del endpoint correcto para obtener todas las categorías
      const data = await fetchAPI("/api/categories/mineCategory");
      if (data) {
        setCategories(data);
      }
      setLoading(false);
    } catch (err) {
      setError(`Error al obtener categorías: ${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  /////////////////// OBTENER PRODUCTOS POR CATEGORÍA ///////////////////
  useEffect(() => {
    if (selectedCategory) {
      const fetchProductsByCategory = async () => {
        try {
          const data = await fetchAPI(`/api/products/byCategory/${selectedCategory}`);
          if (data) {
            setProducts(data);
          }
        } catch (err) {
          setError(`Error al obtener productos: ${err.message}`);
        }
      };

      fetchProductsByCategory();
    }
  }, [selectedCategory]);

  /////////////////// VALIDAR CATEGORÍA ///////////////////
  const validateCategory = () => {
    // Limpiar errores previos
    setError("");
    setNameError("");
    
    // Validar campos requeridos
    if (!name.trim() || !description.trim()) {
      setError("Por favor, completa todos los campos requeridos.");
      return false;
    }
    
    // Validar nombre único
    const nameValidationError = validateCategoryName(name);
    if (nameValidationError) {
      setNameError(nameValidationError);
      return false;
    }
    
    return true;
  };

  /////////////////// ORDENAR CATEGORÍAS ///////////////////
  const getSortedCategories = () => {
    // Crear una copia para no modificar el array original
    const sortedCategories = [...categories];
    
    // Verificar que haya categorías para ordenar
    if (sortedCategories.length === 0) {
      return [];
    }
    
    switch (sortOrder) {
      case "alphabetical":
        // Ordenar alfabéticamente por nombre (case-insensitive)
        return sortedCategories.sort((a, b) => 
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
      case "newest":
        // Ordenar por fecha de creación (más recientes primero)
        return sortedCategories.sort((a, b) => {
          // Asegurarse de que ambos elementos tengan createdAt y sean fechas válidas
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      case "oldest":
        // Ordenar por fecha de creación (más antiguas primero)
        return sortedCategories.sort((a, b) => {
          // Asegurarse de que ambos elementos tengan createdAt y sean fechas válidas
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
      default:
        // No hacer nada, mantener el orden original
        return sortedCategories;
    }
  };

  /////////////////// FUNCIONES PARA ELIMINAR CATEGORÍA ///////////////////
  // Función para mostrar la confirmación de eliminación
  const confirmDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setShowDeleteConfirmation(true);
  };

  // Función para cancelar la eliminación
  const cancelDelete = () => {
    setCategoryToDelete(null);
    setShowDeleteConfirmation(false);
  };

  // Función para manejar la eliminación después de confirmar
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      // Usar el endpoint para eliminar una categoría
      await fetchAPI(`/api/categories/myCategory/${categoryToDelete._id}`, "DELETE");

      // Actualizar el estado local después de eliminar
      setCategories((prev) => prev.filter((c) => c._id !== categoryToDelete._id));
      setProducts((prev) => prev.filter((p) => p.category !== categoryToDelete._id));
      
      // Si se ha borrado la categoría seleccionada, deseleccionar
      if (selectedCategory === categoryToDelete._id) {
        setSelectedCategory(null);
      }
      
      setError("");
      
      // Cerrar el diálogo de confirmación
      cancelDelete();
    } catch (err) {
      setError(`Error al eliminar la categoría: ${err.message}`);
      cancelDelete();
    }
  };

  /////////////////// EDITAR CATEGORÍA ///////////////////
  const editCategory = (category) => {
    setEditingCategoryId(category._id);
    setName(category.name);
    setDescription(category.description);
    setIsEditing(true);
    setError("");
    setNameError("");
  };

  /////////////////// ACTUALIZAR CATEGORÍA ///////////////////
  const updateCategory = async () => {
    if (!validateCategory()) return;

    try {
      // Actualizado: Uso del endpoint correcto para actualizar una categoría
      const updatedCategory = await fetchAPI(
        `/api/categories/myCategory/${editingCategoryId}`, 
        "PUT", 
        {
          name,
          description
        }
      );

      // Verificar si la respuesta es correcta
      if (updatedCategory) {
        // Refrescar todas las categorías para asegurar que tenemos los datos más actualizados
        await fetchAllCategories();
        
        // Limpiar formulario y estados
        setIsEditing(false);
        setEditingCategoryId(null);
        setName("");
        setDescription("");
        setError("");
        setNameError("");
      } else {
        throw new Error("No se recibió una respuesta válida del servidor");
      }
    } catch (err) {
      setError(`Error al actualizar la categoría: ${err.message}`);
      console.error("Error completo:", err);
    }
  };

  /////////////////// CREAR CATEGORÍA ///////////////////
  const createCategory = async () => {
    if (!validateCategory()) return;

    try {
      // Actualizado: Uso del endpoint correcto para crear una categoría
      const newCategory = await fetchAPI("/api/categories/myCategory", "POST", {
        name,
        description,
      });

      if (newCategory) {
        // Refrescar todas las categorías
        await fetchAllCategories();
        
        // Limpiar formulario y estados
        setIsCreating(false);
        setName("");
        setDescription("");
        setError("");
        setNameError("");
      }
    } catch (err) {
      setError(`Error al crear la categoría: ${err.message}`);
    }
  };

  /////////////////// MANEJAR CAMBIOS EN LOS CAMPOS ///////////////////
  const handleNameChange = (e) => {
    setName(e.target.value);
    setNameError(""); // Limpiar errores al cambiar
  };

  /////////////////// CANCELAR (CREACIÓN/EDICIÓN) ///////////////////
  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditingCategoryId(null);
    setName("");
    setDescription("");
    setError("");
    setNameError("");
  };

  // Obtener las categorías ordenadas según el criterio seleccionado
  const sortedCategories = getSortedCategories();

  /////////////////// RENDERIZADO ///////////////////
  return (
    <div className="categories-page">
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando Categorias...</p>
        </div>
      )}
      {!loading && (
        <>
          <h2 className="page-title">Gestión de Categorías</h2>
          {error && <p className="error-message">{error}</p>}

          {/* Barra de herramientas con filtros */}
          <div className="toolbar25">
            {/* Botón para crear */}
            <button
              onClick={() => {
                setIsCreating(true);
                setIsEditing(false);
                setEditingCategoryId(null);
                setName("");
                setDescription("");
                setError("");
                setNameError("");
              }}
              className="create-kiosk-btn25"
            >
              Crear Nueva Categoría
            </button>
            
            {/* Selector para ordenar categorías */}
            <div className="sort-filter25">
              <label>Ordenar por:</label>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="default">Predeterminado</option>
                <option value="alphabetical">Orden alfabético</option>
                <option value="newest">Más recientes primero</option>
                <option value="oldest">Más antiguos primero</option>
              </select>
            </div>
          </div>

          {/* Modal para crear o editar categorías */}
          {(isCreating || isEditing) && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>{isEditing ? "Editar Categoría" : "Crear Nueva Categoría"}</h3>
                <input
                  type="text"
                  placeholder="Nombre de la categoría"
                  value={name}
                  onChange={handleNameChange}
                  className={nameError ? "input-error" : ""}
                />
                {nameError && <p className="error-message">{nameError}</p>}
                <input
                  type="text"
                  placeholder="Descripción"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="modal-buttons">
                  <button onClick={isEditing ? updateCategory : createCategory}>
                    {isEditing ? "Actualizar" : "Crear"}
                  </button>
                  <button onClick={handleCancel}>Cancelar</button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de categorías */}
          <div className="categories-list horizontal">
            {sortedCategories.length > 0 ? (
              sortedCategories.map((category) => (
                <div 
                  key={category._id} 
                  className={`category-card ${selectedCategory === category._id ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory(category._id)}
                >
                  <h3>{category.name}</h3>
                  <p className="category-description">{category.description}</p>
                  <p className="category-id">ID: {category._id}</p>
                  <div className="category-actions">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Evitar que se seleccione la categoría
                        editCategory(category);
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Evitar que se seleccione la categoría
                        confirmDeleteCategory(category);
                      }}
                      title={`ID: ${category._id}`}
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No hay categorías creadas</p>
            )}
          </div>

          {/* Lista de productos de la categoría seleccionada */}
          {selectedCategory && (
            <div className="products-list">
              <h3>Productos de la categoría seleccionada:</h3>
              {products.length > 0 ? (
                products
                  .filter((product) => product.category === selectedCategory)
                  .map((product) => (
                    <div key={product._id} className="product-card">
                      <img src={product.image} alt={product.name} className="product-image" />
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <p>💰 Costo: ${product.costPrice}</p>
                      <p>🏷 Venta: ${product.salePrice}</p>
                    </div>
                  ))
              ) : (
                <p>No hay productos en esta categoría</p>
              )}
            </div>
          )}
          
          {/* Modal de confirmación de eliminación */}
          {showDeleteConfirmation && categoryToDelete && (
            <div className="modal-overlay25">
              <div className="modal-content25 delete-confirmation-modal25">
                <h3>Confirmar Eliminación</h3>
                <p>¿Está seguro que desea eliminar la categoría "{categoryToDelete.name}"?</p>
                <p className="warning-text25">Esta acción no se puede deshacer.</p>
                
                <div className="modal-buttons25">
                  <button 
                    onClick={handleDeleteCategory} 
                    className="delete-confirm-btn25"
                  >
                    Sí, Eliminar
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="cancel-btn25"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CategoriesPage;