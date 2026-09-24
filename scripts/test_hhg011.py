import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import json
import pandas as pd
from src.agent import investigate, normalize_case

cases = pd.read_csv("data/case_pack.csv", dtype=str)
row = cases[cases.case_id == "HHG-011"].iloc[0]

case = normalize_case(
    row["case_id"], row["trigger_type"], row["trigger_text"],
    row["flagged_txn_id"], row["customer_id"], row["card_id"], row["risk_score"]
)

print("=== Case ===")
print(case)
print("\n=== Verdict ===")
print(json.dumps(investigate(case), indent=2))