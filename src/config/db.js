// Pool de conexiones a PostgreSQL usando la librería pg.
const { Pool } = require('pg');
const { db } = require('./env');

const pool = new Pool(db);

module.exports = {
  // Todas las consultas usan parámetros ($1, $2...) para evitar inyección SQL.
  query: (texto, parametros) => pool.query(texto, parametros),
  pool,
};
