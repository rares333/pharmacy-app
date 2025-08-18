// scripts/fetch_and_assign_images.mjs
import fetch from 'node-fetch';
import { Pool } from 'pg';

const GOOGLE_API_KEY = 'this was deleted for safety reason before';
const GOOGLE_CX      = 'this was deleted for safety reason before';

function buildSearchUrl(query) {
  const params = new URLSearchParams({
    key: GOOGLE_API_KEY,
    cx:  GOOGLE_CX,
    q:   query,
    searchType: 'image',
    num: '1',
  });
  return `https://www.googleapis.com/customsearch/v1?${params}`;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgres://pharmacy_user:1234@localhost:5432/pharmacy'
});

async function lookupImage(medicineName) {
  const url = buildSearchUrl(medicineName);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google API returned ${res.status}`);
  const json = await res.json();
  const first = json.items && json.items[0];
  return first && first.link;
}

async function main() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT id, name
         FROM product
        WHERE image_url IS NULL`
    );
    console.log(`Found ${rows.length} products without images…`);

    for (let { id, name } of rows) {
      try {
        const img = await lookupImage(name);
        if (img) {
          await client.query(
            `UPDATE product SET image_url = $1 WHERE id = $2`,
            [img, id]
          );
          console.log(`#${id} "${name}" → image assigned`);
        } else {
          console.log(`#${id} "${name}" → no image found`);
        }
      } catch (err) {
        console.warn(`#${id} "${name}" → lookup failed: ${err.message}`);
      }
      await new Promise(r => setTimeout(r, 200));
    }

    console.log('All done.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
