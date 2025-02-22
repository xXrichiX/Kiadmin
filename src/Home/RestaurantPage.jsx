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
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  // Almacena el restaurante actual (para edición y eliminación)
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

  // Muestra el formulario para crear un restaurante (sólo si no hay ninguno creado)
  const handleCreateClick = () => {
    setShowForm(true);
    setIsEditing(false);
    // Limpiar campos
    setName("");
    setImage("");
    setCountry("");
    setCity("");
    setAddress("");
    setPostalCode("");
    setError("");
  };

  // Envía la solicitud para crear un restaurante
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
      
      // Recarga la página para reflejar cambios
      window.location.reload();

    } catch (err) {
      setError(err.message);
      console.error("Error en la petición:", err);
    }
  };

  // Muestra el formulario para editar (precarga los datos actuales)
  const handleEditClick = () => {
    setShowForm(true);
    setIsEditing(true);
    setName(restaurant.name);
    setImage(restaurant.image);
    setCountry(restaurant.country);
    setCity(restaurant.city);
    setAddress(restaurant.address);
    setPostalCode(restaurant.postalCode);
    setError("");
  };

  // Envía la solicitud para actualizar el restaurante existente
  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!name || !image || !country || !city || !address || !postalCode) {
        throw new Error("Todos los campos son obligatorios");
      }
      const token = Cookies.get("authToken");
      if (isEditing) {
        const response = await fetch(`https://orderandout.onrender.com/api/intern/restaurants/${restaurant.id}`, {
          method: "PUT",
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
          throw new Error(data.message || "Error al actualizar restaurante");
        }
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
        setShowForm(false);
        setIsEditing(false);
        setError("");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error en la petición:", err);
    }
  };

  // Cancela la acción y limpia el formulario
  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setName("");
    setImage("");
    setCountry("");
    setCity("");
    setAddress("");
    setPostalCode("");
    setError("");
  };

  // Envía la solicitud para eliminar el restaurante
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
    <div className="restaurant-details">
      {loading ? (
        <p>Cargando...</p>
      ) : (
        !hasRestaurant ? (
          <div className="restaurant-prompt">
            {error && <p className="error-message">{error}</p>}
            {!showForm ? (
              <button onClick={handleCreateClick} className="create-restaurant-btn">
                Comenzar restaurante
              </button>
            ) : (
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
                  placeholder="Código Postal"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
                <button type="submit" className="submit-btn">Crear Restaurante</button>
              </form>
            )}
          </div>
        ) : (
          <div>
            <h3>{restaurant.name}</h3>
            <img src={restaurant.image} alt="Restaurante" className="restaurant-image" />
            <p>{restaurant.address}, {restaurant.city}</p>
            <button onClick={() => navigate(`/restaurant/${restaurant.name}`)} className="manage-btn">
              Gestionar Restaurante
            </button>
            <button onClick={handleEditClick} className="edit-restaurant-btn">
              Editar Restaurante
            </button>
            <button onClick={handleDeleteRestaurant} className="delete-restaurant-btn">
              Eliminar Restaurante
            </button>
            {showForm && isEditing && (
              <form onSubmit={handleRestaurantSubmit} className="restaurant-form">
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
                <button type="submit" className="submit-btn">Actualizar Restaurante</button>
                <button type="button" onClick={handleCancel} className="cancel-btn">
                  Cancelar
                </button>
              </form>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default RestaurantManagement;
