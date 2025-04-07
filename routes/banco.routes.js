// routes/banco.routes.js
const express = require('express');
const router = express.Router();
const bancoController = require('../controllers/bancoController');

// De: router.get('/proximos', bancoController.buscarMaisProximo);
// Para:
router.post('/proximos', bancoController.buscarMaisProximo);

module.exports = router;
