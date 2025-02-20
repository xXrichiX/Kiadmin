import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const RestaurantManagement = () => {
  const [hasRestaurant, setHasRestaurant] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
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

      setHasRestaurant(true);
      setShowForm(false);
      setError("");
      
      window.location.reload();

    } catch (err) {
      setError(err.message);
      console.error("Error en la petición:", err);
    }
  };

  return (
    <div className="restaurant-details">
      {!hasRestaurant ? (
        <div className="restaurant-prompt">
          {error && <p className="error-message">{error}</p>}
          {!showForm ? (
            <button onClick={handleCreateClick} className="create-restaurant-btn">
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
                placeholder="Dirección"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Código Postal"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
              <button type="submit">Crear Restaurante</button>
            </form>
          )}
        </div>
      ) : (
        <div>
          <h3>{restaurant.name}</h3>
          <img src={restaurant.image} alt="Restaurante" className="restaurant-image" />
          <p>{restaurant.address}, {restaurant.city}</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantManagement;
