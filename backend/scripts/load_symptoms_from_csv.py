# backend/scripts/load_symptoms_from_csv.py
import os
import sys
import pandas as pd
from sqlalchemy import create_engine, text

def main():
    # 0) configure
    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'all_symptoms.csv'))
    if not os.path.exists(csv_path):
        print(f"Could not find your symptom CSV at {csv_path}", file=sys.stderr)
        sys.exit(1)


    raw = os.getenv("DATABASE_URL", "").strip()
    if raw.startswith("postgres://"):
        raw = raw.replace("postgres://", "postgresql://", 1)
    if not raw:
        raw = "postgresql+psycopg2://pharmacy_user:1234@localhost:5432/pharmacy"
    engine = create_engine(raw)
    print("Using DATABASE_URL:", raw)

    with engine.begin() as conn:

        conn.execute(text("DROP TABLE IF EXISTS tmp_symptoms;"))
        conn.execute(text("CREATE TEMP TABLE tmp_symptoms(name TEXT);"))


        raw_conn = conn.connection
        cur = raw_conn.cursor()
        with open(csv_path, 'r', encoding='utf-8') as f:
            cur.copy_expert(
                "COPY tmp_symptoms(name) FROM STDIN WITH CSV HEADER DELIMITER ','",
                f
            )
        raw_conn.commit()
        print("→ loaded CSV into tmp_symptoms")

        conn.execute(text("""
          INSERT INTO symptom_lookup(name)
          SELECT DISTINCT lower(trim(name))
            FROM tmp_symptoms
          ON CONFLICT (name) DO NOTHING;
        """))
        print("symptom_lookup has been seeded/updated from CSV")

    engine.dispose()

if __name__ == '__main__':
    main()
