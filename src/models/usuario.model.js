// Acceso a datos de la tabla usuarios.
const db = require('../config/db');

// Columnas públicas: nunca se incluye password_hash en lo que se devuelve al cliente.
const COLUMNAS_PUBLICAS = 'id, nombre, correo, rol, creado_en';

async function crear({ nombre, correo, passwordHash, rol = 'usuario' }) {
  const { rows } = await db.query(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNAS_PUBLICAS}`,
    [nombre, correo, passwordHash, rol]
  );
  return rows[0];
}

// Uso interno (login): sí trae el hash para compararlo, pero no se envía al cliente.
async function buscarPorCorreoConHash(correo) {
  const { rows } = await db.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
  return rows[0] || null;
}

module.exports = { crear, buscarPorCorreoConHash, COLUMNAS_PUBLICAS };
