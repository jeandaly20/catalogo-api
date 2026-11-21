// Acceso a datos de la tabla favoritos.
// Todas las consultas filtran por usuario_id, que proviene del token verificado.
const db = require('../config/db');

async function listarPorUsuario(usuarioId) {
  const { rows } = await db.query(
    `SELECT p.id, p.nombre, p.descripcion, p.categoria, p.precio::float AS precio, f.agregado_en
       FROM favoritos f
       JOIN productos p ON p.id = f.producto_id
      WHERE f.usuario_id = $1
      ORDER BY f.agregado_en`,
    [usuarioId]
  );
  return rows;
}

async function agregar(usuarioId, productoId) {
  const { rows } = await db.query(
    `INSERT INTO favoritos (usuario_id, producto_id)
     VALUES ($1, $2)
     RETURNING usuario_id, producto_id, agregado_en`,
    [usuarioId, productoId]
  );
  return rows[0];
}

// Solo borra si el favorito pertenece al usuario autenticado.
async function quitar(usuarioId, productoId) {
  const { rowCount } = await db.query(
    'DELETE FROM favoritos WHERE usuario_id = $1 AND producto_id = $2',
    [usuarioId, productoId]
  );
  return rowCount > 0;
}

module.exports = { listarPorUsuario, agregar, quitar };
