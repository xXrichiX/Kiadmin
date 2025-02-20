import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/ProductsPage.css";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    costPrice: "",
    salePrice: "",
    category: "",
    ingredients: ""
  });
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

        // Obtener categorías
        const categoriesResponse = await fetch("https://orderandout.onrender.com/api/intern/categories/mine", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Obtener productos
        const productsResponse = await fetch("https://orderandout.onrender.com/api/intern/products/mine", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
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

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get("authToken");
      const ingredientsArray = formData.ingredients.split(',').map(i => i.trim());
      
      const response = await fetch("https://orderandout.onrender.com/api/intern/products", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          costPrice: parseFloat(formData.costPrice),
          salePrice: parseFloat(formData.salePrice),
          ingredients: ingredientsArray
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear producto");
      }

      setProducts([...products, data]);
      setShowForm(false);
      setFormData({
        name: "",
        description: "",
        image: "",
        costPrice: "",
        salePrice: "",
        category: "",
        ingredients: ""
      });
      setError("");

    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <div className="loading-message">Cargando...</div>;

  return (
    <div className="products-page">
      <h2 className="page-title">Gestión de Productos</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      <button 
        onClick={() => setShowForm(true)}
        className="create-product-btn"
      >
        Crear Nuevo Producto
      </button>

      {showForm && (
        <form onSubmit={handleCreateProduct} className="product-form">
          <label>Nombre del Producto:</label>
          <input
            type="text"
            name="name"
            placeholder="Nombre del producto"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Descripción:</label>
          <textarea
            name="description"
            placeholder="Descripción"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <label>URL de Imagen:</label>
          <input
            type="url"
            name="image"
            placeholder="URL de la imagen"
            value={formData.image}
            onChange={handleChange}
            required
          />

          <label>Precio de Costo:</label>
          <input
            type="number"
            step="0.01"
            name="costPrice"
            placeholder="Precio de costo"
            value={formData.costPrice}
            onChange={handleChange}
            required
          />

          <label>Precio de Venta:</label>
          <input
            type="number"
            step="0.01"
            name="salePrice"
            placeholder="Precio de venta"
            value={formData.salePrice}
            onChange={handleChange}
            required
          />

          <label>Categoría:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <label>Ingredientes (separados por comas):</label>
          <input
            type="text"
            name="ingredients"
            placeholder="Ingredientes"
            value={formData.ingredients}
            onChange={handleChange}
          />

          <div className="form-buttons">
            <button type="submit" className="submit-btn">Crear</button>
            <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="products-list">
        {products.length > 0 ? (
          products.map(product => (
            <div key={product._id} className="product-card">
              <img src={product.image} alt={product.name} className="product-image" />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-details">
                <p>💰 Costo: ${product.costPrice}</p>
                <p>🏷 Venta: ${product.salePrice}</p>
                <p>📦 Disponible: {product.availability ? "Sí" : "No"}</p>
                <p>🗂 Categoría: {categories.find(c => c._id === product.category)?.name}</p>
                {product.ingredients?.length > 0 && (
                  <p>🥗 Ingredientes: {product.ingredients.join(", ")}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No hay productos creados</p>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
