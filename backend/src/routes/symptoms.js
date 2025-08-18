const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT active_ingredient AS suggestion
       FROM product
       WHERE active_ingredient ILIKE $1
       ORDER BY active_ingredient
       LIMIT 10`, [`%${q}%`]
    );
    res.json(rows.map(r => r.suggestion));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

module.exports = router;
