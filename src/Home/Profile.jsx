import React from "react";
import "../styles/Profile.css";

const Profile = () => {
  // Simulación de datos de usuario
  const user = {
    name: "Ricardo Méndez",
    email: "ricardo@example.com",
    phone: "+52 123 456 7890",
    birthdate: "1990-05-15",
    restaurant: "Kibbi Restaurant",
    profilePicture: "https://via.placeholder.com/150", // Imagen de perfil (puedes cambiarla)
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <img
            src={user.profilePicture}
            alt="Perfil"
            className="profile-pic"
          />
          <h2>{user.name}</h2>
          <p className="profile-email">{user.email}</p>
        </div>
        <div className="profile-details">
          <p>
            <strong>Teléfono:</strong> {user.phone}
          </p>
          <p>
            <strong>Fecha de Nacimiento:</strong> {user.birthdate}
          </p>
          <p>
            <strong>Restaurante:</strong> {user.restaurant}
          </p>
        </div>
        <button className="edit-profile-btn">Editar Perfil</button>
      </div>
    </div>
  );
};

export default Profile;
