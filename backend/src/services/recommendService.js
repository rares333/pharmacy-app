const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgres://pharmacy_user:1234@localhost:5432/pharmacy'
});


async function recommendProducts(symptom) {
  const text = `%${symptom.toLowerCase()}%`;
  const { rows } = await pool.query(
    `SELECT id, name, brand, dosage_form, pack_size, price_eur, stock_level, image_url
     FROM product
     WHERE LOWER(name) ILIKE $1
        OR LOWER(active_ingredient) ILIKE $1
     ORDER BY stock_level DESC, price_eur ASC
     LIMIT 10;`,
    [text]
  );
  return rows;
}

const db = require('../models'); 

async function getRecommendations(symptomQuery) {
  const symptom = await db.symptom.findOne({
    where: { code: symptomQuery.toLowerCase() }
  });
  if (!symptom) return [];

  const prods = await db.product.findAll({
    include: [{
      model: db.symptom,
      where: { id: symptom.id },
      through: { attributes: [] }
    }],
    where: { is_otc: true },
    limit: 20
  });

  return prods;
}

module.exports = { getRecommendations };


module.exports = { recommendProducts };
