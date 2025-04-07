const pool = require('../config/db');

exports.buscarPorEmail = async (email) => {
    try {
        const result = await pool.query(
            "SELECT * FROM usuario WHERE email = $1",
            [email]
        );
        return result.rows[0]; // Retorna o primeiro usuário encontrado
    } catch (error) {
        console.error("Erro ao buscar usuário por email:", error);
        throw error;
    }
};

// Função para buscar usuário pelo email ou CPF
exports.buscarPorEmailOuCPF = async (email, cpf) => {
    const result = await pool.query(
        "SELECT * FROM usuario WHERE email = $1 OR cpf = $2",
        [email, cpf]
    );
    return result.rows[0]; // Retorna o usuário encontrado ou undefined
};

// Função para cadastrar usuário
exports.cadastrar = async (usuario) => {
    const { nome, email, telefone, cpf, senha, doadora, receptora, profissional, latitude, longitude, id_cidade } = usuario;

    const result = await pool.query(
        `INSERT INTO usuario
         (nome, email, telefone, cpf, senha, doadora, receptora, profissional, latitude, longitude, id_cidade)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [nome, email, telefone, cpf, senha, doadora, receptora, profissional, latitude, longitude, id_cidade]
    );

    return result.rows[0];
};

// ✅ Função para atualizar localização do usuário ao fazer login
exports.atualizarLocalizacao = async (idUsuario, latitude, longitude) => {
    try {
        await pool.query(
            `UPDATE usuario
             SET latitude = $1, longitude = $2
             WHERE id = $3`,
            [latitude, longitude, idUsuario]
        );
    } catch (error) {
        console.error("Erro ao atualizar localização do usuário:", error);
        throw error;
    }
};
