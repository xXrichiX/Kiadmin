import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";  // Importa el archivo CSS

const HomePage = () => {
  const [hasRestaurant, setHasRestaurant] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(true);  // Mantiene el menú abierto por defecto
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const checkRestaurant = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("https://orderandout.onrender.com/api/intern/restaurants/mine", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await response.json();
        
        if (data.code === "RESTAURANT_REQUIRED") {
          setHasRestaurant(false);
        } else if (response.ok) {
          const simplifiedData = {
            name: data.name,
            image: data.image,
            country: data.location.country,
            city: data.location.city,
            address: data.location.address,
            postalCode: data.location.postalCode
          };
          setRestaurant(simplifiedData);
          setHasRestaurant(true);
        } else {
          throw new Error(data.message || "Error al verificar restaurante");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkRestaurant();
  }, [navigate]);

  const handleCreateClick = () => {
    setShowForm(true);
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    
    // Debug: Verificar token
    const token = Cookies.get("authToken");
    console.log("Token JWT actual:", token ? "Presente" : "Ausente", token);
    
    try {
      if (!name || !image || !country || !city || !address || !postalCode) {
        throw new Error("Todos los campos son obligatorios");
      }

      const response = await fetch("https://orderandout.onrender.com/api/intern/restaurants/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Cookies.get("authToken")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          image,
          location: { country, city, address, postalCode }
        })
      });

      const data = await response.json();

      if (response.status === 403) {
        Cookies.remove("authToken");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Error al crear restaurante");
      }

      // Actualizar token si viene en la respuesta
      if (data.token) {
        Cookies.set("authToken", data.token, { 
          expires: 1,
          secure: true,
          sameSite: 'strict'
        });
        console.log("Nuevo token guardado:", data.token);
      }

      setHasRestaurant(true);
      setShowForm(false);
      setError("");
      
      window.location.reload();

    } catch (err) {
      setError(err.message);
      console.error("Error en la petición:", err);
    }
  };

  // Función para alternar el menú
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    navigate("/login");
  };

  // Función para ir al perfil del usuario
  const handleProfile = () => {
    navigate("/perfil");  // Ruta para el perfil del usuario
  };

  if (loading) return <div>Cargando...</div>;
  
  return (
    <div className="home-page">
      {/* Menú Vertical */}
      <div className={`slider-menu ${isMenuOpen ? "open" : ""}`}>
        <ul>
          <li onClick={() => navigate("/ventas")}>Dashboard</li>
          <li onClick={() => navigate("/productos")}>Kioskos</li>
          <li onClick={() => navigate("/reportes")}>Categorías</li>
          <li onClick={() => navigate("/categorias")}>Productos</li>
          <li onClick={() => navigate("/proveedores")}>órdenes</li>
          <li onClick={() => navigate("/proveedores")}>Restaurante</li>
        </ul>
      </div>

      {/* Menú Horizontal */}
      <div className="top-menu">
        {/* Botón de abrir/cerrar menú */}
        <button className="menu-toggle-button" onClick={toggleMenu}>
          {isMenuOpen ? "Cerrar Menú" : "Abrir Menú"}
        </button>

        {/* Botón de perfil del usuario */}
        <button className="profile-button" onClick={handleProfile}>
          Perfil
        </button>
        
        {/* Botón de cerrar sesión */}
        <button className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      {/* Contenido Principal */}
      <div className={`content-area ${isMenuOpen ? "menu-open" : ""}`}>
        <div className="content">
          {!hasRestaurant && (
            <div className="restaurant-prompt">
              {error && <p className="error-message">{error}</p>}
              
              {!showForm ? (
                <button 
                  onClick={handleCreateClick}
                  className="create-restaurant-btn"
                >
                  Comenzar restaurante
                </button>
              ) : (
                <form onSubmit={handleCreateRestaurant}>
                  <input
                    type="text"
                    placeholder="Nombre del restaurante"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    type="url"
                    placeholder="URL de la imagen"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="País"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Ciudad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Dirección completa"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Código postal"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                  <button type="submit">Crear restaurante</button>
                </form>
              )}
            </div>
          )}
          {hasRestaurant && restaurant && (
            <div className="restaurant-details">
              <h3>{restaurant.name}</h3>
              <img src={restaurant.image} alt="Restaurante" className="restaurant-image" />
              <div className="location-info">
                <p>📍 {restaurant.address}, {restaurant.city}</p>
                <p>🌎 {restaurant.country} | 📮 {restaurant.postalCode}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
