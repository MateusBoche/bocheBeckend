const pool = require('../config/db');

exports.buscarMaisProximo = async (req, res) => {
  let { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude e longitude são obrigatórias' });
  }

  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Latitude e longitude devem ser números válidos' });
  }

  try {
    const query = `
      SELECT *,
        (6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude))
        )) AS distancia
      FROM bancos_de_leite
      ORDER BY distancia ASC
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [latitude, longitude]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nenhum banco de leite encontrado' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('Erro ao buscar banco de leite mais próximo:', error);
    res.status(500).json({
      error: 'Erro no servidor',
      detalhe: error.message
    });
  }
};

// ✅ NOVO MÉTODO para retornar todos os bancos de leite
exports.buscarTodos = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM bancos_de_leite');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar todos os bancos de leite:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};
