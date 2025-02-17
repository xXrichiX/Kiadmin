import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/RestaurantPage.css";

const RestaurantPage = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("https://orderandout.onrender.com/api/intern/restaurants/mine", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (response.ok) {
          setRestaurant(data);
        } else if (data.code === "RESTAURANT_REQUIRED") {
          navigate("/create-restaurant");
        } else {
          throw new Error(data.message || "Error al obtener el restaurante");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [navigate]);

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      if (!name || !image || !country || !city || !address || !postalCode) {
        throw new Error("Todos los campos son obligatorios");
      }

      const token = Cookies.get("authToken");
      const response = await fetch("https://orderandout.onrender.com/api/intern/restaurants/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
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

      if (data.token) {
        Cookies.set("authToken", data.token, { 
          expires: 1,
          secure: true,
          sameSite: 'strict'
        });
      }

      setRestaurant(data);
      setShowForm(false);
      setError("");
      
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="restaurant-page">
      <h1>{restaurant.name}</h1>
      <img src={restaurant.image} alt="Restaurante" className="restaurant-image" />
      
      <div className="restaurant-info">
        <h2>Información del Restaurante</h2>
        <div className="info-section">
          <p><strong>País:</strong> {restaurant.location.country}</p>
          <p><strong>Ciudad:</strong> {restaurant.location.city}</p>
          <p><strong>Dirección:</strong> {restaurant.location.address}</p>
          <p><strong>Código Postal:</strong> {restaurant.location.postalCode}</p>
        </div>
        
        <div className="stats-section">
          <div className="stat-card">
            <h3>Categorías</h3>
            <p>{restaurant.categoryCount || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Productos</h3>
            <p>{restaurant.productCount || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Kioskos</h3>
            <p>{restaurant.kioskCount || 0}</p>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setShowForm(true)}
        className="create-restaurant-btn"
      >
        Crear Restaurante
      </button>

      {showForm && (
        <form onSubmit={handleCreateRestaurant} className="restaurant-form">
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
            placeholder="Dirección"
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
          <div className="form-buttons">
            <button type="submit">Crear</button>
            <button type="button" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RestaurantPage; 