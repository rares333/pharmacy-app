import os
import pandas as pd
from sqlalchemy import create_engine, text

def main():
    raw = os.getenv("DATABASE_URL", "").strip()
    if raw.startswith("postgres://"):
        raw = raw.replace("postgres://", "postgresql://", 1)
    if not raw:
        raw = "postgresql+psycopg2://pharmacy_user:1234@localhost:5432/pharmacy"
    engine = create_engine(raw)
    print("→ Connecting to:", raw)

    csv_path = os.path.join(os.path.dirname(__file__), "../all_symptoms.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Could not find symptoms CSV at {csv_path}")
    df = pd.read_csv(csv_path, usecols=["name"])
    df["name"] = df["name"].str.strip().str.lower()
    df = df.dropna().drop_duplicates()

    print(f"→ Loaded {len(df)} unique symptom names from CSV")

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS tmp_symptoms"))
        conn.execute(text("CREATE TEMP TABLE tmp_symptoms(name TEXT)"))

        df.to_sql("tmp_symptoms", conn, if_exists="append", index=False, method="multi")
        print("→ Inserted into tmp_symptoms")

        stmt = """
        INSERT INTO symptom_lookup(name)
          SELECT name FROM tmp_symptoms
        ON CONFLICT (name) DO NOTHING;
        """
        result = conn.execute(text(stmt))
        print(f"Upserted {result.rowcount} new symptoms into symptom_lookup")

    print("All done.")

if __name__ == "__main__":
    main()
