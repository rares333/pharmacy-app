import os
import pandas as pd
from sqlalchemy import create_engine, text

raw = os.getenv("DATABASE_URL", "").strip()
if raw.startswith("postgres://"):
    raw = raw.replace("postgres://", "postgresql://", 1)
if not raw:
    raw = "postgresql+psycopg2://pharmacy_user:1234@localhost:5432/pharmacy"

engine = create_engine(raw, echo=False)
print("Using DATABASE_URL:", raw)

with engine.connect() as conn:
    rows = conn.execute(text("SELECT matched_symptoms FROM product WHERE matched_symptoms IS NOT NULL")).fetchall()

all_lists = [r[0] for r in rows]         
flat = [s.strip() for lst in all_lists for s in lst if isinstance(lst, list)]
symptoms = sorted(set(flat))

out_df = pd.DataFrame({"name": symptoms})
out_csv = os.path.join(os.getcwd(), "all_symptoms.csv")
out_df.to_csv(out_csv, index=False, encoding="utf-8")
print(f"Exported {len(symptoms)} distinct symptoms to {out_csv}")
