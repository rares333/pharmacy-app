
const express = require('express');
const cors    = require('cors');
const { Pool } = require('pg');

const app  = express();
const port = process.env.PORT || 8000;


app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://pharmacy_user:1234@localhost:5432/pharmacy'
});


function shapeRow(r) {
  return {
    id:           r.id,
    name:         r.name,
    brand:        r.brand,
    price_eur:    r.price_eur,
    in_stock:     true,                      
    image_url:    r.image_url,
    is_otc:       r.is_otc,
    indications:  r.actiune_terapeutica || '—',
    dosage:       r.volum_ambalaj           || '—',
    category:     r.category                 || null
  };
}


/**
 * GET /api/recommendations?symptom=...
 */
app.get('/api/recommendations', async (req, res) => {
  const { symptom } = req.query;
  if (!symptom) {
    return res.status(400).json({ error: 'Missing symptom parameter' });
  }

  const term   = symptom.toLowerCase().trim();
  const tokens = term.split(/\s+/).filter(t => t.length >= 2);

  try {
    let rows = [];

    if (tokens.length) {
      const patterns = tokens.map(t => `%${t}%`);
      const directQ = `
        WITH matched AS (
          SELECT
            id, name, brand, price_eur, stock_level,
            image_url, is_otc,
            actiune_terapeutica,
            volum_ambalaj,
            category,
            ROW_NUMBER() OVER (
              PARTITION BY name
              ORDER BY stock_level DESC
            ) AS rn
          FROM product, unnest(matched_symptoms) AS s
          WHERE s ILIKE ANY($1::text[])
        )
        SELECT
          id, name, brand, price_eur, stock_level,
          image_url, is_otc,
          actiune_terapeutica,
          volum_ambalaj,
          category
        FROM matched
        WHERE rn = 1
        LIMIT 50;
      `;
      ({ rows } = await pool.query(directQ, [patterns]));
    }

    if (rows.length === 0) {
      const likeExpr = `%${term}%`;
      const fuzzyQ = `
        WITH fuzzy AS (
          SELECT
            id, name, brand, price_eur, stock_level,
            image_url, is_otc,
            actiune_terapeutica,
            volum_ambalaj,
            category,
            ROW_NUMBER() OVER (
              PARTITION BY name
              ORDER BY stock_level DESC
            ) AS rn
          FROM product
          WHERE LOWER(name) ILIKE $1
             OR LOWER(active_ingredient) ILIKE $1
        )
        SELECT
          id, name, brand, price_eur, stock_level,
          image_url, is_otc,
          actiune_terapeutica,
          volum_ambalaj,
          category
        FROM fuzzy
        WHERE rn = 1
        LIMIT 50;
      `;
      ({ rows } = await pool.query(fuzzyQ, [likeExpr]));
    }

    return res.json(rows.map(shapeRow));
  } catch (err) {
    console.error('recommendations error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * GET /api/symptom_suggestions?q=...
 */
app.get('/api/symptom_suggestions', async (req, res) => {
  const { q } = req.query;
  const term = (typeof q === 'string' ? q.trim().toLowerCase() : '');
  if (!term) return res.json([]);

  const likeExpr = `%${term}%`;

  try {
    const { rows } = await pool.query(
      `
      SELECT name
        FROM symptom_lookup
       WHERE name ILIKE $1
       ORDER BY name
       LIMIT 10;
      `,
      [likeExpr]              // <-- actually use the %term% here
    );
    const suggestions = rows.map(r => r.name);
    console.log(`→ suggestions for "${term}" →`, suggestions);
    return res.json(suggestions);
  } catch (err) {
    console.error('suggestions error:', err);
    return res.status(500).json([]);
  }
});


/**
 * GET /api/group/:category
 * Fetch all products in a given category.
 */
app.get('/api/group/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const { rows } = await pool.query(
      `
      SELECT
        id, name, brand, price_eur, stock_level,
        image_url, is_otc,
        actiune_terapeutica, volum_ambalaj, category
      FROM product
      WHERE category ILIKE $1
      ORDER BY stock_level DESC
      LIMIT 100;
      `,
      [category]            
    );

    return res.json(rows.map(shapeRow));
  } catch (err) {
    console.error('group fetch failed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



/**
 * POST /api/orders
 * Body: { cardId?: string, items: { id: number, quantity: number }[] }
 */
app.post('/api/orders', async (req, res) => {
  const { cardId, items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart must contain at least one item.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      `INSERT INTO orders(card_id) VALUES($1) RETURNING id`,
      [cardId || null]
    );
    const orderId = orderRes.rows[0].id;

    const placeholders = items
      .map((_, idx) => `($1, $${2 + idx*2}, $${3 + idx*2})`)
      .join(',');
    const values = [
      orderId,
      ...items.flatMap(it => [it.id, it.quantity])
    ];
    await client.query(
      `INSERT INTO order_item(order_id, product_id, quantity) VALUES ${placeholders}`,
      values
    );

    await client.query('COMMIT');
    return res.status(201).json({ orderId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('order creation failed:', err.stack || err);
    return res.status(500).json({ error: err.message || 'Failed to create order.' });
  } finally {
    client.release();
  }
});


/**
 * GET /api/admin/orders
 * Fetch all orders (aggregated view).
 */
app.get('/api/admin/orders', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        o.id            AS order_id,
        o.card_id,
        o.created_at,
        array_agg(oi.product_id ORDER BY oi.product_id) AS product_ids,
        array_agg(oi.quantity   ORDER BY oi.product_id) AS quantities
      FROM orders o
      JOIN order_item oi ON oi.order_id = o.id
      GROUP BY o.id, o.card_id, o.created_at
      ORDER BY o.id DESC;
    `);
    return res.json(rows);
  } catch (err) {
    console.error('admin/orders error:', err);
    return res.status(500).json({ error: 'Could not fetch orders' });
  }
});


app.get('/api/categories', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT category
        FROM product
       WHERE category IS NOT NULL
         AND category <> 'Altele'
       ORDER BY category
    `);
    const cats = rows.map(r => r.category);
    res.json(cats);
  } catch (err) {
    console.error('categories error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(port, () =>
  console.log(`Listening on http://localhost:${port}`)
);
