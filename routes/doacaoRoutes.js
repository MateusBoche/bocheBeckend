const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const doacaoController = require('../controllers/doacaoController');

// Rota protegida para agendar doação
router.post('/doacoes', authMiddleware.verificarToken, doacaoController.agendarDoacao);

module.exports = router;
