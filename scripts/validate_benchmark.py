import json
import os
import sys
import time

import pandas as pd

sys.path.insert(
    0,
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            ".."
        )
    )
)

from src.agent import investigate, normalize_case


CASE_FILE = "data/case_pack.csv"
OUTPUT_DIR = "outputs/benchmark_validation"

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)


def safe_value(row, column):
    value = row.get(column)

    if pd.isna(value):
        return ""

    return str(value)


def main():
    cases = pd.read_csv(
        CASE_FILE,
        dtype=str
    )

    print(
        f"Loaded {len(cases)} benchmark cases."
    )

    results = []

    for index, row in cases.iterrows():
        case_id = safe_value(
            row,
            "case_id"
        )

        print()
        print(
            f"[{index + 1}/{len(cases)}] "
            f"Investigating {case_id}..."
        )

        try:
            risk_score = safe_value(
                row,
                "risk_score"
            )

            if risk_score:
                try:
                    risk_score = float(
                        risk_score
                    )
                except ValueError:
                    risk_score = None
            else:
                risk_score = None

            case_text = normalize_case(
                case_id=case_id,
                trigger_type=safe_value(
                    row,
                    "trigger_type"
                ),
                trigger_text=safe_value(
                    row,
                    "trigger_text"
                ),
                flagged_txn_id=safe_value(
                    row,
                    "flagged_txn_id"
                ),
                customer_id=safe_value(
                    row,
                    "customer_id"
                ),
                card_id=safe_value(
                    row,
                    "card_id"
                ),
                risk_score=risk_score
            )

            result = investigate(
                case_text
            )

            customer_profile = result.get(
                "customer_profile",
                {}
            )

            graph_evidence = result.get(
                "graph_evidence",
                []
            )

            patterns = result.get(
                "patterns",
                []
            )

            risk = result.get(
                "risk",
                {}
            )

            nba = result.get(
                "next_best_action",
                {}
            )

            output = {
                "case_id": case_id,
                "customer_id": safe_value(
                    row,
                    "customer_id"
                ),
                "transaction_id": safe_value(
                    row,
                    "flagged_txn_id"
                ),
                "verdict": result.get(
                    "verdict"
                ),
                "confidence": result.get(
                    "confidence"
                ),
                "graph_evidence_count":
                    len(graph_evidence),
                "pattern_count":
                    len(patterns),
                "customer_profile": {
                    "cards": len(
                        customer_profile.get(
                            "cards",
                            []
                        )
                    ),
                    "transactions": len(
                        customer_profile.get(
                            "transactions",
                            []
                        )
                    ),
                    "devices": len(
                        customer_profile.get(
                            "devices",
                            []
                        )
                    ),
                    "past_cases": len(
                        customer_profile.get(
                            "past_cases",
                            []
                        )
                    ),
                },
                "risk": risk,
                "next_best_action": nba,
                "reasoning": result.get(
                    "reasoning",
                    ""
                ),
                "agent": result.get(
                    "agent",
                    {}
                ),
                "graph_evidence":
                    graph_evidence,
                "patterns":
                    patterns,
            }

            output_path = os.path.join(
                OUTPUT_DIR,
                f"{case_id}.json"
            )

            with open(
                output_path,
                "w",
                encoding="utf-8"
            ) as file:
                json.dump(
                    output,
                    file,
                    indent=2,
                    default=str
                )

            results.append({
                "case_id": case_id,
                "status": "PASS",
                "verdict": result.get(
                    "verdict"
                ),
                "confidence": result.get(
                    "confidence"
                ),
                "graph_evidence":
                    len(graph_evidence),
                "patterns":
                    len(patterns),
                "final_risk":
                    risk.get("final"),
                "action":
                    nba.get("action"),
            })

            print(
                f"  PASS | "
                f"verdict={result.get('verdict')} | "
                f"graph={len(graph_evidence)} | "
                f"patterns={len(patterns)}"
            )

        except Exception as error:
            results.append({
                "case_id": case_id,
                "status": "FAIL",
                "error": str(error),
            })

            print(
                f"  FAIL | {error}"
            )

        # Avoid hammering the Gemini API.
        if index < len(cases) - 1:
            print(
                "  Waiting 3 seconds..."
            )
            time.sleep(3)

    summary = {
        "total": len(results),
        "passed": sum(
            1
            for item in results
            if item["status"] == "PASS"
        ),
        "failed": sum(
            1
            for item in results
            if item["status"] == "FAIL"
        ),
        "results": results,
    }

    summary_path = os.path.join(
        OUTPUT_DIR,
        "_summary.json"
    )

    with open(
        summary_path,
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            summary,
            file,
            indent=2,
            default=str
        )

    print()
    print("=" * 60)
    print("BENCHMARK SUMMARY")
    print("=" * 60)

    print(
        f"Total : {summary['total']}"
    )

    print(
        f"Passed: {summary['passed']}"
    )

    print(
        f"Failed: {summary['failed']}"
    )

    print()
    print(
        f"Results saved to: "
        f"{OUTPUT_DIR}"
    )


if __name__ == "__main__":
    main()