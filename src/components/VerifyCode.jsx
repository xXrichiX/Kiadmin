import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "../styles/VerifyCode.css";

const VerifyCode = () => {
  const [verificationCode, setVerificationCode] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const inputsRef = useRef([]);

  // Cambia la URL de la API por la variable de entorno
  const API_URL = process.env.REACT_APP_API_URL;

  const handleVerificationCodeChange = (e, index) => {
    const newCode = [...verificationCode];
    newCode[index] = e.target.value.replace(/\D/, "");
    setVerificationCode(newCode);

    if (e.target.value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/admins/verify-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tempId: Cookies.get("tempId"),
          code: verificationCode.join(""),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Código incorrecto");
      }

      Cookies.remove("tempId");
      Cookies.set("authToken", data.token, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });

      navigate("/home");

    } catch (err) {
      setError(err.message || "Error al verificar el código");
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-container">
        <div className="verify-image">
          {/* Imagen de fondo representativa */}
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1934&q=80"
            alt="Restaurante"
            className="background-image"
          />
        </div>
        <div className="verify-form">
          <div className="form-content">
            <h2 className="form-title">Verificar Código</h2>
            <p className="form-description">
              Introduce el código de verificación que se envió a tu correo electrónico.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="verification-code">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="tel"
                    pattern="[0-9]*"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleVerificationCodeChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    autoFocus={index === 0}
                    required
                  />
                ))}
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="button-container">
                <button type="submit" className="submit-button">
                  Verificar Código
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;