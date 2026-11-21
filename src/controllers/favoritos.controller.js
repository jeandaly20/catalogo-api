// Controlador de favoritos del usuario autenticado.
// El id del usuario siempre se toma de req.usuario (token verificado), nunca del cliente.
const Favorito = require('../models/favorito.model');
const Producto = require('../models/producto.model');
const ApiError = require('../utils/ApiError');
const { exigirCampos, validarId } = require('../utils/validaciones');

// GET /api/favoritos
async function listar(req, res) {
  const favoritos = await Favorito.listarPorUsuario(req.usuario.id);
  return res.status(200).json({ ok: true, total: favoritos.length, data: favoritos });
}

// POST /api/favoritos   body: { "productoId": 1 }
async function agregar(req, res) {
  exigirCampos(req.body, ['productoId']);
  const productoId = validarId(req.body.productoId, 'productoId');

  const producto = await Producto.buscarPorId(productoId);
  if (!producto) throw new ApiError(404, 'El producto no existe');

  try {
    const favorito = await Favorito.agregar(req.usuario.id, productoId);
    return res.status(201).json({ ok: true, mensaje: 'Producto agregado a favoritos', data: { ...favorito, producto } });
  } catch (error) {
    if (error.code === '23505') throw new ApiError(409, 'El producto ya está en sus favoritos');
    if (error.code === '23503') throw new ApiError(404, 'El producto no existe');
    throw error;
  }
}

// DELETE /api/favoritos/:productoId
async function quitar(req, res) {
  const productoId = validarId(req.params.productoId, 'productoId');
  const eliminado = await Favorito.quitar(req.usuario.id, productoId);
  // Si el favorito no existe para ESTE usuario se responde 404 (no se revela si otro usuario lo tiene).
  if (!eliminado) throw new ApiError(404, 'El producto no está en sus favoritos');
  return res.status(204).send();
}

module.exports = { listar, agregar, quitar };
