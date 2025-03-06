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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState(getEmptyProduct());

  const navigate = useNavigate();
  const baseUrl = "https://orderandout-refactor.onrender.com";

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

        // Obtener categorías
        const categoriesResponse = await fetch(`${baseUrl}/api/categories/mineCategory`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!categoriesResponse.ok) {
          throw new Error(`Error categorías: ${categoriesResponse.status}`);
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Obtener productos
        const productsResponse = await fetch(`${baseUrl}/api/products/mineProducts`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!productsResponse.ok) {
          throw new Error(`Error productos: ${productsResponse.status}`);
        }
        const productsData = await productsResponse.json();
        setProducts(productsData);

      } catch (err) {
        setError(err.message);
        console.error("Error en fetchData:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // New function to fetch products by category
  const fetchProductsByCategory = async (categoryId) => {
    try {
      const token = Cookies.get("authToken");
      const response = await fetch(`${baseUrl}/api/products/${categoryId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener productos por categoría: ${response.status}`);
      }

      const productsData = await response.json();
      setProducts(productsData);
    } catch (err) {
      setError(`Error al filtrar productos: ${err.message}`);
      console.error("Error al filtrar productos:", err);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === "all") {
      // If "all" is selected, fetch all products
      setLoading(true);
      const fetchData = async () => {
        try {
          const token = Cookies.get("authToken");
          const productsResponse = await fetch(`${baseUrl}/api/products/mineProducts`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          
          if (!productsResponse.ok) {
            throw new Error(`Error productos: ${productsResponse.status}`);
          }
          const productsData = await productsResponse.json();
          setProducts(productsData);
        } catch (err) {
          setError(err.message);
          console.error("Error en fetchData:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      // Fetch products for the selected category
      fetchProductsByCategory(categoryId);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const token = Cookies.get("authToken");
      const response = await fetch(`${baseUrl}/api/products/myProduct`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ productId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      setError(`Error al eliminar producto: ${err.message}`);
      console.error("Error al eliminar producto:", err);
    }
  };

  const createProduct = async () => {
    if (!validateProduct()) return;

    try {
      const token = Cookies.get("authToken");
      const response = await fetch(`${baseUrl}/api/products/myProduct`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...newProduct,
          ingredients: Array.isArray(newProduct.ingredients) 
            ? newProduct.ingredients 
            : newProduct.ingredients.split(',').map(i => i.trim())
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      setProducts(prev => [...prev, data]);
      closeModal();
      
    } catch (err) {
      setError(`Error al crear producto: ${err.message}`);
      console.error("Error al crear producto:", err);
    }
  };

  const updateProduct = async () => {
    if (!validateProduct() || !editingProduct) return;

    try {
      const token = Cookies.get("authToken");
      const response = await fetch(`${baseUrl}/api/products/myProduct`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...newProduct,
          productId: editingProduct._id,
          ingredients: Array.isArray(newProduct.ingredients) 
            ? newProduct.ingredients 
            : newProduct.ingredients.split(',').map(i => i.trim())
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const updatedProduct = await response.json();
      
      setProducts(prev => 
        prev.map(p => p._id === updatedProduct._id ? updatedProduct : p)
      );
      closeModal();
      
    } catch (err) {
      setError(`Error al actualizar producto: ${err.message}`);
      console.error("Error al actualizar producto:", err);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      const productForEdit = {
        ...product,
        ingredients: Array.isArray(product.ingredients) 
          ? product.ingredients.join(', ') 
          : product.ingredients
      };
      
      setEditingProduct(product);
      setNewProduct(productForEdit);
    } else {
      setEditingProduct(null);
      setNewProduct(getEmptyProduct());
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setNewProduct(getEmptyProduct());
    setError("");
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
    if (editingProduct) {
      await updateProduct();
    } else {
      await createProduct();
    }
  };

  return (
    <div className="products-page">
      {loading && <p className="loading-message">Cargando productos...</p>}
      
      {!loading && error && (
        <div className="error-container">
          <p className="error-message">⚠️ Error: {error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <h2 className="page-title">Gestión de Productos</h2>
          <button onClick={() => openModal()} className="create-product-btn">
            Crear Producto
          </button>
  
          <div className="filter-container">
            <label>Filtrar por Categoría:</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="all">Todas</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>

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
              <p>No hay productos disponibles</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductsPage;