// Validaciones del lado del servidor.
// Criterio de códigos:
//   400 Bad Request          -> petición mal formada: campos obligatorios ausentes o vacíos,
//                               tipos incorrectos, identificador no numérico o JSON inválido.
//   422 Unprocessable Entity -> los campos llegan, pero su valor no cumple una regla:
//                               correo con formato inválido, contraseña corta, precio <= 0.
const ApiError = require('./ApiError');

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

// Comprueba que los campos existan y no estén vacíos. Lanza 400 si falta alguno.
function exigirCampos(body, campos) {
  const faltantes = campos.filter((campo) => {
    const valor = body[campo];
    if (valor === undefined || valor === null) return true;
    if (typeof valor === 'string' && valor.trim() === '') return true;
    return false;
  });
  if (faltantes.length > 0) {
    throw new ApiError(400, 'Faltan campos obligatorios o están vacíos', { campos: faltantes });
  }
}

// Convierte un identificador a entero positivo. Lanza 400 si no es válido.
function validarId(valor, nombre = 'id') {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0 || String(valor).trim() === '') {
    throw new ApiError(400, `El ${nombre} debe ser un número entero positivo`);
  }
  return numero;
}

function validarRegistro(body) {
  exigirCampos(body, ['nombre', 'correo', 'password']);
  const nombre = texto(body.nombre);
  const correo = texto(body.correo).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';

  if (typeof body.nombre !== 'string' || typeof body.correo !== 'string' || typeof body.password !== 'string') {
    throw new ApiError(400, 'nombre, correo y password deben ser texto');
  }
  const errores = [];
  if (nombre.length > 100) errores.push('El nombre no puede superar 100 caracteres');
  if (!REGEX_CORREO.test(correo) || correo.length > 150) errores.push('El correo no tiene un formato válido');
  if (password.length < 8) errores.push('La contraseña debe tener al menos 8 caracteres');
  if (errores.length > 0) throw new ApiError(422, 'Datos de registro inválidos', { errores });

  // Solo se devuelven los campos permitidos: cualquier "rol" enviado se ignora.
  return { nombre, correo, password };
}

function validarLogin(body) {
  exigirCampos(body, ['correo', 'password']);
  if (typeof body.correo !== 'string' || typeof body.password !== 'string') {
    throw new ApiError(400, 'correo y password deben ser texto');
  }
  return { correo: texto(body.correo).toLowerCase(), password: body.password };
}

function validarProducto(body) {
  exigirCampos(body, ['nombre', 'descripcion', 'categoria', 'precio']);
  const { nombre, descripcion, categoria, precio } = body;

  if (typeof nombre !== 'string' || typeof descripcion !== 'string' || typeof categoria !== 'string') {
    throw new ApiError(400, 'nombre, descripcion y categoria deben ser texto');
  }
  if (typeof precio !== 'number' && typeof precio !== 'string') {
    throw new ApiError(400, 'El precio debe ser numérico');
  }

  const errores = [];
  const precioNumero = Number(precio);
  if (!Number.isFinite(precioNumero) || precioNumero <= 0) errores.push('El precio debe ser un número mayor que cero');
  else if (precioNumero > 99999999.99) errores.push('El precio es demasiado alto');
  if (nombre.trim().length > 120) errores.push('El nombre no puede superar 120 caracteres');
  if (categoria.trim().length > 60) errores.push('La categoría no puede superar 60 caracteres');
  if (errores.length > 0) throw new ApiError(422, 'Datos del producto inválidos', { errores });

  // Solo se aceptan estos cuatro campos; el resto del cuerpo se descarta.
  return {
    nombre: nombre.trim(),
    descripcion: descripcion.trim(),
    categoria: categoria.trim(),
    precio: Math.round(precioNumero * 100) / 100,
  };
}

module.exports = { exigirCampos, validarId, validarRegistro, validarLogin, validarProducto };
