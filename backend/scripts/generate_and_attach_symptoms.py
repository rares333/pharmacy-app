# backend/scripts/generate_and_attach_symptoms.py

import os
import re
import pandas as pd
from sqlalchemy import create_engine, text

# 0) Build the DB URL
raw = os.getenv("DATABASE_URL", "").strip()
if raw.startswith("postgres://"):
    raw = raw.replace("postgres://", "postgresql://", 1)
if not raw:
    raw = "postgresql+psycopg2://pharmacy_user:1234@localhost:5432/pharmacy"

engine = create_engine(raw)
print("Using DATABASE_URL:", raw)

# 1) Load your full nomenclator.csv (with original headers)
csv_path = r"D:/date/nomenclator.csv"
df = pd.read_csv(csv_path, encoding="utf-8", delimiter=",")

# 2) Rename the key column so we can later join on cod_cim
df = df.rename(columns={
    'Cod CIM': 'cod_cim',
    # if you want you can rename 'Actiune terapeutica' too, 
    # but we'll just refer to it by its original name below
})

# 3) Fetch the symptom list out of symptom_lookup.name
with engine.connect() as conn:
    rows = conn.execute(text("SELECT name FROM symptom_lookup")).fetchall()
symptoms = [r[0] for r in rows]
print(f"Loaded {len(symptoms)} distinct symptoms from DB")

# 4) Build one big regex: \b(term1|term2|...)\b, longest-first
escaped = sorted((re.escape(s) for s in symptoms), key=len, reverse=True)
pattern = re.compile(r"\b(" + "|".join(escaped) + r")\b", flags=re.IGNORECASE)

# 5) Lowercase your “Actiune terapeutica” text once
therapeutic = df["Actiune terapeutica"].fillna("").astype(str)

# 6) For each row, find all non‐overlapping symptom hits
def find_matches(text: str):
    return list({m.group(1).lower() for m in pattern.finditer(text)})

print("Scanning descriptions for symptom matches…")
df["matched_symptoms"] = therapeutic.map(find_matches)

# 7) Write out a new **two‐column** CSV for psql \copy
out_csv = os.path.join(os.getcwd(), "nomenclator_two_cols.csv")
df.loc[:, ["cod_cim", "matched_symptoms"]].to_csv(
    out_csv, index=False, encoding="utf-8"
)
print("✅ Wrote two-column CSV:", out_csv)
