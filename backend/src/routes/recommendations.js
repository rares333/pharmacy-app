const express = require('express');
const router  = express.Router();
const { getRecommendations } = require('../services/recommendService');

router.get('/', async (req, res) => {
  const { symptom } = req.query;
  if (!symptom) return res.status(400).json({ error: 'Missing symptom' });

  try {
    const recs = await getRecommendations(symptom);
    res.json(recs);
  } catch (err) {
    console.error('Recommender error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
