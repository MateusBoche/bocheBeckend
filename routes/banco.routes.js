// routes/banco.routes.js
const express = require('express');
const router = express.Router();
const bancoController = require('../controllers/bancoController');

// Rota para buscar todos os bancos de leite
router.get('/', bancoController.buscarTodos);

// Rota para buscar o banco mais próximo
router.post('/proximos', bancoController.buscarMaisProximo);

module.exports = router;
