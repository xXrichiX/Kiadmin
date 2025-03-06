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

  /////////////////// OBTENER DATOS (CATEGORÍAS) ///////////////////
  useEffect(() => {
    const fetchCategories = async () => {
      try {
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

    fetchCategories();
  }, [API_URL, navigate]);

  /////////////////// VALIDAR CATEGORÍA ///////////////////
  const validateCategory = () => {
    if (!name.trim() || !description.trim()) {
      setError("Por favor, completa todos los campos requeridos.");
      return false;
    }
    setError("");
    return true;
  };

  /////////////////// ORDENAR CATEGORÍAS ///////////////////
  const sortCategories = (order) => {
    let sortedCategories = [...categories];
    switch (order) {
      case "first":
        sortedCategories.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "last":
        sortedCategories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "alphabetical":
        sortedCategories.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return sortedCategories;
  };

  /////////////////// ELIMINAR CATEGORÍA ///////////////////
  const deleteCategory = async (categoryId) => {
    try {
      await fetchAPI("/api/categories/myCategory", "DELETE", { categoryId });

      // Actualizar el estado localmente después de eliminar
      setCategories((prev) => prev.filter((c) => c._id !== categoryId));
      setProducts((prev) => prev.filter((p) => p.category !== categoryId));
    } catch (err) {
      setError(`Error eliminando categoría ID ${categoryId}: ${err.message}`);
      console.error("Detalles completos:", err);
    }
  };

  /////////////////// EDITAR CATEGORÍA ///////////////////
  const editCategory = (category) => {
    setEditingCategoryId(category._id);
    setName(category.name);
    setDescription(category.description);
    setIsEditing(true);
    setError("");
  };

  /////////////////// ACTUALIZAR CATEGORÍA ///////////////////
  const updateCategory = async () => {
    if (!validateCategory()) return;

    try {
      const updatedCategory = await fetchAPI("/api/categories/myCategory", "PUT", {
        categoryId: editingCategoryId,
        name,
        description,
      });

      // Actualizar el estado localmente con la respuesta
      setCategories(
        categories.map((category) =>
          category._id === editingCategoryId ? updatedCategory : category
        )
      );

      // Limpiar formulario y estados
      setIsEditing(false);
      setName("");
      setDescription("");
    } catch (err) {
      setError(`Error al actualizar la categoría: ${err.message}`);
    }
  };

  /////////////////// CREAR CATEGORÍA ///////////////////
  const createCategory = async () => {
    if (!validateCategory()) return;

    try {
      const newCategory = await fetchAPI("/api/categories/myCategory", "POST", {
        name,
        description,
      });

      // Añadir la nueva categoría al estado
      setCategories([...categories, newCategory]);

      // Limpiar formulario y estados
      setIsCreating(false);
      setName("");
      setDescription("");
    } catch (err) {
      setError(`Error al crear la categoría: ${err.message}`);
    }
  };

  /////////////////// CANCELAR (CREACIÓN/EDICIÓN) ///////////////////
  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setName("");
    setDescription("");
    setError("");
  };

  /////////////////// CATEGORÍAS ORDENADAS ///////////////////
  const sortedCategories = sortCategories(sortOrder);

  /////////////////// RENDERIZADO ///////////////////
  return (
    <div className="categories-page">
      {loading ? (
        <div className="loading-overlay">
          <p>Cargando...</p>
        </div>
      ) : (
        <>
          <h2 className="page-title">Gestión de Categorías</h2>
          {error && <p className="error-message">{error}</p>}

          {/* Botón para crear una nueva categoría */}
          <button
            onClick={() => {
              setIsCreating(true);
              setName("");
              setDescription("");
            }}
            className="create-category-btn"
          >
            Crear Nueva Categoría
          </button>

          {/* Selector para ordenar categorías */}
          <div className="sort-filter">
            <label>Ordenar por:</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="default">Predeterminado</option>
              <option value="first">Primera creada</option>
              <option value="last">Última creada</option>
              <option value="alphabetical">Orden alfabético</option>
            </select>
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
                  onChange={(e) => setName(e.target.value)}
                />
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
                <div key={category._id} className="category-card">
                  <h3 onClick={() => setSelectedCategory(category._id)}>
                    {category.name}
                  </h3>
                  <p className="category-description">{category.description}</p>
                  <p className="category-id">ID: {category._id}</p>
                  <div className="category-actions">
                    <button onClick={() => editCategory(category)}>✏️ Editar</button>
                    <button
                      onClick={() => deleteCategory(category._id)}
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
              {products
                .filter((product) => product.category === selectedCategory)
                .map((product) => (
                  <div key={product._id} className="product-card">
                    <img src={product.image} alt={product.name} className="product-image" />
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <p>💰 Costo: ${product.costPrice}</p>
                    <p>🏷 Venta: ${product.salePrice}</p>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CategoriesPage;