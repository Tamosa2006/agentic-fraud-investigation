import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import json
import pandas as pd

from src.agent import investigate, normalize_case


CASE_ID = sys.argv[1] if len(sys.argv) > 1 else "HHG-001"

df = pd.read_csv("data/case_pack.csv")

row = df[df["case_id"] == CASE_ID]

if row.empty:
    print(f"Case not found: {CASE_ID}")
    print("Available cases:")
    print(df["case_id"].tolist())
    sys.exit(1)

row = row.iloc[0]

case = normalize_case(
    case_id=str(row["case_id"]),
    trigger_type=str(row["trigger_type"]),
    trigger_text=str(row["trigger_text"]),
    flagged_txn_id=str(row["flagged_txn_id"]),
    customer_id=str(row["customer_id"]),
    card_id=str(row["card_id"]),
    risk_score=row.get("risk_score"),
)

print("=== Normalized case text ===")
print(case)

print("\n=== Agent verdict ===")
result = investigate(case)

print(json.dumps(result, indent=2))