// Error controlado de la API: lleva el código HTTP y un mensaje claro para el cliente.
class ApiError extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles;
  }
}

module.exports = ApiError;
