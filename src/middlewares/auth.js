// Middlewares de autenticación (JWT) y autorización (roles).
const jwt = require('jsonwebtoken');
const { jwt: config } = require('../config/env');
const ApiError = require('../utils/ApiError');

// Verifica que exista un token Bearer, que su firma sea válida y que no esté vencido.
function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization || '';
  const [tipo, token] = encabezado.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Token no proporcionado. Use el encabezado Authorization: Bearer <token>'));
  }

  try {
    // jwt.verify comprueba la firma con JWT_SECRET y la fecha de expiración (exp).
    const payload = jwt.verify(token, config.secret, { algorithms: ['HS256'] });
    // La identidad del usuario sale SIEMPRE del token verificado, nunca del cuerpo de la petición.
    req.usuario = { id: Number(payload.sub), rol: payload.rol };
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'El token ha vencido. Inicie sesión nuevamente'));
    }
    return next(new ApiError(401, 'Token inválido'));
  }
}

// Permite el acceso solo a los roles indicados. Debe usarse después de verificarToken.
function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return next(new ApiError(403, 'No tiene permisos para realizar esta acción'));
    }
    return next();
  };
}

module.exports = { verificarToken, requiereRol };
