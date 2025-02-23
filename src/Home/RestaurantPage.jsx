import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/RestaurantPage.css";

const RestaurantManagement = () => {
  const [hasRestaurant, setHasRestaurant] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Estados para el formulario (crear/editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [restaurant, setRestaurant] = useState(null);

  // Verifica si el usuario ya tiene un restaurante
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
            id: data._id,
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

  // Abre el modal para crear o editar
  const openModal = (editing = false) => {
    setIsModalOpen(true);
    setIsEditing(editing);
    if (editing) {
      // Precarga los datos del restaurante en el formulario
      setName(restaurant.name);
      setImage(restaurant.image);
      setCountry(restaurant.country);
      setCity(restaurant.city);
      setAddress(restaurant.address);
      setPostalCode(restaurant.postalCode);
    } else {
      // Limpia el formulario para crear
      setName("");
      setImage("");
      setCountry("");
      setCity("");
      setAddress("");
      setPostalCode("");
    }
    setError("");
  };

  // Cierra el modal
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setError("");
  };

  // Envía la solicitud para crear o editar el restaurante
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!name || !image || !country || !city || !address || !postalCode) {
        throw new Error("Todos los campos son obligatorios");
      }

      const token = Cookies.get("authToken");
      const url = isEditing
        ? `https://orderandout.onrender.com/api/intern/restaurants/${restaurant.id}` // Modo edición
        : "https://orderandout.onrender.com/api/intern/restaurants/"; // Modo creación

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
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

      if (!response.ok) {
        throw new Error(data.message || "Error al guardar restaurante");
      }

      // Actualiza el estado del restaurante
      const simplifiedData = {
        id: data._id,
        name: data.name,
        image: data.image,
        country: data.location.country,
        city: data.location.city,
        address: data.location.address,
        postalCode: data.location.postalCode
      };
      setRestaurant(simplifiedData);
      setHasRestaurant(true);
      closeModal();
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Elimina el restaurante
  const handleDeleteRestaurant = async () => {
    try {
      const token = Cookies.get("authToken");
      const response = await fetch(`https://orderandout.onrender.com/api/intern/restaurants/${restaurant.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Error al eliminar restaurante");
      }

      setHasRestaurant(false);
      setRestaurant(null);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="restaurant-page">
      <h2 className="page-title">Gestión de Restaurante</h2>
      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : hasRestaurant ? (
        <div className="restaurant-details">
          <h3>{restaurant.name}</h3>
          <img src={restaurant.image} alt={restaurant.name} className="restaurant-image" />
          <p>{restaurant.address}, {restaurant.city}, {restaurant.country}</p>
          <button onClick={() => openModal(true)} className="edit-restaurant-btn">
            ✏️ Editar Restaurante
          </button>
          <button onClick={handleDeleteRestaurant} className="delete-restaurant-btn">
            🗑 Eliminar Restaurante
          </button>
        </div>
      ) : (
        <button onClick={() => openModal(false)} className="create-restaurant-btn">
          Comenzar Restaurante
        </button>
      )}

      {/* Modal para crear/editar restaurante */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditing ? "Editar Restaurante" : "Crear Restaurante"}</h3>
            <form onSubmit={handleSubmit} className="restaurant-form">
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
              <div className="modal-buttons">
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Cancelar
                </button>
                <button type="submit" className="submit-btn">
                  {isEditing ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantManagement;