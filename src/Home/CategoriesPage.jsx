import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/CategoriesPage.css";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
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
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const productsResponse = await fetch("https://orderandout.onrender.com/api/intern/products/mine", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const categoriesData = await categoriesResponse.json();
        const productsData = await productsResponse.json();

        setCategories(categoriesData);
        setProducts(productsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSaveCategory = async () => {
    try {
      const token = Cookies.get("authToken");
      const url = editingCategory 
        ? `https://orderandout.onrender.com/api/intern/categories/${editingCategory}` 
        : "https://orderandout.onrender.com/api/intern/categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, description })
      });
      const newCategory = await response.json();

      if (editingCategory) {
        setCategories(categories.map(category => category._id === editingCategory ? newCategory : category));
      } else {
        setCategories([...categories, newCategory]);
      }

      setName("");
      setDescription("");
      setShowForm(false);
      setEditingCategory(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const token = Cookies.get("authToken");
      await fetch(`https://orderandout.onrender.com/api/intern/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      setCategories(categories.filter(category => category._id !== categoryId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category._id);
    setName(category.name);
    setDescription(category.description);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setShowForm(false);
  };

  const filteredProducts = selectedCategory
    ? products.filter(product => product.category === selectedCategory)
    : [];

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="categories-page">
      <h2>Gestión de Categorías</h2>
      {error && <p className="error-message">{error}</p>}

      <button onClick={() => setShowForm(true)}>Agregar Categoría</button>
      {showForm && (
        <div className="category-form">
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
          <button onClick={handleSaveCategory}>{editingCategory ? "Actualizar" : "Guardar"}</button>
          <button onClick={handleCancel}>Cancelar</button>
        </div>
      )}

      <div className="categories-list">
        {categories.length > 0 ? (
          categories.map(category => (
            <div 
              key={category._id} 
              className="category-card"
            >
              <h3 onClick={() => handleCategoryClick(category._id)}>{category.name}</h3>
              {category.description && <p>{category.description}</p>}
              <button onClick={() => handleEditCategory(category)}>Editar</button>
              <button onClick={() => handleDeleteCategory(category._id)}>Eliminar</button>
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
