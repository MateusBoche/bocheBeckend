const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require("../middlewares/authMiddleware");

// Rota para cadastrar usuário
router.post('/cadastro', userController.cadastrarUsuario);
// Rota para login
router.post('/login', userController.loginUsuario);

// Rota protegida para buscar perfil do usuário autenticado
router.get('/perfil/me', authMiddleware.verificarToken, userController.perfilUsuario);


// Rota protegida para atualizar perfil do usuário autenticado
router.put("/perfil/me", authMiddleware.verificarToken, userController.atualizarPerfilUsuario);




module.exports = router;
