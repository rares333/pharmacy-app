import fetch from 'node-fetch';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const GOOGLE_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX  = process.env.GOOGLE_CX;
if (!GOOGLE_KEY || !GOOGLE_CX) {
  console.error('Missing GOOGLE_API_KEY or GOOGLE_CX in .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function lookupImage(q) {
  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.set('key', GOOGLE_KEY);
  url.searchParams.set('cx', GOOGLE_CX);
  url.searchParams.set('searchType', 'image');
  url.searchParams.set('num', '1');
  url.searchParams.set('q', q);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google API ${res.status}`);
  const data = await res.json();
  return data.items?.[0]?.link || null;
}

async function main() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT id, name FROM product WHERE image_url IS NULL`
    );
    console.log(`Found ${rows.length} products without images…`);

    for (let { id, name } of rows) {
      let img = null;
      try {
        img = await lookupImage(name);
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
