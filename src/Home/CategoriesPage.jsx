import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/CategoriesPage.css";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("https://orderandout.onrender.com/api/intern/categories/mine", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await response.json();
        
        if (response.ok) {
          setCategories(data);
        } else {
          throw new Error(data.message || "Error al obtener categorías");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [navigate]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      if (!name) {
        throw new Error("El nombre es obligatorio");
      }

      const token = Cookies.get("authToken");
      const response = await fetch("https://orderandout.onrender.com/api/intern/categories", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          description
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear categoría");
      }

      // Actualizar lista de categorías
      setCategories([...categories, data]);
      setShowForm(false);
      setName("");
      setDescription("");
      setError("");

    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="categories-page">
      <h2>Gestión de Categorías</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      <button 
        onClick={() => setShowForm(true)}
        className="create-category-btn"
      >
        Crear Nueva Categoría
      </button>

      {showForm && (
        <form onSubmit={handleCreateCategory} className="category-form">
          <input
            type="text"
            placeholder="Nombre de la categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="form-buttons">
            <button type="submit">Crear</button>
            <button type="button" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="categories-list">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category._id} className="category-card">
              <h3>{category.name}</h3>
              {category.description && <p>{category.description}</p>}
            </div>
          ))
        ) : (
          <p>No hay categorías creadas</p>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage; 