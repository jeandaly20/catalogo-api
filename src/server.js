// Punto de entrada: comprueba la conexión a la base de datos y levanta el servidor.
const { port } = require('./config/env');
const db = require('./config/db');
const app = require('./app');

async function iniciar() {
  try {
    await db.query('SELECT 1');
    console.log('Conexión a PostgreSQL establecida');
  } catch (error) {
    console.error('No se pudo conectar a PostgreSQL. Revise las variables DB_* del archivo .env');
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}/api`);
  });
}

iniciar();
