import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pandas as pd
from src.tg_client import conn

def upsert_and_report(vtype, df, id_col, attrs=None):
    attrs = attrs or []
    records = {}
    for _, row in df.iterrows():
        vid = str(row[id_col])
        record = {a: row[a] for a in attrs if pd.notna(row[a])}
        records[vid] = record
    resp = conn.upsertVertices(vtype, records)
    print(f"{vtype}: sent {len(records)} -> API response: {resp}")
    return resp

devices = pd.read_csv("data/clean/devices.csv", dtype=str)
print("device_id duplicates check:", devices.device_id.duplicated().sum(), "of", len(devices))
upsert_and_report("Device", devices, "device_id")

cases = pd.read_csv("data/clean/cases.csv", dtype=str)
print("case_id duplicates check:", cases.case_id.duplicated().sum(), "of", len(cases))
print("sample dates:", cases[["opened_at","closed_at"]].head(3).to_string())
upsert_and_report("FraudCase", cases, "case_id",
                   attrs=["outcome","pattern","opened_at","closed_at","exposure_usd","analyst_notes"])

print("\nFinal counts:")
print("Device:", conn.getVertexCount("Device"))
print("FraudCase:", conn.getVertexCount("FraudCase"))