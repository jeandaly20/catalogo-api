// Configuración de la aplicación Express.
const express = require('express');
const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const favoritosRoutes = require('./routes/favoritos.routes');
const { rutaNoEncontrada, manejarErrores } = require('./middlewares/errores');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

// Garantiza que req.body siempre sea un objeto (evita errores si llega vacío o como arreglo).
app.use((req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) req.body = {};
  next();
});

app.get('/api', (req, res) => {
  res.json({ ok: true, mensaje: 'API Catálogo de productos funcionando' });
});

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/favoritos', favoritosRoutes);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

module.exports = app;
