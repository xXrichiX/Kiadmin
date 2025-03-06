import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/ProductsPage.css";

const ProductsPage = () => {
  /////////////////// ESTADOS ///////////////////
  const [products, setProducts] = useState([]); // Estado para almacenar los productos
  const [categories, setCategories] = useState([]); // Estado para almacenar las categorías
  const [selectedCategory, setSelectedCategory] = useState("all"); // Estado para la categoría seleccionada
  const [error, setError] = useState(""); // Estado para manejar errores
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar la apertura del modal
  const [editingProduct, setEditingProduct] = useState(null); // Estado para el producto en edición
  const [newProduct, setNewProduct] = useState(getEmptyProduct()); // Estado para el nuevo producto o producto editado

  const navigate = useNavigate(); // Hook para navegar entre rutas
  const API_URL = import.meta.env.VITE_API_URL; // Obtener la URL de la API desde las variables de entorno

  /////////////////// FUNCIÓN PARA OBTENER UN PRODUCTO VACÍO ///////////////////
  function getEmptyProduct() {
    return {
      name: "",
      description: "",
      image: "",
      costPrice: "",
      salePrice: "",
      category: "",
      ingredients: "",
    };
  }

  /////////////////// VALIDAR PRODUCTO ///////////////////
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

  /////////////////// OBTENER DATOS (CATEGORÍAS Y PRODUCTOS) ///////////////////
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("authToken"); // Obtener el token de autenticación
        if (!token) {
          navigate("/login"); // Redirigir al login si no hay token
          return;
        }

        // Obtener categorías
        const categoriesResponse = await fetch(`${API_URL}/api/categories/mineCategory`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!categoriesResponse.ok) {
          throw new Error(`Error categorías: ${categoriesResponse.status}`);
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Obtener productos
        const productsResponse = await fetch(`${API_URL}/api/products/mineProducts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!productsResponse.ok) {
          throw new Error(`Error productos: ${productsResponse.status}`);
        }
        const productsData = await productsResponse.json();
        setProducts(productsData);
      } catch (err) {
        setError(err.message); // Manejar errores
        console.error("Error en fetchData:", err);
      } finally {
        setLoading(false); // Finalizar la carga
      }
    };
    fetchData(); // Llamar a la función para obtener datos
  }, [navigate, API_URL]);

  /////////////////// OBTENER PRODUCTOS POR CATEGORÍA ///////////////////
  const fetchProductsByCategory = async (categoryId) => {
    try {
      const token = Cookies.get("authToken"); // Obtener el token de autenticación
      const response = await fetch(`${API_URL}/api/products/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener productos por categoría: ${response.status}`);
      }

      const productsData = await response.json();
      setProducts(productsData); // Actualizar el estado con los productos filtrados
    } catch (err) {
      setError(`Error al filtrar productos: ${err.message}`);
      console.error("Error al filtrar productos:", err);
    }
  };

  /////////////////// MANEJAR CAMBIO DE CATEGORÍA ///////////////////
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId); // Actualizar la categoría seleccionada
    if (categoryId === "all") {
      // Si se selecciona "Todas", obtener todos los productos
      setLoading(true);
      const fetchData = async () => {
        try {
          const token = Cookies.get("authToken");
          const productsResponse = await fetch(`${API_URL}/api/products/mineProducts`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!productsResponse.ok) {
            throw new Error(`Error productos: ${productsResponse.status}`);
          }
          const productsData = await productsResponse.json();
          setProducts(productsData); // Actualizar el estado con todos los productos
        } catch (err) {
          setError(err.message); // Manejar errores
          console.error("Error en fetchData:", err);
        } finally {
          setLoading(false); // Finalizar la carga
        }
      };
      fetchData();
    } else {
      // Si se selecciona una categoría específica, obtener sus productos
      fetchProductsByCategory(categoryId);
    }
  };

  /////////////////// ELIMINAR PRODUCTO ///////////////////
  const deleteProduct = async (productId) => {
    try {
      const token = Cookies.get("authToken"); // Obtener el token de autenticación
      const response = await fetch(`${API_URL}/api/products/myProduct`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }), // Enviar el ID del producto a eliminar
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      setProducts(products.filter((p) => p._id !== productId)); // Actualizar el estado localmente
    } catch (err) {
      setError(`Error al eliminar producto: ${err.message}`);
      console.error("Error al eliminar producto:", err);
    }
  };

  /////////////////// CREAR PRODUCTO ///////////////////
  const createProduct = async () => {
    if (!validateProduct()) return; // Validar campos antes de continuar

    try {
      const token = Cookies.get("authToken"); // Obtener el token de autenticación
      const response = await fetch(`${API_URL}/api/products/myProduct`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newProduct,
          ingredients: Array.isArray(newProduct.ingredients)
            ? newProduct.ingredients
            : newProduct.ingredients.split(",").map((i) => i.trim()), // Formatear ingredientes
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setProducts((prev) => [...prev, data]); // Actualizar el estado con el nuevo producto
      closeModal(); // Cerrar el modal
    } catch (err) {
      setError(`Error al crear producto: ${err.message}`);
      console.error("Error al crear producto:", err);
    }
  };

  /////////////////// ACTUALIZAR PRODUCTO ///////////////////
  const updateProduct = async () => {
    if (!validateProduct() || !editingProduct) return; // Validar campos antes de continuar

    try {
      const token = Cookies.get("authToken"); // Obtener el token de autenticación
      const response = await fetch(`${API_URL}/api/products/myProduct`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newProduct,
          productId: editingProduct._id, // Enviar el ID del producto a actualizar
          ingredients: Array.isArray(newProduct.ingredients)
            ? newProduct.ingredients
            : newProduct.ingredients.split(",").map((i) => i.trim()), // Formatear ingredientes
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const updatedProduct = await response.json();
      setProducts((prev) =>
        prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p)) // Actualizar el estado localmente
      );
      closeModal(); // Cerrar el modal
    } catch (err) {
      setError(`Error al actualizar producto: ${err.message}`);
      console.error("Error al actualizar producto:", err);
    }
  };

  /////////////////// ABRIR MODAL ///////////////////
  const openModal = (product = null) => {
    if (product) {
      // Si se está editando un producto, preparar el formulario
      const productForEdit = {
        ...product,
        ingredients: Array.isArray(product.ingredients)
          ? product.ingredients.join(", ")
          : product.ingredients,
      };
      setEditingProduct(product);
      setNewProduct(productForEdit);
    } else {
      // Si se está creando un nuevo producto, limpiar el formulario
      setEditingProduct(null);
      setNewProduct(getEmptyProduct());
    }
    setIsModalOpen(true); // Abrir el modal
  };

  /////////////////// CERRAR MODAL ///////////////////
  const closeModal = () => {
    setIsModalOpen(false); // Cerrar el modal
    setEditingProduct(null); // Limpiar el producto en edición
    setNewProduct(getEmptyProduct()); // Limpiar el formulario
    setError(""); // Limpiar errores
  };

  /////////////////// MANEJAR CAMBIOS EN LOS INPUTS ///////////////////
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevState) => ({
      ...prevState,
      [name]: value, // Actualizar el estado con los valores del formulario
    }));
  };

  /////////////////// MANEJAR ENVÍO DEL FORMULARIO ///////////////////
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingProduct) {
      await updateProduct(); // Si se está editando, actualizar el producto
    } else {
      await createProduct(); // Si se está creando, crear el producto
    }
  };

  /////////////////// RENDERIZADO ///////////////////
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
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
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
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
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
              products.map((product) => (
                <div key={product._id} className="product-card">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-details">
                    <p>💰 Costo: ${product.costPrice}</p>
                    <p>🏷 Venta: ${product.salePrice}</p>
                    <p>🗂 Categoría: {categories.find((c) => c._id === product.category)?.name}</p>
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