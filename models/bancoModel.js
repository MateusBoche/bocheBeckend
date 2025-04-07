// backend-donate/models/bancoModel.js

const pool = require('../config/db');

// ✅ Buscar todos os bancos de leite
exports.buscarTodos = async () => {
    try {
        const result = await pool.query("SELECT * FROM banco_leite");
        return result.rows;
    } catch (error) {
        console.error("Erro ao buscar bancos de leite:", error);
        throw error;
    }
};

// ✅ Buscar banco mais próximo com base em latitude e longitude (dado um raio de busca em km)
exports.buscarMaisProximo = async (latitude, longitude, raio_km = 10) => {
    try {
        const result = await pool.query(
            `
            SELECT *,
                (6371 * acos(
                    cos(radians($1)) *
                    cos(radians(latitude)) *
                    cos(radians(longitude) - radians($2)) +
                    sin(radians($1)) *
                    sin(radians(latitude))
                )) AS distancia
            FROM banco_leite
            HAVING (6371 * acos(
                    cos(radians($1)) *
                    cos(radians(latitude)) *
                    cos(radians(longitude) - radians($2)) +
                    sin(radians($1)) *
                    sin(radians(latitude))
                )) <= $3
            ORDER BY distancia ASC
            LIMIT 1
            `,
            [latitude, longitude, raio_km]
        );

        return result.rows[0]; // retorna o banco mais próximo
    } catch (error) {
        console.error("Erro ao buscar banco de leite mais próximo:", error);
        throw error;
    }
};

// ✅ Cadastrar um novo banco de leite
exports.cadastrar = async (banco) => {
    const { nome, endereco, telefone, latitude, longitude, id_cidade } = banco;

    const result = await pool.query(
        `INSERT INTO banco_leite
         (nome, endereco, telefone, latitude, longitude, id_cidade)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [nome, endereco, telefone, latitude, longitude, id_cidade]
    );

    return result.rows[0];
};
