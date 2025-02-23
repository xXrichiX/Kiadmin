import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/CategoriesPage.css";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Modal de edición
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("default");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const categoriesResponse = await fetch("https://orderandout.onrender.com/api/intern/categories/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        const productsResponse = await fetch("https://orderandout.onrender.com/api/intern/products/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const productsData = await productsResponse.json();
        setProducts(productsData);
      } catch (err) {
        setError(err.message);
      } finally {
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
      await fetch(`https://orderandout.onrender.com/api/intern/categories/${categoryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.filter((category) => category._id !== categoryId));
      setProducts(products.filter((product) => product.category !== categoryId));
    } catch (err) {
      setError("Error al eliminar la categoría");
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
      const response = await fetch(`https://orderandout.onrender.com/api/intern/categories/${editingCategoryId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });
      const updatedCategory = await response.json();
      setCategories(categories.map((category) => (category._id === updatedCategory._id ? updatedCategory : category)));
      setIsEditing(false);
      setName("");
      setDescription("");
    } catch (err) {
      setError("Error al actualizar la categoría");
    }
  };

  const createCategory = async () => {
    if (!validateCategory()) return;
    try {
      const token = Cookies.get("authToken");
      const response = await fetch("https://orderandout.onrender.com/api/intern/categories", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });
      const createdCategory = await response.json();
      setCategories([...categories, createdCategory]);
      setIsCreating(false);
      setName("");
      setDescription("");
    } catch (err) {
      setError("Error al crear la categoría");
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

  return (
    <div className="categories-page">
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

      {isCreating && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Crear Nueva Categoría</h3>
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
              <button onClick={createCategory}>Crear</button>
              <button onClick={handleCancel}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Categoría</h3>
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
              <button onClick={updateCategory}>Actualizar</button>
              <button onClick={handleCancel}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="categories-list horizontal">
        {loading ? (
          <p>Cargando...</p>
        ) : sortedCategories.length > 0 ? (
          sortedCategories.map((category) => (
            <div key={category._id} className="category-card">
              <h3 onClick={() => setSelectedCategory(category._id)}>{category.name}</h3>
              <p>{category.description}</p>
              <button onClick={() => editCategory(category)}>✏️ Editar</button>
              <button onClick={() => deleteCategory(category._id)}>🗑 Eliminar</button>
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
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
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
    </div>
  );
};

export default CategoriesPage;