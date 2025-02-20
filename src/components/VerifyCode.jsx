import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "../styles/VerifyCode.css";

const VerifyCode = () => {
  const [verificationCode, setVerificationCode] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const inputsRef = useRef([]);

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
      const response = await fetch("https://orderandout.onrender.com/api/intern/admins/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode.join("") }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Código incorrecto");
      }

      if (data.token) {
        Cookies.set("authToken", data.token, {
          expires: 1,
          secure: true,
          sameSite: "strict",
        });
        navigate("/home");
      } else {
        navigate("/reset-password");
      }
    } catch (err) {
      setError(err.message || "Error al verificar el código");
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
          <button type="submit">Verificar Código</button>
        </form>
      </div>
    </div>
  );
};

export default VerifyCode;
