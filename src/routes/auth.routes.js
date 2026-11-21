const { Router } = require('express');
const controlador = require('../controllers/auth.controller');

const router = Router();

router.post('/registro', controlador.registro); // Público
router.post('/login', controlador.login);       // Público

module.exports = router;
