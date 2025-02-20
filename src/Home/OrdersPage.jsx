import React from "react";
import "../styles/OrdersPage.css"; 

function OrdersPage() {
  return (
    <div className="orders-page">
      <div className="orders-container">
        <h2>Lista de Órdenes</h2>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Número de Orden</th>
              <th>Productos</th>
              <th>Precio por Producto</th>
              <th>Cantidad</th>
              <th>Total</th>
              <th>Método de Pago</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>12345</td>
              <td>Pizza, Pasta</td>
              <td>$10</td>
              <td>2</td>
              <td>$20</td>
              <td>Tarjeta</td>
              <td>Completado</td>
            </tr>
            <tr>
              <td>12346</td>
              <td>Burger, Papas</td>
              <td>$5</td>
              <td>3</td>
              <td>$15</td>
              <td>Paypal</td>
              <td>En espera</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrdersPage;
