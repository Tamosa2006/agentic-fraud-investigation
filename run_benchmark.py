import sys, os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import json
import pandas as pd
from datetime import datetime
from src.agent import investigate, normalize_case

os.makedirs("outputs/benchmark", exist_ok=True)

cases = pd.read_csv("data/case_pack.csv", dtype=str)
print(f"Loaded {len(cases)} benchmark cases.\n")

results = []

for _, row in cases.iterrows():
    case_id = row["case_id"]
    print(f"Investigating {case_id}...", end=" ", flush=True)

    case_text = normalize_case(
        case_id=case_id,
        trigger_type=row["trigger_type"],
        trigger_text=row["trigger_text"],
        flagged_txn_id=row["flagged_txn_id"],
        customer_id=row["customer_id"],
        card_id=row["card_id"],
        risk_score=row["risk_score"],
    )

    try:
        verdict = investigate(case_text)
    except Exception as e:
        verdict = {
            "verdict": "error",
            "confidence": 0.0,
            "evidence": [],
            "recommended_action": "escalate_to_human",
            "reasoning": f"Agent raised an exception: {e}",
        }

    output = {
        "case_id": case_id,
        "trigger_type": row["trigger_type"],
        "customer_id": row["customer_id"],
        "flagged_txn_id": row["flagged_txn_id"],
        "timestamp": datetime.now().isoformat(),
        **verdict,
    }

    out_path = f"outputs/benchmark/{case_id}.json"
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)

    print(f"-> {verdict.get('verdict', '?')} ({verdict.get('confidence', '?')})")
    results.append(output)

# summary table
print("\n" + "=" * 70)
print(f"{'CASE':<10} {'VERDICT':<12} {'CONF':<6} {'ACTION':<20}")
print("=" * 70)
for r in results:
    print(f"{r['case_id']:<10} {r.get('verdict','?'):<12} {r.get('confidence','?'):<6} {r.get('recommended_action','?'):<20}")

verdict_counts = pd.Series([r.get("verdict") for r in results]).value_counts()
print("\nVerdict distribution:")
print(verdict_counts.to_string())

summary_path = "outputs/benchmark/_summary.json"
with open(summary_path, "w") as f:
    json.dump(results, f, indent=2)
print(f"\nAll 20 results saved to outputs/benchmark/. Summary at {summary_path}")