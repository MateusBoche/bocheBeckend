const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const segredo = process.env.JWT_SECRET;

exports.cadastrarUsuario = async (req, res) => {
    try {
        const {
            nome,
            email,
            telefone,
            cpf,
            senha,
            doadora,
            receptora,
            profissional,
            latitude,
            longitude,
            id_cidade
        } = req.body;

        const usuarioExistente = await User.buscarPorEmailOuCPF(email, cpf);
        if (usuarioExistente) {
            return res.status(400).json({ message: "Usuário já cadastrado com esse e-mail ou CPF." });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const novoUsuario = await User.cadastrar({
            nome,
            email,
            telefone,
            cpf,
            senha: senhaHash,
            doadora,
            receptora,
            profissional,
            latitude: latitude || null,
            longitude: longitude || null,
            id_cidade
        });

        res.status(201).json({ message: "Usuário cadastrado com sucesso!", usuario: novoUsuario });

    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        res.status(500).json({ message: "Erro ao cadastrar usuário" });
    }
};

exports.loginUsuario = async (req, res) => {
    try {
        const { email, senha, latitude, longitude } = req.body;

        const usuario = await User.buscarPorEmail(email);
        if (!usuario) {
            return res.status(401).json({ message: "Usuário ou senha inválidos" });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ message: "Usuário ou senha inválidos" });
        }

        // Atualiza localização ao logar
        if (latitude && longitude) {
            await User.atualizarLocalizacao(usuario.id, latitude, longitude);
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET || 'chave_secreta_super_segura',
            { expiresIn: '2h' }
        );

        res.json({ message: "Login realizado com sucesso!", token });

    } catch (error) {
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ message: "Erro ao fazer login" });
    }
};

exports.verificarToken = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Acesso negado! Token não fornecido." });
    }

    try {
        const tokenSemBearer = token.replace("Bearer ", "");
        const decodificado = jwt.verify(tokenSemBearer, process.env.JWT_SECRET);
        req.usuario = decodificado;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token inválido!" });
    }
};

exports.perfilUsuario = async (req, res) => {
    try {
        const usuario = req.usuario;

        if (!usuario) {
            return res.status(404).json({ message: "Usuário não encontrado!" });
        }

        res.json({ message: "Perfil do usuário", usuario });
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar perfil", error });
    }
};

// Atualizar perfil do usuário autenticado
exports.atualizarPerfilUsuario = async (req, res) => {
    try {
        const { nome, telefone, senha_antiga, nova_senha } = req.body;

        const usuario = await User.buscarPorId(req.usuario.id);
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }

        let novaHash = null;

        // Verifica senha antiga se for trocar senha
        if (nova_senha) {
            if (!senha_antiga) {
                return res.status(400).json({ erro: 'Senha antiga obrigatória para trocar a senha.' });
            }

            const senhaCorreta = await bcrypt.compare(senha_antiga, usuario.senha);
            if (!senhaCorreta) {
                return res.status(401).json({ erro: 'Senha antiga incorreta.' });
            }

            novaHash = await bcrypt.hash(nova_senha, 10);
        }

        await User.atualizarPerfil(req.usuario.id, nome, telefone, novaHash);

        return res.status(200).json({ mensagem: 'Perfil atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return res.status(500).json({ erro: 'Erro ao atualizar perfil.' });
    }
};
