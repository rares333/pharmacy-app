const express = require('express');
const router = express.Router();
const recRouter = require('./recommendations');
const recommendationsRouter = require('./recommendations');
const symptomsRouter       = require('./symptoms');
router.use('/recommendations', recRouter);

router.use('/symptom_suggestions', symptomsRouter);
router.use('/recommendations', recommendationsRouter);


router.get('/symptoms/suggest', async (req, res) => {
  const q = req.query.q;
  const rows = await db.query(
    `SELECT DISTINCT symptom FROM your_symptoms_table
     WHERE symptom ILIKE $1
     ORDER BY symptom
     LIMIT 10`,
    [`${q}%`]
  );
  res.json(rows.rows.map(r => r.symptom));
});

module.exports = router;