import os
import pandas as pd
from sqlalchemy import create_engine, text

def main():
    raw = os.getenv("DATABASE_URL","").strip()
    if raw.startswith("postgres://"):
        raw = raw.replace("postgres://","postgresql://",1)
    if not raw:
        raw = "postgresql+psycopg2://pharmacy_user:1234@localhost:5432/pharmacy"
    engine = create_engine(raw)
    print("→ Connecting to:", raw)

    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT DISTINCT unnest(matched_symptoms) AS symptom
              FROM product
             WHERE matched_symptoms IS NOT NULL
        """)).fetchall()

    names = [r[0].strip().lower() for r in rows if r[0] and r[0].strip()]
    df = pd.DataFrame({"name": sorted(set(names))})
    print(f"→ Exporting {len(df)} distinct symptoms to CSV")


    out = os.path.join(os.path.dirname(__file__), "../all_symptoms.csv")
    df.to_csv(out, index=False, encoding="utf-8")
    print("Wrote:", out)

if __name__=="__main__":
    main()
