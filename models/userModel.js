const pool = require('../config/db');

// 👇 Classe para suportar o método save() no controller
class User {
    constructor(data) {
        this.id = data.id;
        this.nome = data.nome;
        this.telefone = data.telefone;
        this.senha = data.senha;
    }

    async save() {
        const query = `
            UPDATE usuario
            SET nome = $1, telefone = $2, senha = $3
            WHERE id = $4
        `;
        const values = [this.nome, this.telefone, this.senha, this.id];
        await pool.query(query, values);
    }
}

exports.buscarPorEmail = async (email) => {
    try {
        const result = await pool.query(
            "SELECT * FROM usuario WHERE email = $1",
            [email]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Erro ao buscar usuário por email:", error);
        throw error;
    }
};

// ✅ buscarPorId agora retorna um objeto com .save()
exports.buscarPorId = async (id) => {
    try {
        const result = await pool.query(
            "SELECT * FROM usuario WHERE id = $1",
            [id]
        );
        if (result.rows.length === 0) {
            return null;
        }
        return new User(result.rows[0]);
    } catch (error) {
        console.error("Erro ao buscar usuário por ID:", error);
        throw error;
    }
};

exports.buscarPorEmailOuCPF = async (email, cpf) => {
    const result = await pool.query(
        "SELECT * FROM usuario WHERE email = $1 OR cpf = $2",
        [email, cpf]
    );
    return result.rows[0];
};

exports.cadastrar = async (usuario) => {
    const {
        nome, email, telefone, cpf, senha,
        doadora, receptora, profissional,
        latitude, longitude, id_cidade
    } = usuario;

    const result = await pool.query(
        `INSERT INTO usuario
         (nome, email, telefone, cpf, senha, doadora, receptora, profissional, latitude, longitude, id_cidade)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [nome, email, telefone, cpf, senha, doadora, receptora, profissional, latitude, longitude, id_cidade]
    );

    return result.rows[0];
};

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

// Atualizar perfil do usuário
exports.atualizarPerfil = async (id, nome, telefone, novaSenhaHash = null) => {
    try {
        if (novaSenhaHash) {
            await pool.query(
                `UPDATE usuario
                 SET nome = $1, telefone = $2, senha = $3
                 WHERE id = $4`,
                [nome, telefone, novaSenhaHash, id]
            );
        } else {
            await pool.query(
                `UPDATE usuario
                 SET nome = $1, telefone = $2
                 WHERE id = $3`,
                [nome, telefone, id]
            );
        }
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        throw error;
    }
};

