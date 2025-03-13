import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // 👈 Importamos el enrutador
import App from "./App"; // 👈 Importamos el componente principal
import "./index.css"; // 👈 Importamos estilos globales

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter> {/* 👈 Habilitamos el enrutador */}
      <App /> {/* 👈 Cargamos el componente principal */}
    </BrowserRouter>
  </React.StrictMode>
);
