const pool = require('../config/db');


exports.agendarDoacao = async (req, res) => {
  const { id_bancos_de_leite, quantidade_ml, data_doacao } = req.body;
  const id_usuario = req.usuario.id; // Pega o ID do usuário autenticado

  try {
    const result = await pool.query(
      'INSERT INTO doacao (id_usuario, id_bancos_de_leite, quantidade_ml, data_doacao) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_usuario, id_bancos_de_leite, quantidade_ml, data_doacao]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao agendar doação:', error);
    res.status(500).json({ error: 'Erro ao agendar doação' });
  }
};
