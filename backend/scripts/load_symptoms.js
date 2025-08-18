

const path = require("path");
const fs   = require("fs");
const { Pool } = require("pg");

async function main() {
  const csvPath = path.resolve(__dirname, "D:pharma/backend/all_symptoms.csv");
  if (!fs.existsSync(csvPath)) {
    console.error(`${csvPath}`);
    process.exit(1);
  }

  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgres://pharmacy_user:1234@localhost:5432/pharmacy",
  });

  const client = await pool.connect();
  try {

    await client.query(`DROP TABLE IF EXISTS tmp_symptoms;`);
    await client.query(`CREATE TEMP TABLE tmp_symptoms(name text);`);

    const copyFrom = `COPY tmp_symptoms(name)
                      FROM STDIN WITH (FORMAT csv, HEADER true)`;
    const stream = client.query(copyFrom);
    const fileStream = fs.createReadStream(csvPath);
    fileStream.pipe(stream);
    await new Promise((resolve, reject) => {
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    await client.query(`
      INSERT INTO symptom_lookup(name)
        SELECT DISTINCT name
          FROM tmp_symptoms
      ON CONFLICT (name) DO NOTHING
    `);

    console.log("Loaded symptoms into symptom_lookup");
  } catch (err) {
    console.error(" Failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
