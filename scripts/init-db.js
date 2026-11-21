// Crea las tablas y carga los productos de ejemplo ejecutando database/schema.sql.
// Uso: npm run db:init   (ADVERTENCIA: reinicia todos los datos)
const fs = require('fs');
const path = require('path');
const db = require('../src/config/db');

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8');
  await db.query(sql);
  const { rows } = await db.query('SELECT COUNT(*)::int AS total FROM productos');
  console.log(`Base de datos inicializada. Productos de ejemplo: ${rows[0].total}`);
}

main()
  .catch((error) => {
    console.error('Error al inicializar la base de datos:', error.message);
    process.exitCode = 1;
  })
  .finally(() => db.pool.end());
