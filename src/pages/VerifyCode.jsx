import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate
import "../styles/VerifyCode.css";

const VerifyCode = () => {
  const [verificationCode, setVerificationCode] = useState(Array(6).fill("")); // Estado para el código de verificación
  const [error, setError] = useState(""); // Estado para manejar errores
  const navigate = useNavigate();

  const handleVerificationCodeChange = (e, index) => {
    const newCode = [...verificationCode];
    newCode[index] = e.target.value;
    setVerificationCode(newCode);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredCode = verificationCode.join("");

    // Aquí puedes agregar una validación para el código
    if (enteredCode.length === 6 && !enteredCode.includes("")) {
      // Redirige a la página de restablecimiento de contraseña si el código es correcto
      navigate("/reset-password");
    } else {
      // Si el código no es válido, mostramos un mensaje de error
      setError("Por favor ingresa un código de 6 dígitos.");
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-container">
        <h2>Verificar Código</h2>
        <p>Introduce el código de verificación que se envió a tu correo electrónico.</p>
        <form className="verify-form" onSubmit={handleSubmit}>
          <div className="verification-code">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleVerificationCodeChange(e, index)}
                required
              />
            ))}
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Verificar Código</button>
        </form>
      </div>
    </div>
  );
};

export default VerifyCode;
