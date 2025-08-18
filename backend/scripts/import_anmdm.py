# backend/scripts/import_anmdm.py
import os
import pandas as pd
from sqlalchemy import create_engine, text

# 0) Build the URL
raw = os.getenv('DATABASE_URL','').strip()
if raw.startswith('postgres://'):
    raw = raw.replace('postgres://','postgresql://',1)
if not raw:
    raw = 'postgresql+psycopg2://pharmacy_user:1234@localhost:5432/pharmacy'

engine = create_engine(raw)
print("Using DATABASE_URL:", raw)

# 1) Read the full ANMDM CSV
csv_path = r'D:/date/nomenclator.csv'
df = pd.read_csv(csv_path, encoding='utf-8', delimiter=',')

# 2) Rename all original + indication column
df = df.rename(columns={
    'Cod CIM':                       'cod_cim',
    'Denumire comerciala':           'name',
    'DCI':                           'active_ingredient',
    'Forma farmaceutica':            'forma_farmaceutica',
    'Concentratie':                  'concentratie',
    'Firma / tara producatoare APP': 'firma_tara_producatoare_app',
    'Firma / tara detinatoare APP':  'firma_tara_detinatoare_app',
    'Cod ATC':                       'atc_code',
    'Actiune terapeutica':           'indications',            # ← renamed here
    'Prescriptie':                   'prescription',
    'Nr / data ambalaj APP':         'nr_data_ambalaj_app',
    'Ambalaj':                       'ambalaj',
    'Volum ambalaj':                 'volum_ambalaj',
    'Valabilitate ambalaj':          'valabilitate_ambalaj',
    'Bulina':                        'bulina',
    'Diez':                          'diez',
    'Stea':                          'stea',
    'Triunghi':                      'triunghi',
    'Dreptunghi':                    'dreptunghi',
    'Data actualizare':              'data_actualizare'
})

# 3) Tidy up dates
df['data_actualizare'] = pd.to_datetime(
    df['data_actualizare'], dayfirst=True, errors='coerce'
).dt.date

# 4) Derive/fill your extra columns
df['is_otc']      = True    # or derive from prescription
df['price_eur']   = None
df['stock_level'] = 0
df['image_url']   = None

# 5) Drop rows missing ATC code
df = df[df['atc_code'].notna() & df['atc_code'].str.strip().ne('')]

# 6) Pick exactly the columns in the correct order
cols = [
  'cod_cim',
  'name',
  'brand',                      # you may assign this below
  'active_ingredient',
  'forma_farmaceutica',
  'concentratie',
  'firma_tara_producatoare_app',
  'firma_tara_detinatoare_app',
  'atc_code',
  'indications',                # ← our new TEXT column!
  'prescription',
  'nr_data_ambalaj_app',
  'ambalaj',
  'volum_ambalaj',
  'valabilitate_ambalaj',
  'bulina',
  'diez',
  'stea',
  'triunghi',
  'dreptunghi',
  'data_actualizare',
  'is_otc',
  'price_eur',
  'stock_level',
  'image_url',
  'actiune_terapeutica'
]

# 7) Make sure brand exists
df['brand'] = df['firma_tara_detinatoare_app'].fillna('')

# 8) Dump out a temp CSV for COPY
tmp_csv = os.path.join(os.getcwd(), 'to_copy.csv')
df.to_csv(tmp_csv, columns=cols, index=False, encoding='utf-8')

# 9) Truncate & COPY into product
with engine.begin() as conn:
    conn.execute(text("TRUNCATE product CASCADE;"))

raw_conn = engine.raw_connection()
cur = raw_conn.cursor()
with open(tmp_csv, 'r', encoding='utf-8') as f:
    cur.copy_expert(
        f"COPY product ({','.join(cols)}) "
        "FROM STDIN WITH CSV HEADER DELIMITER ','",
        f
    )
raw_conn.commit()
cur.close()
raw_conn.close()

print(f"✅ Copied {len(df)} products via COPY")
