import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/ProductsPage.css";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Controla si el modal está abierto
  const [editingProduct, setEditingProduct] = useState(null); // Almacena el producto en edición
  const [newProduct, setNewProduct] = useState(getEmptyProduct());

  const navigate = useNavigate();

  // Función para devolver un producto vacío
  function getEmptyProduct() {
    return {
      name: "",
      description: "",
      image: "",
      costPrice: "",
      salePrice: "",
      category: "",
      ingredients: ""
    };
  }

  // Validación: verifica que los campos requeridos no estén vacíos
  const validateProduct = () => {
    if (
      !newProduct.name.trim() ||
      !newProduct.description.trim() ||
      !newProduct.image.trim() ||
      !newProduct.costPrice.toString().trim() ||
      !newProduct.salePrice.toString().trim() ||
      !newProduct.category.trim()
    ) {
      setError("Por favor, completa todos los campos requeridos.");
      return false;
    }
    setError("");
    return true;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const categoriesResponse = await fetch("https://orderandout.onrender.com/api/intern/categories/mine", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        const productsResponse = await fetch("https://orderandout.onrender.com/api/intern/products/mine", {
          headers: { "Authorization": `Bearer ${token}` }
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

  const deleteProduct = async (productId) => {
    try {
      const token = Cookies.get("authToken");
      await fetch(`https://orderandout.onrender.com/api/intern/products/${productId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setProducts(products.filter(product => product._id !== productId));
    } catch (err) {
      setError("Error al eliminar el producto");
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product); // Establece el producto en edición
      setNewProduct(product); // Carga los datos del producto en el formulario
    } else {
      setEditingProduct(null); // No hay producto en edición (modo creación)
      setNewProduct(getEmptyProduct()); // Limpia el formulario
    }
    setIsModalOpen(true); // Abre el modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Cierra el modal
    setEditingProduct(null); // Limpia el producto en edición
    setNewProduct(getEmptyProduct()); // Limpia el formulario
    setError(""); // Limpia los errores
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateProduct()) return;

    try {
      const token = Cookies.get("authToken");
      const url = editingProduct
        ? `https://orderandout.onrender.com/api/intern/products/${editingProduct._id}` // Modo edición
        : "https://orderandout.onrender.com/api/intern/products"; // Modo creación

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newProduct)
      });

      const result = await response.json();

      if (editingProduct) {
        // Actualiza el producto existente
        setProducts(products.map(p => (p._id === result._id ? result : p)));
      } else {
        // Agrega el nuevo producto
        setProducts([...products, result]);
      }

      closeModal(); // Cierra el modal después de guardar
    } catch (err) {
      setError("Error al guardar el producto");
    }
  };

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(product => product.category === selectedCategory);

    return (
      <div className="products-page">
        <h2 className="page-title">Gestión de Productos</h2>
        {error && <p className="error-message">{error}</p>}
  
        {/* Botón de crear producto */}
        <button onClick={() => openModal()} className="create-product-btn">
          Crear Producto
        </button>
  
        {/* Filtro por categoría */}
        <div className="filter-container">
          <label>Filtrar por Categoría:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
        </div>

      {/* Modal para crear/editar productos */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingProduct ? "Editar Producto" : "Crear Producto"}</h3>
            <form onSubmit={handleSubmit} className="product-form">
              <input
                type="text"
                name="name"
                placeholder="Nombre del Producto"
                value={newProduct.name}
                onChange={handleInputChange}
                required
              />
              <textarea
                name="description"
                placeholder="Descripción"
                value={newProduct.description}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="image"
                placeholder="URL de Imagen"
                value={newProduct.image}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="costPrice"
                placeholder="Precio de Costo"
                value={newProduct.costPrice}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="salePrice"
                placeholder="Precio de Venta"
                value={newProduct.salePrice}
                onChange={handleInputChange}
                required
              />
              <select
                name="category"
                value={newProduct.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
              <input
                type="text"
                name="ingredients"
                placeholder="Ingredientes (separados por comas)"
                value={newProduct.ingredients}
                onChange={handleInputChange}
              />
              <div className="modal-buttons">
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Cancelar
                </button>
                <button type="submit" className="submit-btn">
                  {editingProduct ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de productos */}
      <div className="products-list">
        {loading ? (
          <p className="loading-message">Cargando...</p>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product._id} className="product-card">
              <img src={product.image} alt={product.name} className="product-image" />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-details">
                <p>💰 Costo: ${product.costPrice}</p>
                <p>🏷 Venta: ${product.salePrice}</p>
                <p>🗂 Categoría: {categories.find(c => c._id === product.category)?.name}</p>
              </div>
              <button onClick={() => openModal(product)} className="edit-product-btn">
                ✏️ Editar
              </button>
              <button onClick={() => deleteProduct(product._id)} className="delete-product-btn">
                🗑 Eliminar
              </button>
            </div>
          ))
        ) : (
          <p>No hay productos en esta categoría</p>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;