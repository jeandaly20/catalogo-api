// Controlador de autenticación: registro e inicio de sesión.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');
const ApiError = require('../utils/ApiError');
const { validarRegistro, validarLogin } = require('../utils/validaciones');
const { jwt: config } = require('../config/env');

const RONDAS_BCRYPT = 10;

// POST /api/auth/registro
async function registro(req, res) {
  const { nombre, correo, password } = validarRegistro(req.body);
  const passwordHash = await bcrypt.hash(password, RONDAS_BCRYPT);

  try {
    // El rol se fija en 'usuario': el registro público nunca crea administradores.
    const usuario = await Usuario.crear({ nombre, correo, passwordHash, rol: 'usuario' });
    return res.status(201).json({ ok: true, mensaje: 'Usuario registrado correctamente', data: usuario });
  } catch (error) {
    if (error.code === '23505') {
      // 23505 = violación de restricción UNIQUE (correo ya registrado)
      throw new ApiError(409, 'El correo ya está registrado');
    }
    throw error;
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { correo, password } = validarLogin(req.body);
  const usuario = await Usuario.buscarPorCorreoConHash(correo);

  // Mismo mensaje si el correo no existe o la contraseña es incorrecta (no revela cuál falló).
  const valido = usuario && (await bcrypt.compare(password, usuario.password_hash));
  if (!valido) throw new ApiError(401, 'Credenciales incorrectas');

  const token = jwt.sign({ sub: String(usuario.id), rol: usuario.rol }, config.secret, {
    expiresIn: config.expiresIn,
    algorithm: 'HS256',
  });

  return res.status(200).json({
    ok: true,
    mensaje: 'Inicio de sesión exitoso',
    data: {
      token,
      tipo: 'Bearer',
      expiraEn: config.expiresIn,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    },
  });
}

module.exports = { registro, login };
