import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pandas as pd
from src.tg_client import conn

cases = pd.read_csv("data/clean/cases.csv", dtype=str)
attrs = ["outcome","pattern","opened_at","closed_at","exposure_usd","analyst_notes"]

# check for suspicious formats
print("literal 'NaN' text:", (cases.exposure_usd.str.lower() == "nan").sum())
print("scientific notation (e/E):", cases.exposure_usd.str.contains("e", case=False, na=False).sum())
print("has whitespace:", cases.exposure_usd.str.strip().ne(cases.exposure_usd).sum())
print("unique weird samples:", cases[cases.exposure_usd.str.contains("[^0-9.]", regex=True, na=False)].exposure_usd.unique()[:10])

# find the exact failing row by testing one at a time
for _, row in cases.iterrows():
    record = {a: row[a] for a in attrs if pd.notna(row[a])}
    try:
        conn.upsertVertices("FraudCase", [(row["case_id"], record)])
    except Exception as e:
        print(f"\nFAILED on case_id={row['case_id']}")
        print("exposure_usd repr:", repr(row["exposure_usd"]))
        print("full record:", record)
        print("error:", e)
        break
else:
    print("no failure found in single-row testing")