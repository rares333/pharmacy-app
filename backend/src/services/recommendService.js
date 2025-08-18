// backend/src/services/recommendService.js
const { Pool } = require('pg');

// Use DATABASE_URL or fall back to env vars
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgres://pharmacy_user:1234@localhost:5432/pharmacy'
});

/**
 * recommendProducts(symptom)
 *   symptom: string (free-text from the user)
 * Returns: Array of product rows
 */
async function recommendProducts(symptom) {
  // Basic text search: find products whose name or active ingredient mentions the symptom
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

const db = require('../models'); // assuming you use Sequelize or a query builder

async function getRecommendations(symptomQuery) {
  // 1) find the symptom
  const symptom = await db.symptom.findOne({
    where: { code: symptomQuery.toLowerCase() }
  });
  if (!symptom) return [];

  // 2) fetch linked OTC products
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
