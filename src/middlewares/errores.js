// Manejo centralizado de errores: respuestas JSON consistentes y sin detalles internos.
const ApiError = require('../utils/ApiError');

function rutaNoEncontrada(req, res, next) {
  next(new ApiError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function manejarErrores(err, req, res, next) {
  // JSON mal formado en el cuerpo de la petición
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, mensaje: 'El cuerpo de la petición no es un JSON válido' });
  }

  if (err instanceof ApiError) {
    const respuesta = { ok: false, mensaje: err.message };
    if (err.detalles) respuesta.detalles = err.detalles;
    return res.status(err.status).json(respuesta);
  }

  // Error inesperado: se registra en consola, pero al cliente solo se le da un mensaje genérico.
  console.error('[ERROR]', err);
  return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
}

module.exports = { rutaNoEncontrada, manejarErrores };
