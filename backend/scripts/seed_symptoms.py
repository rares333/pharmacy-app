import os
import pandas as pd
from sqlalchemy import create_engine, text

CSV_PATH = r'D:/date/nomenclator.csv'

df = pd.read_csv(
    CSV_PATH,
    usecols=['Actiune terapeutica'],
    encoding='utf-8',
    delimiter=','
)

symptoms = (
    df['Actiune terapeutica']
      .dropna()
      .str.strip()
      .str.lower()            
      .drop_duplicates()
      .tolist()
)

DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql://pharmacy_user:1234@localhost:5432/pharmacy'
)
engine = create_engine(DATABASE_URL)

with engine.begin() as conn:
    for name in symptoms:
        conn.execute(
            text("""
              INSERT INTO symptom_lookup(name)
              VALUES (:name)
              ON CONFLICT DO NOTHING
            """),
            {'name': name}
        )

print(f"Seeded {len(symptoms)} distinct symptoms into `symptom_lookup`")
