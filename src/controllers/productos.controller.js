// Controlador de productos (catálogo).
const Producto = require('../models/producto.model');
const ApiError = require('../utils/ApiError');
const { validarId, validarProducto } = require('../utils/validaciones');

// GET /api/productos?categoria=Hogar  (público)
async function listar(req, res) {
  const categoria = typeof req.query.categoria === 'string' ? req.query.categoria.trim() : '';
  const productos = await Producto.listar(categoria || null);
  return res.status(200).json({ ok: true, total: productos.length, data: productos });
}

// GET /api/productos/:id  (público)
async function obtener(req, res) {
  const id = validarId(req.params.id);
  const producto = await Producto.buscarPorId(id);
  if (!producto) throw new ApiError(404, 'Producto no encontrado');
  return res.status(200).json({ ok: true, data: producto });
}

// POST /api/productos  (solo admin)
async function crear(req, res) {
  const datos = validarProducto(req.body);
  const producto = await Producto.crear(datos);
  return res.status(201).json({ ok: true, mensaje: 'Producto creado', data: producto });
}

// PUT /api/productos/:id  (solo admin) - reemplaza los cuatro campos del producto
async function actualizar(req, res) {
  const id = validarId(req.params.id);
  const datos = validarProducto(req.body);
  const producto = await Producto.actualizar(id, datos);
  if (!producto) throw new ApiError(404, 'Producto no encontrado');
  return res.status(200).json({ ok: true, mensaje: 'Producto actualizado', data: producto });
}

// DELETE /api/productos/:id  (solo admin)
// Al eliminar un producto también se eliminan los favoritos que lo referencian (ON DELETE CASCADE).
async function eliminar(req, res) {
  const id = validarId(req.params.id);
  const eliminado = await Producto.eliminar(id);
  if (!eliminado) throw new ApiError(404, 'Producto no encontrado');
  return res.status(204).send();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
