import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/CategoriesPage.css";

const CategoriesPage = () => {
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
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const categoriesResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/categories/mineCategory`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!categoriesResponse.ok) {
          throw new Error(`Error al obtener categorías: ${categoriesResponse.status}`);
        }

        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const validateCategory = () => {
    if (!name.trim() || !description.trim()) {
      setError("Por favor, completa todos los campos requeridos.");
      return false;
    }
    setError("");
    return true;
  };

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

  const deleteCategory = async (categoryId) => {
    try {
      const token = Cookies.get("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/categories/myCategory`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ categoryId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar la categoría");
      }

      setCategories((prev) => prev.filter((c) => c._id !== categoryId));
      setProducts((prev) => prev.filter((p) => p.category !== categoryId));
    } catch (err) {
      setError(`Error eliminando categoría ID ${categoryId}: ${err.message}`);
      console.error("Detalles completos:", err);
    }
  };

  const editCategory = (category) => {
    setEditingCategoryId(category._id);
    setName(category.name);
    setDescription(category.description);
    setIsEditing(true);
    setError("");
  };

  const updateCategory = async () => {
    if (!validateCategory()) return;
    try {
      const token = Cookies.get("authToken");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/categories/myCategory`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            categoryId: editingCategoryId,
            name,
            description,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar la categoría");
      }

      const updatedCategory = await response.json();
      setCategories(
        categories.map((category) =>
          category._id === editingCategoryId ? updatedCategory : category
        )
      );
      setIsEditing(false);
      setName("");
      setDescription("");
    } catch (err) {
      setError("Error al actualizar: " + err.message);
    }
  };

  const createCategory = async () => {
    if (!validateCategory()) return;
    try {
      const token = Cookies.get("authToken");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/categories/myCategory`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la categoría");
      }

      const createdCategory = await response.json();
      setCategories([...categories, createdCategory]);
      setIsCreating(false);
      setName("");
      setDescription("");
    } catch (err) {
      setError("Error al crear la categoría: " + err.message);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setName("");
    setDescription("");
    setError("");
  };

  const sortedCategories = sortCategories(sortOrder);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : [];

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

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

          <div className="sort-filter">
            <label>Ordenar por:</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="default">Predeterminado</option>
              <option value="first">Primera creada</option>
              <option value="last">Última creada</option>
              <option value="alphabetical">Orden alfabético</option>
            </select>
          </div>

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

          {selectedCategory && (
            <div className="products-list">
              <h3>Productos de la categoría seleccionada:</h3>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
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
        </>
      )}
    </div>
  );
};

export default CategoriesPage;