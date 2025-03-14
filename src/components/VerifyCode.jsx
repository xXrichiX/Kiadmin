import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import "../styles/VerifyCode.css";

const VerifyCode = () => {
  const [verificationCode, setVerificationCode] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const inputsRef = useRef([]);

  // URL de la API desde la variable de entorno
  const API_URL = import.meta.env.VITE_API_URL;

  // Determinar si estamos en el flujo de restablecimiento de contraseña
  const isPasswordReset = location.state?.isPasswordReset || false;

  // Manejar la entrada de los dígitos del código
  const handleVerificationCodeChange = (e, index) => {
    const newCode = [...verificationCode];
    newCode[index] = e.target.value.replace(/\D/, ""); // Solo números
    setVerificationCode(newCode);

    // Enfocar el siguiente input si se ingresó un valor
    if (e.target.value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // Manejar la tecla "Backspace" para borrar y mover el foco
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // Validación del código de verificación
  const validateCode = () => {
    if (verificationCode.some((digit) => digit === "")) {
      setError("Por favor, complete todo el código.");
      return false;
    }
    return true;
  };

  // Enviar el código para verificación
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar error antes de enviar

    // Validar el código antes de enviarlo
    if (!validateCode()) {
      return;
    }

    try {
      // Si es restablecimiento de contraseña pero no hay newPassword en el state,
      // redirigir a la pantalla para ingresar la nueva contraseña
      if (isPasswordReset && !location.state?.newPassword) {
        navigate("/reset-password", {
          state: {
            email: location.state?.email || localStorage.getItem("resetEmail"),
            code: verificationCode.join("")
          }
        });
        return;
      }

      // Determinar el endpoint y los datos a enviar según el escenario
      const endpoint = isPasswordReset
        ? `${API_URL}/api/admins/reset-password`
        : `${API_URL}/api/admins/verify-account`;

      const requestBody = isPasswordReset
        ? {
            email: location.state?.email || localStorage.getItem("resetEmail"),
            code: verificationCode.join(""),
            newPassword: location.state?.newPassword,
          }
        : {
            tempId: Cookies.get("tempId"),
            code: verificationCode.join(""),
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Código incorrecto");
      }

      // Manejar la respuesta según el escenario
      if (isPasswordReset) {
        setMessage("Contraseña restablecida con éxito");
        // Redirigir al login después de restablecer la contraseña
        setTimeout(() => navigate("/login"), 2000);
      } else {
        // Para verificación de cuenta - guardamos el token si lo recibimos
        if (data.token) {
          Cookies.set("authToken", data.token, {
            expires: 1,
            secure: true,
            sameSite: "strict",
          });
        }
        // Limpiar el ID temporal
        Cookies.remove("tempId");
        
        setMessage("Cuenta verificada con éxito");
        // Redirigir a la página principal
        setTimeout(() => navigate("/home"), 2000);
      }
    } catch (err) {
      setError(err.message || "Error al verificar el código");
    }
  };

  // Reenviar código de verificación
  const handleResendCode = async () => {
    try {
      setMessage("Enviando nuevo código...");
      setError(""); // Limpiar cualquier error previo

      const endpoint = isPasswordReset
        ? `${API_URL}/api/admins/forgot-password`
        : `${API_URL}/api/admins/resend-code`;

      const email = location.state?.email || 
                    localStorage.getItem("resetEmail") || 
                    Cookies.get("tempEmail");

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error al reenviar el código");
      }

      setMessage("Código reenviado con éxito. Revisa tu correo.");
    } catch (err) {
      setError(err.message || "Error al reenviar el código");
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-container">
        <div className="verify-image">
          <img
            src="https://res.cloudinary.com/dej4kxb37/image/upload/v1741658856/s4earu86aump4eooafk1.jpg"
            alt="Restaurante"
            className="background-image"
          />
        </div>
        <div className="verify-form">
          <div className="form-content">
            <h2 className="form-title">
              {isPasswordReset
                ? "Verificar Código para Restablecer Contraseña"
                : "Verificar Código"}
            </h2>
            <p className="form-description">
              Introduce el código de verificación que se envió a tu correo electrónico.
              {isPasswordReset && <span> Este código expira en 10 minutos.</span>}
            </p>
            <form onSubmit={handleSubmit}>
              <div className="verification-code">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="tel"
                    pattern="[0-9]*"
                    inputMode="numeric"
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
              {message && <p className="success-message">{message}</p>}
              <div className="button-container">
                <button type="submit" className="submit-button">
                  Verificar Código
                </button>
                {/* Botón de reenviar código comentado
                <button
                  type="button"
                  className="resend-button"
                  onClick={handleResendCode}
                >
                  Reenviar Código
                </button>
                */}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;