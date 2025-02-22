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
  const [editingProductId, setEditingProductId] = useState(null); // Para editar un producto
  const [isCreating, setIsCreating] = useState(false); // Para crear un nuevo producto
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

  const deleteCategory = async (categoryId) => {
    try {
      const token = Cookies.get("authToken");
      await fetch(`https://orderandout.onrender.com/api/intern/categories/${categoryId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setCategories(categories.filter(category => category._id !== categoryId));
      setProducts(products.filter(product => product.category !== categoryId));
    } catch (err) {
      setError("Error al eliminar la categoría");
    }
  };

  const editProduct = (product) => {
    setEditingProductId(product._id); // Establece el ID del producto en edición
    setIsCreating(false); // Asegura que no estemos en modo creación
    setNewProduct(product); // Carga los datos del producto en el formulario
    setError("");
  };

  const updateProduct = async (productId) => {
    if (!validateProduct()) return;
    try {
      const token = Cookies.get("authToken");
      const response = await fetch(`https://orderandout.onrender.com/api/intern/products/${productId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newProduct)
      });
      const updatedProduct = await response.json();
      setProducts(products.map(p => (p._id === updatedProduct._id ? updatedProduct : p)));
      setEditingProductId(null); // Cierra el formulario de edición
      setNewProduct(getEmptyProduct()); // Limpia el formulario
    } catch (err) {
      setError("Error al actualizar el producto");
    }
  };

  const createProduct = async () => {
    if (!validateProduct()) return;
    try {
      const token = Cookies.get("authToken");
      const response = await fetch("https://orderandout.onrender.com/api/intern/products", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newProduct)
      });
      const createdProduct = await response.json();
      setProducts([...products, createdProduct]);
      setIsCreating(false); // Cierra el formulario de creación
      setNewProduct(getEmptyProduct()); // Limpia el formulario
    } catch (err) {
      setError("Error al crear el producto");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCancel = () => {
    setEditingProductId(null); // Cierra el formulario de edición
    setIsCreating(false); // Cierra el formulario de creación
    setNewProduct(getEmptyProduct()); // Limpia el formulario
    setError("");
  };

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="products-page">
      <h2 className="page-title">Gestión de Productos</h2>
      {error && <p className="error-message">{error}</p>}

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

      <button onClick={() => { setIsCreating(true); setEditingProductId(null); setNewProduct(getEmptyProduct()); setError(""); }}>
        Crear Producto
      </button>

      {/* Formulario de creación (arriba de todo) */}
      {isCreating && (
        <div className="create-product-form">
          <h3>Crear Nuevo Producto</h3>
          <input
            type="text"
            name="name"
            placeholder="Nombre del Producto"
            value={newProduct.name}
            onChange={handleInputChange}
          />
          <textarea
            name="description"
            placeholder="Descripción"
            value={newProduct.description}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="image"
            placeholder="URL de Imagen"
            value={newProduct.image}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="costPrice"
            placeholder="Precio de Costo"
            value={newProduct.costPrice}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="salePrice"
            placeholder="Precio de Venta"
            value={newProduct.salePrice}
            onChange={handleInputChange}
          />
          <select
            name="category"
            value={newProduct.category}
            onChange={handleInputChange}
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
          <button onClick={createProduct}>Crear</button>
          <button onClick={handleCancel}>Cancelar</button>
        </div>
      )}

      {/* Lista de productos */}
      <div className="products-list">
        {loading ? (
          <p>Cargando...</p>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product._id} className="product-card">
              {editingProductId === product._id ? (
                <div className="edit-product-form">
                  <h3>Editar Producto</h3>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre del Producto"
                    value={newProduct.name}
                    onChange={handleInputChange}
                  />
                  <textarea
                    name="description"
                    placeholder="Descripción"
                    value={newProduct.description}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="image"
                    placeholder="URL de Imagen"
                    value={newProduct.image}
                    onChange={handleInputChange}
                  />
                  <input
                    type="number"
                    name="costPrice"
                    placeholder="Precio de Costo"
                    value={newProduct.costPrice}
                    onChange={handleInputChange}
                  />
                  <input
                    type="number"
                    name="salePrice"
                    placeholder="Precio de Venta"
                    value={newProduct.salePrice}
                    onChange={handleInputChange}
                  />
                  <select
                    name="category"
                    value={newProduct.category}
                    onChange={handleInputChange}
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
                  <button onClick={() => updateProduct(product._id)}>Actualizar</button>
                  <button onClick={handleCancel}>Cancelar</button>
                </div>
              ) : (
                <>
                  <img src={product.image} alt={product.name} className="product-image" />
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-details">
                    <p>💰 Costo: ${product.costPrice}</p>
                    <p>🏷 Venta: ${product.salePrice}</p>
                    <p>🗂 Categoría: {categories.find(c => c._id === product.category)?.name}</p>
                  </div>
                  <button onClick={() => editProduct(product)}>✏️ Editar</button>
                  <button onClick={() => deleteProduct(product._id)}>🗑 Eliminar</button>
                </>
              )}
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