const { Router } = require('express');
const controlador = require('../controllers/productos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

// Consulta pública del catálogo
router.get('/', controlador.listar);
router.get('/:id', controlador.obtener);

// Modificación del catálogo: requiere token válido y rol admin
router.post('/', verificarToken, requiereRol('admin'), controlador.crear);
router.put('/:id', verificarToken, requiereRol('admin'), controlador.actualizar);
router.delete('/:id', verificarToken, requiereRol('admin'), controlador.eliminar);

module.exports = router;
