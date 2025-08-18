# backend/scripts/extract_two_cols.py
import pandas as pd
import ast
import os

# Input & output paths
in_csv  = r'D:/pharma/backend/nomenclator_with_symptoms.csv'
out_csv = r'D:/pharma/backend/nomenclator_two_cols.csv'

# Read only the two columns, renaming for PostgreSQL
df = pd.read_csv(in_csv, encoding='utf-8', usecols=['Cod CIM', 'matched_symptoms'])
df = df.rename(columns={'Cod CIM': 'cod_cim'})

# Convert the Python‐list literal string into a proper Postgres array literal
def to_pg_array(pylist_str: str) -> str:
    try:
        # parse Python list string into a list object
        lst = ast.literal_eval(pylist_str)
    except Exception:
        lst = []
    # escape backslashes and double-quotes inside each item
    safe = [item.replace('\\', '\\\\').replace('"', '\\"') for item in lst]
    # join with commas and wrap in {}
    return '{' + ','.join(safe) + '}'

df['matched_symptoms'] = df['matched_symptoms'].fillna('[]').map(to_pg_array)

# Write out the two-column CSV, now with PG array syntax
df.to_csv(out_csv, index=False, encoding='utf-8')
print(f'Wrote {len(df)} rows to {out_csv}')
