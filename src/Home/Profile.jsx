import React, { useEffect, useState } from "react";
import "../styles/Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <p>Cargando perfil...</p>; // 👈 Muestra un mensaje de carga si no hay usuario
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <img
            src={user.profilePicture || "https://via.placeholder.com/150"} // 👈 Imagen por defecto
            alt="Perfil"
            className="profile-pic"
          />
          <h2>{user.name}</h2>
          <p className="profile-email">{user.email}</p>
        </div>
        <div className="profile-details">
          <p><strong>Teléfono:</strong> {user.phone}</p>
          <p><strong>Fecha de Nacimiento:</strong> {user.birthDate}</p>
          <p><strong>Restaurante:</strong> {user.restaurant || "No especificado"}</p>
        </div>
        <button className="edit-profile-btn">Editar Perfil</button>
      </div>
    </div>
  );
};

export default Profile;
