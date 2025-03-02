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
<<<<<<< HEAD
=======
  
  const baseUrl = "https://orderandout-refactor.onrender.com";
>>>>>>> 3218539 (error 403)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

<<<<<<< HEAD
        const categoriesResponse = await fetch("https://orderandout-refactor.onrender.com/api/categories/mineCategory", {
=======
        // Corrección: Endpoint para obtener todas las categorías del restaurante
        const categoriesResponse = await fetch(`${baseUrl}/api/categories/mineCategory`, {
          method: "GET",
>>>>>>> 3218539 (error 403)
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!categoriesResponse.ok) {
          throw new Error(`Error categorías: ${categoriesResponse.status}`);
        }
        
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

<<<<<<< HEAD
=======
        // Mantener la URL original para productos como estaba
>>>>>>> 3218539 (error 403)
        const productsResponse = await fetch("https://orderandout.onrender.com/api/intern/products/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!productsResponse.ok) {
          throw new Error(`Error productos: ${productsResponse.status}`);
        }
        
        const productsData = await productsResponse.json();
        setProducts(productsData);
<<<<<<< HEAD
=======
        setLoading(false);
>>>>>>> 3218539 (error 403)
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

<<<<<<< HEAD
      const response = await fetch(`https://orderandout-refactor.onrender.com/api/categories/myCategory/${categoryId}`, {
=======
      // Corrección: Endpoint para eliminar una categoría
      const response = await fetch(`${baseUrl}/api/categories/myCategory`, {
>>>>>>> 3218539 (error 403)
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
<<<<<<< HEAD
        }
=======
        },
        body: JSON.stringify({ categoryId }) // Enviar el ID en el body como se requiere
>>>>>>> 3218539 (error 403)
      });

      // Manejar respuesta no-JSON
      const text = await response.text();
      let errorMessage = `Error ${response.status}`;
      
      try {
        const data = text ? JSON.parse(text) : {};
        errorMessage = data.message || errorMessage;
      } catch {
        errorMessage = text || errorMessage;
      }

      if (!response.ok) {
        throw new Error(errorMessage);
      }

      // Actualización optimista
      setCategories(prev => prev.filter(c => c._id !== categoryId));
      setProducts(prev => prev.filter(p => p.category !== categoryId));

    } catch (err) {
      setError(`Error eliminando categoría ID ${categoryId}: ${err.message}`);
<<<<<<< HEAD
      console.error("Detalles completos:", {
        status: response?.status,
        headers: response?.headers,
        responseText: text,
        error: err.stack
      });
=======
      console.error("Detalles completos:", err);
>>>>>>> 3218539 (error 403)
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
<<<<<<< HEAD
      const response = await fetch(`https://orderandout-refactor.onrender.com/api/categories/myCategory/${editingCategoryId}`, {
=======
      
      // Corrección: Endpoint para actualizar una categoría
      const response = await fetch(`${baseUrl}/api/categories/myCategory`, {
>>>>>>> 3218539 (error 403)
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
<<<<<<< HEAD
=======
          categoryId: editingCategoryId, // Añadir categoryId en el body
>>>>>>> 3218539 (error 403)
          name, 
          description 
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar");
      }

      setCategories(categories.map((category) => 
        category._id === editingCategoryId ? { ...category, name, description } : category
      ));
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
<<<<<<< HEAD
      const response = await fetch("https://orderandout-refactor.onrender.com/api/categories/myCategory", {
=======
      
      // Corrección: Endpoint para crear una categoría
      const response = await fetch(`${baseUrl}/api/categories/myCategory`, {
>>>>>>> 3218539 (error 403)
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          name, 
          description 
        })
      });
<<<<<<< HEAD
=======
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la categoría");
      }
      
>>>>>>> 3218539 (error 403)
      const createdCategory = await response.json();
      setCategories([...categories, createdCategory]);
      setIsCreating(false);
      setName("");
      setDescription("");
    } catch (err) {
<<<<<<< HEAD
      setError("Error al crear la categoría");
=======
      setError("Error al crear la categoría: " + err.message);
>>>>>>> 3218539 (error 403)
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
<<<<<<< HEAD
=======
  
  // Calcular productos filtrados por categoría seleccionada
  const filteredProducts = selectedCategory 
    ? products.filter(product => product.category === selectedCategory)
    : [];
>>>>>>> 3218539 (error 403)

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
        </>
      )}
    </div>
  );
};

export default CategoriesPage;