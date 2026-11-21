// Genera un JWT correctamente firmado pero YA VENCIDO, para probar el rechazo 401 en Postman.
// Uso: npm run token:vencido   -> copie el resultado en la variable "token_vencido" del entorno.
require('../src/config/env');
const jwt = require('jsonwebtoken');

const haceDosHoras = Math.floor(Date.now() / 1000) - 2 * 60 * 60;
const token = jwt.sign(
  { sub: '1', rol: 'usuario', iat: haceDosHoras, exp: haceDosHoras + 60 },
  process.env.JWT_SECRET,
  { algorithm: 'HS256' }
);

console.log(token);
