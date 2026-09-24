from datetime import datetime

from src.tg_client import conn, run_installed_query


def customer_profile(
    customer_id: str,
    recent_n: int = 10
) -> dict:
    """
    Pull a customer's cards, recent transactions,
    devices, and past fraud cases from TigerGraph.
    """

    result = run_installed_query(
        "customer_profile",
        cust=customer_id,
        recent_n=recent_n
    )

    out = {
        "customer_id": customer_id,
        "cards": [],
        "transactions": [],
        "devices": [],
        "past_cases": []
    }

    if not result:
        return out

    for block in result:

        if "Cards" in block:
            out["cards"] = [
                v["v_id"]
                for v in block["Cards"]
            ]

        if "AllTxns" in block:
            out["transactions"] = [
                {
                    "txn_id": v["v_id"],
                    **v.get("attributes", {})
                }
                for v in block["AllTxns"]
            ]

        if "Devices" in block:
            out["devices"] = [
                v["v_id"]
                for v in block["Devices"]
            ]

        if "PastCases" in block:
            out["past_cases"] = [
                {
                    "case_id": v["v_id"],
                    **{
                        key: (
                            value[:200]
                            if key == "analyst_notes"
                            and isinstance(value, str)
                            else value
                        )
                        for key, value in v.get(
                            "attributes",
                            {}
                        ).items()
                    }
                }
                for v in block["PastCases"]
            ]

    return out


def transaction_profile(transaction_id: str) -> dict:
    try:
        result = conn.getVertexDataFrameById(
            "Transaction",
            transaction_id
        )

        if result is None or result.empty:
            return {
                "transaction_id": transaction_id,
                "found": False,
                "transaction": None,
                "error": None
            }

        row = result.iloc[0].to_dict()

        # Remove the vertex ID column if returned separately.
        row.pop("v_id", None)

        return {
            "transaction_id": transaction_id,
            "found": True,
            "transaction": {
                "txn_id": transaction_id,
                **row
            },
            "error": None
        }

    except Exception as exc:
        return {
            "transaction_id": transaction_id,
            "found": False,
            "transaction": None,
            "error": str(exc)
        }


def velocity_check(
    customer_id: str,
    window_minutes: int = 120,
    small_amount: float = 20.0,
    burst_threshold: int = 3
) -> dict:
    """
    Detect a burst of small transactions.

    The customer profile is also returned internally so the
    agent can preserve the actual TigerGraph evidence.
    """

    profile = customer_profile(
        customer_id,
        recent_n=30
    )

    small = [
        transaction
        for transaction in profile["transactions"]
        if transaction.get(
            "amount",
            0
        ) <= small_amount
    ]

    small.sort(
        key=lambda transaction: transaction.get(
            "ts",
            ""
        )
    )

    if not small:
        return {
            "total_small_txns": 0,
            "max_burst_count": 0,
            "is_suspicious_burst": False,
            "window_minutes": window_minutes,
            "small_amount_threshold": small_amount,
            "burst_threshold": burst_threshold,
            "burst_transactions": [],
            "profile": profile
        }

    valid_transactions = []

    for transaction in small:
        try:
            parsed_time = datetime.strptime(
                transaction["ts"],
                "%Y-%m-%d %H:%M:%S"
            )

            valid_transactions.append(
                (
                    parsed_time,
                    transaction
                )
            )

        except Exception:
            continue

    best_count = 0
    best_cluster = []

    for i in range(
        len(valid_transactions)
    ):
        start_time = valid_transactions[i][0]

        cluster = [
            valid_transactions[i][1]
        ]

        for j in range(
            i + 1,
            len(valid_transactions)
        ):
            current_time = valid_transactions[j][0]

            if (
                current_time - start_time
            ).total_seconds() <= (
                window_minutes * 60
            ):
                cluster.append(
                    valid_transactions[j][1]
                )

        if len(cluster) > best_count:
            best_count = len(cluster)
            best_cluster = cluster

    compact_cluster = [
        {
            "txn_id": transaction.get(
                "txn_id"
            ),
            "amount": transaction.get(
                "amount"
            ),
            "ts": transaction.get(
                "ts"
            ),
            "is_online": transaction.get(
                "is_online"
            )
        }
        for transaction in best_cluster[:10]
    ]

    return {
        "total_small_txns": len(small),
        "max_burst_count": best_count,
        "is_suspicious_burst": (
            best_count >= burst_threshold
        ),
        "window_minutes": window_minutes,
        "small_amount_threshold": small_amount,
        "burst_threshold": burst_threshold,
        "burst_transactions": compact_cluster,
        "profile": profile
    }


TOOLS = {
    "customer_profile": {
        "function": customer_profile,
        "description": (
            "Get a customer's cards, recent transactions, "
            "devices, and past fraud case history from TigerGraph."
        ),
        "parameters": {
            "customer_id": {
                "type": "string",
                "description": (
                    "The customer ID, e.g. C12382"
                )
            },
            "recent_n": {
                "type": "integer",
                "description": (
                    "How many recent transactions to return"
                ),
                "default": 10
            },
        },
    },

    "transaction_profile": {
        "function": transaction_profile,
        "description": (
            "Get the exact flagged transaction directly "
            "from the TigerGraph Transaction vertex."
        ),
        "parameters": {
            "transaction_id": {
                "type": "string",
                "description": (
                    "The exact transaction ID, e.g. 3514030"
                )
            }
        },
    },

    "velocity_check": {
        "function": velocity_check,
        "description": (
            "Detect a burst of small transactions within "
            "a short time window, useful for identifying "
            "possible card-testing behavior."
        ),
        "parameters": {
            "customer_id": {
                "type": "string",
                "description": "The customer ID"
            },
            "window_minutes": {
                "type": "integer",
                "description": (
                    "Time window for the burst check"
                ),
                "default": 120
            },
            "small_amount": {
                "type": "number",
                "description": (
                    "Maximum amount considered a small transaction"
                ),
                "default": 20.0
            },
            "burst_threshold": {
                "type": "integer",
                "description": (
                    "Minimum number of small transactions "
                    "to flag a burst"
                ),
                "default": 3
            },
        },
    },
}
