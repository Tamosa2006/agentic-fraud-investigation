import json
import os
import sys

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


CASE_ID = "CASE-2026-001"
CUSTOMER_ID = "CUST-1042"
TRANSACTION_ID = "TXN-783421"
CARD_ID = "CARD-5521"


def main():
    case_text = normalize_case(
        case_id=CASE_ID,
        trigger_type="Suspicious Transaction",
        trigger_text=(
            "A high-value transaction was detected "
            "from CUST-1042. The transaction is linked "
            "to a card that has been associated with "
            "multiple recent transactions showing "
            "unusual activity."
        ),
        flagged_txn_id=TRANSACTION_ID,
        customer_id=CUSTOMER_ID,
        card_id=CARD_ID,
        risk_score=87
    )

    print("=" * 60)
    print("LIVE CASE")
    print("=" * 60)
    print(case_text)
    print()

    result = investigate(
        case_text
    )

    print(
        json.dumps(
            result,
            indent=2,
            default=str
        )
    )

    os.makedirs(
        "outputs/live_validation",
        exist_ok=True
    )

    with open(
        "outputs/live_validation/"
        "CASE-2026-001.json",
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            result,
            file,
            indent=2,
            default=str
        )

    print()
    print("=" * 60)
    print("LIVE CASE CHECK")
    print("=" * 60)

    checks = {
        "case_id_present":
            CASE_ID in case_text,

        "customer_id_present":
            CUSTOMER_ID in case_text,

        "transaction_id_present":
            TRANSACTION_ID in case_text,

        "verdict_present":
            result.get("verdict")
            in {
                "fraud",
                "legit",
                "uncertain",
            },

        "graph_evidence_present":
            isinstance(
                result.get(
                    "graph_evidence"
                ),
                list
            ),

        "risk_present":
            isinstance(
                result.get(
                    "risk"
                ),
                dict
            ),

        "nba_present":
            isinstance(
                result.get(
                    "next_best_action"
                ),
                dict
            ),

        "customer_profile_present":
            isinstance(
                result.get(
                    "customer_profile"
                ),
                dict
            ),
    }

    failed = []

    for name, passed in checks.items():
        print(
            f"{'PASS' if passed else 'FAIL'} "
            f"{name}"
        )

        if not passed:
            failed.append(name)

    print()

    if failed:
        print(
            "Live case validation FAILED:"
        )

        for item in failed:
            print(
                f"  - {item}"
            )

        raise SystemExit(1)

    print(
        "Live case validation PASSED."
    )


if __name__ == "__main__":
    main()
