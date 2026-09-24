import json
import re
import time

from google import genai
from google.genai import types

from src.config import GEMINI_API_KEY
from src.tools import TOOLS
from src.actions import recommend_action


MODEL = "gemini-3.5-flash-lite"

MAX_STEPS = 6

MAX_TOOL_RESULT_CHARS = 12000


SYSTEM_PROMPT = """
You are an AI fraud investigation agent.

Your job is to investigate a fraud alert using ONLY evidence retrieved
from the available investigation tools.

IMPORTANT INVESTIGATION RULES:

1. A customer profile is mandatory for every investigation when a valid
   customer ID is available.

2. The exact flagged transaction should also be retrieved whenever a
   transaction ID is available.

3. The customer profile contains:
   - cards
   - recent transactions
   - connected devices
   - previous fraud cases

4. The exact transaction lookup contains the actual flagged transaction
   and should be preferred over assumptions based on recent transactions.

5. Do not invent transactions, cards, devices, fraud cases, or relationships.

6. Treat TigerGraph results as the source of truth for graph evidence.

7. You may use velocity_check when transaction behavior needs additional
   investigation.

8. If the available evidence is insufficient or conflicting, use
   "uncertain" rather than inventing evidence.

9. DO NOT invent or calculate a numerical risk score yourself.
   The application calculates the numerical risk score separately from
   retrieved evidence.

10. Your final answer MUST be valid JSON with exactly these main fields:

{
  "verdict": "fraud" | "legit" | "uncertain",
  "confidence": 0.0,
  "evidence": [],
  "reasoning": ""
}

The evidence list should contain short factual statements based on
retrieved data.

Confidence must be between 0 and 1.

Do not claim that something is suspicious unless the retrieved evidence
supports that conclusion.
"""


# -------------------------------------------------------------------
# Gemini tool schemas
# -------------------------------------------------------------------

def _build_tool_schemas():
    schemas = []

    for name, spec in TOOLS.items():

        properties = {}

        for param_name, param in spec["parameters"].items():

            properties[param_name] = {
                "type": param["type"],
                "description": param.get(
                    "description",
                    ""
                )
            }

        required = [
            param_name
            for param_name, param in spec["parameters"].items()
            if "default" not in param
        ]

        schemas.append(
            types.FunctionDeclaration(
                name=name,
                description=spec["description"],
                parameters=types.Schema(
                    type="OBJECT",
                    properties=properties,
                    required=required,
                ),
            )
        )

    return schemas


# -------------------------------------------------------------------
# Case normalization
# -------------------------------------------------------------------

def normalize_case(
    case_text=None,
    case_id=None,
    trigger_type=None,
    trigger_text=None,
    flagged_txn_id=None,
    customer_id=None,
    card_id=None,
    risk_score=None,
    amount=None,
    billing_region=None,
    original_alert=None,
):
    """
    Normalize a case.

    Supports BOTH:

    1. normalize_case(case_text)

    2. normalize_case(
           case_id=...,
           trigger_type=...,
           trigger_text=...,
           ...
       )

    risk_score is retained only for backwards compatibility with older
    benchmark cases. It is NOT used as the automatically generated risk
    score for a new investigation.
    """

    structured_input = any([
        case_id is not None,
        trigger_type is not None,
        trigger_text is not None,
        flagged_txn_id is not None,
        customer_id is not None,
        card_id is not None,
        risk_score is not None,
        amount is not None,
        billing_region is not None,
        original_alert is not None,
    ])

    if structured_input:

        lines = []

        if case_id is not None:
            lines.append(
                f"Case ID: {case_id}"
            )

        if trigger_type is not None:
            lines.append(
                f"Alert type: {trigger_type}"
            )

        if trigger_text is not None:
            lines.append(
                f"Alert description: {trigger_text}"
            )

        if flagged_txn_id is not None:
            lines.append(
                f"Flagged transaction ID: {flagged_txn_id}"
            )

        if customer_id is not None:
            lines.append(
                f"Customer ID: {customer_id}"
            )

        if card_id:
            lines.append(
                f"Card ID: {card_id}"
            )

        # Kept for backwards compatibility.
        # This value is NOT used by the automatic risk engine.
        if risk_score is not None:
            lines.append(
                f"Model risk score: {risk_score}"
            )

        if amount is not None:
            lines.append(
                f"Amount: {amount}"
            )

        if billing_region is not None:
            lines.append(
                f"Billing region: {billing_region}"
            )

        if original_alert:
            lines.append(
                f"Original alert:\n{original_alert}"
            )

        return "\n".join(lines)

    if case_text is None:
        return ""

    text = str(case_text).strip()

    case_match = re.search(
        r"Case ID:\s*([A-Za-z0-9_-]+)",
        text,
        re.IGNORECASE
    )

    alert_type_match = re.search(
        r"Alert type:\s*(.+)",
        text,
        re.IGNORECASE
    )

    transaction_match = re.search(
        r"(?:Flagged )?transaction(?: ID)?:\s*([A-Za-z0-9_-]+)",
        text,
        re.IGNORECASE
    )

    customer_match = re.search(
        r"Customer ID:\s*([A-Za-z0-9_-]+)",
        text,
        re.IGNORECASE
    )

    card_match = re.search(
        r"Card ID:\s*([A-Za-z0-9_-]+)",
        text,
        re.IGNORECASE
    )

    risk_match = re.search(
        r"Model risk score:\s*([0-9.]+)",
        text,
        re.IGNORECASE
    )

    amount_match = re.search(
        r"Amount:\s*([0-9.]+)",
        text,
        re.IGNORECASE
    )

    billing_match = re.search(
        r"Billing region:\s*(.+)",
        text,
        re.IGNORECASE
    )

    lines = [
        (
            f"Case ID: "
            f"{case_match.group(1) if case_match else 'unknown'}"
        ),
        (
            f"Alert type: "
            f"{alert_type_match.group(1).strip() if alert_type_match else 'unknown'}"
        ),
        (
            f"Flagged transaction ID: "
            f"{transaction_match.group(1) if transaction_match else 'unknown'}"
        ),
        (
            f"Customer ID: "
            f"{customer_match.group(1) if customer_match else 'unknown'}"
        ),
        (
            f"Card ID: "
            f"{card_match.group(1) if card_match else 'unknown'}"
        ),
    ]

    # Kept only as case context.
    # It is NOT treated as the generated risk score.
    if risk_match:
        lines.append(
            f"Model risk score: {risk_match.group(1)}"
        )

    if amount_match:
        lines.append(
            f"Amount: {amount_match.group(1)}"
        )

    if billing_match:
        lines.append(
            f"Billing region: {billing_match.group(1).strip()}"
        )

    lines.append(
        f"Original alert:\n{text}"
    )

    return "\n".join(lines)


# -------------------------------------------------------------------
# Compact tool result
# -------------------------------------------------------------------

def _compact_tool_result(result):

    if not isinstance(result, dict):
        return result

    compact = {}

    for key in [
        "customer_id",
        "cards",
        "transactions",
        "devices",
        "past_cases",
        "transaction_id",
        "found",
        "transaction",
        "error",
        "velocity",
        "total_small_txns",
        "max_burst_count",
        "is_suspicious_burst",
        "window_minutes",
        "small_amount_threshold",
        "burst_threshold",
        "burst_transactions",
    ]:

        if key in result:
            compact[key] = result[key]

    serialized = json.dumps(
        compact,
        default=str
    )

    if len(serialized) > MAX_TOOL_RESULT_CHARS:
        serialized = serialized[:MAX_TOOL_RESULT_CHARS]

    try:

        return json.loads(serialized)

    except Exception:

        return serialized


# -------------------------------------------------------------------
# Execute tool
# -------------------------------------------------------------------

def _execute_tool(
    function_name,
    function_args
):

    if function_name not in TOOLS:

        return {
            "error": f"Unknown tool: {function_name}"
        }

    try:

        return TOOLS[
            function_name
        ]["function"](
            **function_args
        )

    except Exception as exc:

        return {
            "error": str(exc)
        }


# -------------------------------------------------------------------
# Extract Gemini text
# -------------------------------------------------------------------

def _extract_text(response):

    try:

        if response.text:
            return response.text

    except Exception:
        pass

    return ""


# -------------------------------------------------------------------
# Parse Gemini verdict
# -------------------------------------------------------------------

def _parse_verdict(text):

    if not text:
        return None

    cleaned = text.strip()

    if cleaned.startswith("```"):

        cleaned = re.sub(
            r"^```(?:json)?\s*",
            "",
            cleaned,
            flags=re.IGNORECASE
        )

        cleaned = re.sub(
            r"\s*```$",
            "",
            cleaned
        )

    try:

        data = json.loads(cleaned)

        if isinstance(data, dict):
            return data

    except Exception:
        pass

    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start != -1 and end != -1 and end > start:

        candidate = cleaned[
            start:end + 1
        ]

        try:

            data = json.loads(candidate)

            if isinstance(data, dict):
                return data

        except Exception:
            pass

    return None


# -------------------------------------------------------------------
# Safe number
# -------------------------------------------------------------------

def _safe_number(
    value,
    default=0.0
):

    try:

        return float(value)

    except Exception:

        return default


# -------------------------------------------------------------------
# Extract transaction ID
# -------------------------------------------------------------------

def _extract_transaction_id(
    case_text
):

    match = re.search(
        r"Flagged transaction ID:\s*([A-Za-z0-9_-]+)",
        case_text,
        re.IGNORECASE
    )

    if match:
        return match.group(1)

    match = re.search(
        r"(?:transaction|txn)(?:\s+ID)?[:#\s]+([A-Za-z0-9_-]+)",
        case_text,
        re.IGNORECASE
    )

    if match:
        return match.group(1)

    return None


# -------------------------------------------------------------------
# Exact flagged transaction retrieval
# -------------------------------------------------------------------

def _retrieve_flagged_transaction(
    transaction_id,
    collected_tool_data
):

    if not transaction_id:

        collected_tool_data[
            "transaction_retrieval_status"
        ] = "missing_transaction_id"

        return {
            "transaction_id": None,
            "found": False,
            "transaction": None,
            "error": "Transaction ID is missing."
        }

    result = _execute_tool(
        "transaction_profile",
        {
            "transaction_id": transaction_id
        }
    )

    if not isinstance(
        result,
        dict
    ):

        collected_tool_data[
            "transaction_retrieval_status"
        ] = "failed"

        return {
            "transaction_id": transaction_id,
            "found": False,
            "transaction": None,
            "error": (
                "transaction_profile returned "
                "an invalid response."
            )
        }

    if result.get("error"):

        collected_tool_data[
            "transaction_retrieval_status"
        ] = "failed"

        collected_tool_data[
            "flagged_transaction"
        ] = None

        return result

    transaction = result.get(
        "transaction"
    )

    if result.get("found") and transaction:

        collected_tool_data[
            "flagged_transaction"
        ] = transaction

        collected_tool_data[
            "transaction_retrieval_status"
        ] = "succeeded"

    else:

        collected_tool_data[
            "flagged_transaction"
        ] = None

        collected_tool_data[
            "transaction_retrieval_status"
        ] = "not_found"

    collected_tool_data[
        "transaction_id"
    ] = transaction_id

    return result


# -------------------------------------------------------------------
# Graph evidence
# -------------------------------------------------------------------

def _build_graph_evidence(
    tool_data
):

    evidence = []

    cards = tool_data.get(
        "cards",
        []
    )

    transactions = tool_data.get(
        "transactions",
        []
    )

    devices = tool_data.get(
        "devices",
        []
    )

    past_cases = tool_data.get(
        "past_cases",
        []
    )

    flagged_transaction = tool_data.get(
        "flagged_transaction"
    )

    customer_id = tool_data.get(
        "customer_id"
    )

    if not customer_id:
        return evidence

    for card_id in cards:

        evidence.append({

            "source": customer_id,

            "source_type": "Customer",

            "relationship": "owns_card",

            "target": card_id,

            "target_type": "Card",

        })

    # ---------------------------------------------------------------
    # Exact flagged transaction
    # ---------------------------------------------------------------

    if flagged_transaction:

        txn_id = flagged_transaction.get(
            "txn_id"
        )

        if not txn_id:

            txn_id = flagged_transaction.get(
                "transaction_id"
            )

        if txn_id:

            evidence.append({

                "source": customer_id,

                "source_type": "Customer",

                "relationship": "flagged_txn",

                "target": txn_id,

                "target_type": "Transaction",

                "amount": flagged_transaction.get(
                    "amount"
                ),

                "ts": flagged_transaction.get(
                    "ts"
                ),

                "channel": flagged_transaction.get(
                    "channel"
                ),

                "region": flagged_transaction.get(
                    "region"
                ),

                "risk_score": flagged_transaction.get(
                    "risk_score"
                ),

            })

    # ---------------------------------------------------------------
    # Recent customer transactions
    # ---------------------------------------------------------------

    for txn in transactions:

        txn_id = txn.get(
            "txn_id"
        )

        if not txn_id:
            continue

        # Avoid duplicating the exact flagged transaction.
        if (
            flagged_transaction
            and txn_id == flagged_transaction.get(
                "txn_id"
            )
        ):
            continue

        evidence.append({

            "source": customer_id,

            "source_type": "Customer",

            "relationship": "made_txn",

            "target": txn_id,

            "target_type": "Transaction",

            "amount": txn.get(
                "amount"
            ),

            "ts": txn.get(
                "ts"
            ),

            "channel": txn.get(
                "channel"
            ),

            "region": txn.get(
                "region"
            ),

            "risk_score": txn.get(
                "risk_score"
            ),

        })

    for device_id in devices:

        evidence.append({

            "source": customer_id,

            "source_type": "Customer",

            "relationship": "device_observed",

            "target": device_id,

            "target_type": "Device",

        })

    for case in past_cases:

        case_id = case.get(
            "case_id"
        )

        if not case_id:
            continue

        evidence.append({

            "source": customer_id,

            "source_type": "Customer",

            "relationship": "customer_in_case",

            "target": case_id,

            "target_type": "FraudCase",

            "opened_at": case.get(
                "opened_at"
            ),

            "status": case.get(
                "status"
            ),

            "outcome": case.get(
                "outcome"
            ),

            "pattern": case.get(
                "pattern"
            ),

            "analyst_notes": case.get(
                "analyst_notes"
            ),

        })

    return evidence


# -------------------------------------------------------------------
# Fraud patterns
# -------------------------------------------------------------------

def _build_patterns(
    tool_data
):

    patterns = []

    past_cases = tool_data.get(
        "past_cases",
        []
    )

    transactions = tool_data.get(
        "transactions",
        []
    )

    flagged_transaction = tool_data.get(
        "flagged_transaction"
    )

    velocity = tool_data.get(
        "velocity"
    )

    # ---------------------------------------------------------------
    # Previous fraud history
    # ---------------------------------------------------------------

    if past_cases:

        confirmed = [

            case

            for case in past_cases

            if str(
                case.get(
                    "outcome",
                    case.get("status", "")
                )
            ).lower()
            in {
                "fraud",
                "confirmed_fraud",
                "confirmed fraud",
                "confirmed"
            }

        ]

        if confirmed:

            patterns.append({

                "type":
                    "previous_fraud_history",

                "description":
                    "Customer has previous confirmed fraud case history.",

                "count":
                    len(confirmed),

            })

        else:

            patterns.append({

                "type":
                    "historical_case_history",

                "description":
                    (
                        "Customer has previous fraud "
                        "investigation history."
                    ),

                "count":
                    len(past_cases),

            })

    # ---------------------------------------------------------------
    # Exact flagged transaction risk
    # ---------------------------------------------------------------

    if flagged_transaction:

        flagged_risk = _safe_number(
            flagged_transaction.get(
                "risk_score"
            ),
            0
        )

        if flagged_risk >= 0.70:

            patterns.append({

                "type":
                    "flagged_transaction_high_risk",

                "description":
                    (
                        "The flagged transaction has a "
                        "high transaction model risk score."
                    ),

                "count":
                    1,

                "risk_score":
                    flagged_risk,

            })

        elif flagged_risk >= 0.40:

            patterns.append({

                "type":
                    "flagged_transaction_elevated_risk",

                "description":
                    (
                        "The flagged transaction has an "
                        "elevated transaction model risk score."
                    ),

                "count":
                    1,

                "risk_score":
                    flagged_risk,

            })

    # ---------------------------------------------------------------
    # Recent high-risk transactions
    # ---------------------------------------------------------------

    high_risk_transactions = []

    for txn in transactions:

        score = _safe_number(
            txn.get(
                "risk_score"
            ),
            0
        )

        if score >= 0.70:

            high_risk_transactions.append(
                txn
            )

    if high_risk_transactions:

        patterns.append({

            "type":
                "high_risk_transactions",

            "description":
                (
                    "Recent transactions include "
                    "high-risk model scores."
                ),

            "count":
                len(high_risk_transactions),

        })

    # ---------------------------------------------------------------
    # Suspicious velocity
    # ---------------------------------------------------------------

    if velocity:

        if velocity.get(
            "is_suspicious_burst"
        ):

            patterns.append({

                "type":
                    "small_transaction_burst",

                "description":
                    (
                        "Multiple small transactions occurred "
                        "within the configured time window."
                    ),

                "count":
                    velocity.get(
                        "max_burst_count",
                        0
                    ),

                "window_minutes":
                    velocity.get(
                        "window_minutes"
                    ),

            })

    return patterns


# -------------------------------------------------------------------
# Automatic deterministic risk calculation
# -------------------------------------------------------------------

def _calculate_graph_risk(
    initial_risk,
    tool_data,
    patterns
):
    """
    Calculate the application's automatic risk score.

    The numerical score is generated by deterministic application
    logic. Gemini does not directly assign the number.

    Score components:

    - Exact transaction model risk: up to 60 points
    - Confirmed previous fraud: up to 20 points
    - Recent high-risk transactions: up to 10 points
    - Suspicious velocity: up to 10 points

    Total maximum: 100.
    """

    score = 0.0

    flagged_transaction = tool_data.get(
        "flagged_transaction"
    )

    past_cases = tool_data.get(
        "past_cases",
        []
    )

    transactions = tool_data.get(
        "transactions",
        []
    )

    velocity = tool_data.get(
        "velocity"
    )

    # ---------------------------------------------------------------
    # 1. Exact flagged transaction risk
    # ---------------------------------------------------------------

    transaction_risk = _safe_number(
        initial_risk,
        0
    )

    score += transaction_risk * 60

    # ---------------------------------------------------------------
    # 2. Previous confirmed fraud history
    # ---------------------------------------------------------------

    confirmed_cases = 0

    for case in past_cases:

        status = str(
            case.get(
                "outcome",
                case.get("status", "")
            )
        ).lower()

        if status in {
            "fraud",
            "confirmed_fraud",
            "confirmed fraud",
            "confirmed"
        }:

            confirmed_cases += 1

    if confirmed_cases:

        score += min(
            20,
            confirmed_cases * 5
        )

    # ---------------------------------------------------------------
    # 3. Recent high-risk transactions
    # ---------------------------------------------------------------

    high_risk_count = 0

    for txn in transactions:

        risk = _safe_number(
            txn.get(
                "risk_score"
            ),
            0
        )

        if risk >= 0.70:

            high_risk_count += 1

    if high_risk_count:

        score += min(
            10,
            high_risk_count * 2
        )

    # ---------------------------------------------------------------
    # 4. Suspicious velocity
    # ---------------------------------------------------------------

    if velocity:

        if velocity.get(
            "is_suspicious_burst"
        ):

            score += 10

    # ---------------------------------------------------------------
    # Final deterministic score
    # ---------------------------------------------------------------

    score = max(
        0,
        min(
            100,
            round(score)
        )
    )

    return score


# -------------------------------------------------------------------
# Customer profile
# -------------------------------------------------------------------

def _build_customer_profile(
    tool_data
):

    return {

        "customer_id":
            tool_data.get(
                "customer_id"
            ),

        "cards":
            tool_data.get(
                "cards",
                []
            ),

        "transactions":
            tool_data.get(
                "transactions",
                []
            ),

        "devices":
            tool_data.get(
                "devices",
                []
            ),

        "past_cases":
            tool_data.get(
                "past_cases",
                []
            ),

        "flagged_transaction":
            tool_data.get(
                "flagged_transaction"
            ),

    }


# -------------------------------------------------------------------
# Next best action
# -------------------------------------------------------------------

def _build_next_best_action(
    verdict,
    confidence,
    evidence_count
):

    try:

        nba = recommend_action(

            verdict=verdict,

            confidence=confidence,

            evidence_count=evidence_count

        )

    except Exception as exc:

        nba = {

            "action": "",

            "reason": (
                "Action recommendation could not be generated."
            ),

            "approval_route": "human_analyst",

            "approval_required": True,

            "error": str(exc),

        }

    if not isinstance(
        nba,
        dict
    ):

        nba = {}

    action = nba.get(
        "action"
    )

    if not action:

        action = nba.get(
            "recommended_action"
        )

    if not action:

        action = nba.get(
            "next_action"
        )

    reason = nba.get(
        "reason"
    )

    if not reason:

        reason = nba.get(
            "explanation"
        )

    if not reason:

        reason = nba.get(
            "description"
        )

    approval_route = nba.get(
        "approval_route"
    )

    approval_required = nba.get(
        "approval_required"
    )

    if verdict == "uncertain" and not action:

        action = "review_transaction"

        reason = (
            reason
            or
            "Evidence is inconclusive. Review the transaction "
            "and customer history before taking further action."
        )

        approval_route = (
            approval_route
            or
            "human_analyst"
        )

        approval_required = True

    if not action:

        action = "review_transaction"

    if not reason:

        if verdict == "fraud":

            reason = (
                "Review the evidence and follow the applicable "
                "fraud response policy."
            )

        elif verdict == "legit":

            reason = (
                "No immediate fraud action is recommended based "
                "on the available investigation evidence."
            )

        else:

            reason = (
                "Additional analyst review is recommended because "
                "the available evidence is inconclusive."
            )

    if not approval_route:

        approval_route = (
            "human_analyst"
            if verdict != "legit"
            else
            "automatic"
        )

    if approval_required is None:

        approval_required = (
            verdict != "legit"
        )

    return {

        **nba,

        "action":
            action,

        "reason":
            reason,

        "approval_route":
            approval_route,

        "approval_required":
            bool(approval_required),

    }


# -------------------------------------------------------------------
# Frontend investigation
# -------------------------------------------------------------------

def _build_frontend_investigation(
    case_text,
    initial_risk,
    tool_data,
    result
):

    graph_evidence = _build_graph_evidence(
        tool_data
    )

    patterns = _build_patterns(
        tool_data
    )

    graph_risk = _calculate_graph_risk(
        initial_risk,
        tool_data,
        patterns
    )

    verdict = str(
        result.get(
            "verdict",
            "uncertain"
        )
    ).lower()

    if verdict not in {
        "fraud",
        "legit",
        "uncertain"
    }:

        verdict = "uncertain"

    confidence = _safe_number(
        result.get(
            "confidence",
            0
        ),
        0
    )

    confidence = max(
        0,
        min(
            1,
            confidence
        )
    )

    gemini_evidence = result.get(
        "evidence",
        []
    )

    if not isinstance(
        gemini_evidence,
        list
    ):

        gemini_evidence = []

    # ---------------------------------------------------------------
    # Gemini does not freely invent a risk number.
    #
    # It can influence the deterministic score only through a small
    # bounded adjustment based on its investigation verdict.
    #
    # This keeps the final score grounded in the application risk
    # model while still allowing the agent's evidence-based analysis
    # to affect the final result.
    # ---------------------------------------------------------------

    final_risk = graph_risk

    if verdict == "fraud":

        final_risk = min(
            100,
            round(
                graph_risk
                + confidence * 10
            )
        )

    elif verdict == "legit":

        final_risk = max(
            0,
            round(
                graph_risk
                - confidence * 10
            )
        )

    # If Gemini is uncertain, leave the deterministic score unchanged.
    if verdict == "uncertain":

        final_risk = graph_risk

    evidence_summary = gemini_evidence

    if not evidence_summary:

        evidence_summary = [
            "No evidence summary returned by Gemini."
        ]

    nba = _build_next_best_action(

        verdict=verdict,

        confidence=confidence,

        evidence_count=len(
            graph_evidence
        )

    )

    retrieval_status = tool_data.get(
        "retrieval_status",
        "unknown"
    )

    transaction_retrieval_status = tool_data.get(
        "transaction_retrieval_status",
        "unknown"
    )

    return {

        "graph_evidence":
            graph_evidence,

        "patterns":
            patterns,

        "risk": {

            # This is now the actual flagged transaction risk,
            # not a user-entered risk score.
            "initial":
                round(
                    initial_risk * 100
                ),

            "graph":
                graph_risk,

            "final":
                final_risk,

            "label":
                (
                    "High risk"
                    if final_risk >= 70
                    else
                    "Medium risk"
                    if final_risk >= 40
                    else
                    "Low risk"
                ),

        },

        "agent": {

            "name":
                "Fraud Investigation Agent",

            "summary":
                result.get(
                    "reasoning",
                    ""
                ),

            "interpretation":
                result.get(
                    "reasoning",
                    ""
                ),

            "decision":
                verdict,

            "confidence":
                confidence,

            "reasoning":
                result.get(
                    "reasoning",
                    ""
                ),

            "evidence_summary":
                evidence_summary,

        },

        "next_best_action":
            nba,

        "customer_profile":
            _build_customer_profile(
                tool_data
            ),

        "retrieval": {

            "status":
                retrieval_status,

            "transaction_status":
                transaction_retrieval_status,

            "customer_id":
                tool_data.get(
                    "customer_id"
                ),

            "transaction_id":
                tool_data.get(
                    "transaction_id"
                ),

            "profile_retrieved":
                retrieval_status
                == "succeeded",

            "flagged_transaction_retrieved":
                transaction_retrieval_status
                == "succeeded",

            "cards_count":
                len(
                    tool_data.get(
                        "cards",
                        []
                    )
                ),

            "transactions_count":
                len(
                    tool_data.get(
                        "transactions",
                        []
                    )
                ),

            "devices_count":
                len(
                    tool_data.get(
                        "devices",
                        []
                    )
                ),

            "past_cases_count":
                len(
                    tool_data.get(
                        "past_cases",
                        []
                    )
                ),

        },

    }


# -------------------------------------------------------------------
# Extract customer ID
# -------------------------------------------------------------------

def _extract_customer_id(
    case_text
):

    match = re.search(
        r"Customer ID:\s*([A-Za-z0-9_-]+)",
        case_text,
        re.IGNORECASE
    )

    if match:
        return match.group(1)

    return None


# -------------------------------------------------------------------
# Mandatory TigerGraph customer retrieval
# -------------------------------------------------------------------

def _retrieve_customer_profile(
    customer_id,
    collected_tool_data
):

    if not customer_id:

        collected_tool_data[
            "retrieval_status"
        ] = "missing_customer_id"

        return {
            "error":
                "Customer ID is missing."
        }

    try:

        result = _execute_tool(

            "customer_profile",

            {
                "customer_id":
                    customer_id,

                "recent_n":
                    30
            }

        )

        if not isinstance(
            result,
            dict
        ):

            collected_tool_data[
                "retrieval_status"
            ] = "failed"

            return {
                "error":
                    (
                        "customer_profile returned "
                        "an invalid response."
                    )
            }

        if "error" in result:

            collected_tool_data[
                "retrieval_status"
            ] = "failed"

            return result

        collected_tool_data[
            "customer_id"
        ] = customer_id

        collected_tool_data[
            "cards"
        ] = result.get(
            "cards",
            []
        )

        collected_tool_data[
            "transactions"
        ] = result.get(
            "transactions",
            []
        )

        collected_tool_data[
            "devices"
        ] = result.get(
            "devices",
            []
        )

        collected_tool_data[
            "past_cases"
        ] = result.get(
            "past_cases",
            []
        )

        has_any_data = any([

            collected_tool_data[
                "cards"
            ],

            collected_tool_data[
                "transactions"
            ],

            collected_tool_data[
                "devices"
            ],

            collected_tool_data[
                "past_cases"
            ]

        ])

        if has_any_data:

            collected_tool_data[
                "retrieval_status"
            ] = "succeeded"

        else:

            collected_tool_data[
                "retrieval_status"
            ] = "empty"

        return result

    except Exception as exc:

        collected_tool_data[
            "retrieval_status"
        ] = "failed"

        return {
            "error":
                str(exc)
        }


# -------------------------------------------------------------------
# Additional Gemini-selected tool
# -------------------------------------------------------------------

def _run_additional_tool(
    function_name,
    function_args,
    collected_tool_data
):

    result = _execute_tool(
        function_name,
        function_args
    )

    if not isinstance(
        result,
        dict
    ):

        return result

    if "error" in result:
        return result

    if function_name == "customer_profile":

        customer_id = function_args.get(
            "customer_id"
        )

        if customer_id:

            collected_tool_data[
                "customer_id"
            ] = customer_id

        for key in [
            "cards",
            "transactions",
            "devices",
            "past_cases"
        ]:

            if key in result:

                collected_tool_data[
                    key
                ] = result[key]

    elif function_name == "transaction_profile":

        transaction_id = function_args.get(
            "transaction_id"
        )

        if transaction_id:

            collected_tool_data[
                "transaction_id"
            ] = transaction_id

        if result.get(
            "found"
        ):

            collected_tool_data[
                "flagged_transaction"
            ] = result.get(
                "transaction"
            )

            collected_tool_data[
                "transaction_retrieval_status"
            ] = "succeeded"

        else:

            collected_tool_data[
                "flagged_transaction"
            ] = None

            collected_tool_data[
                "transaction_retrieval_status"
            ] = "not_found"

    elif function_name == "velocity_check":

        collected_tool_data[
            "velocity"
        ] = result

        customer_id = function_args.get(
            "customer_id"
        )

        if (
            customer_id
            and not collected_tool_data.get(
                "transactions"
            )
        ):

            profile = _execute_tool(

                "customer_profile",

                {
                    "customer_id":
                        customer_id,

                    "recent_n":
                        30
                }

            )

            if (
                isinstance(
                    profile,
                    dict
                )
                and "error" not in profile
            ):

                collected_tool_data[
                    "customer_id"
                ] = customer_id

                collected_tool_data[
                    "cards"
                ] = profile.get(
                    "cards",
                    []
                )

                collected_tool_data[
                    "transactions"
                ] = profile.get(
                    "transactions",
                    []
                )

                collected_tool_data[
                    "devices"
                ] = profile.get(
                    "devices",
                    []
                )

                collected_tool_data[
                    "past_cases"
                ] = profile.get(
                    "past_cases",
                    []
                )

    return result


# -------------------------------------------------------------------
# Main investigation
# -------------------------------------------------------------------

def investigate(
    case_text: str
):

    normalized_case = normalize_case(
        case_text
    )

    customer_id = _extract_customer_id(
        normalized_case
    )

    transaction_id = _extract_transaction_id(
        normalized_case
    )

    # ---------------------------------------------------------------
    # IMPORTANT:
    #
    # We intentionally DO NOT use "Model risk score" from the case.
    #
    # For new investigations the score must come from the actual
    # transaction retrieved from TigerGraph.
    # ---------------------------------------------------------------

    initial_risk = 0.0

    collected_tool_data = {

        "customer_id":
            None,

        "transaction_id":
            transaction_id,

        "flagged_transaction":
            None,

        "cards":
            [],

        "transactions":
            [],

        "devices":
            [],

        "past_cases":
            [],

        "velocity":
            None,

        "retrieval_status":
            "not_attempted",

        "transaction_retrieval_status":
            "not_attempted",

    }

    # ===============================================================
    # MANDATORY TIGERGRAPH CUSTOMER RETRIEVAL
    # ===============================================================

    baseline_profile = _retrieve_customer_profile(

        customer_id,

        collected_tool_data

    )

    # ===============================================================
    # MANDATORY EXACT TRANSACTION RETRIEVAL
    # ===============================================================

    flagged_transaction_result = (
        _retrieve_flagged_transaction(
            transaction_id,
            collected_tool_data
        )
    )

    flagged_transaction = collected_tool_data.get(
        "flagged_transaction"
    )

    # ===============================================================
    # Get actual transaction risk
    # ===============================================================

    if flagged_transaction:

        transaction_risk = _safe_number(
            flagged_transaction.get(
                "risk_score"
            ),
            0.0
        )

        # Handle either 0-1 or 0-100 representation.
        if transaction_risk > 1:

            transaction_risk = (
                transaction_risk / 100
            )

        initial_risk = max(
            0,
            min(
                1,
                transaction_risk
            )
        )

    # ===============================================================
    # If the exact transaction was found in the recent profile,
    # make sure the data remains consistent.
    # ===============================================================

    if (
        flagged_transaction
        and not collected_tool_data.get(
            "transactions"
        )
    ):

        collected_tool_data[
            "transactions"
        ] = [
            flagged_transaction
        ]

    # ===============================================================
    # GEMINI CLIENT
    # ===============================================================

    try:

        client = genai.Client(
            api_key=GEMINI_API_KEY
        )

    except Exception as exc:

        final_result = {

            "verdict":
                "uncertain",

            "confidence":
                0.0,

            "evidence": [

                (
                    "TigerGraph customer retrieval status: "
                    f"{collected_tool_data.get('retrieval_status', 'not_attempted')}"
                ),

                (
                    "TigerGraph transaction retrieval status: "
                    f"{collected_tool_data.get('transaction_retrieval_status', 'not_attempted')}"
                ),

                (
                    "Gemini client initialization failed: "
                    f"{exc}"
                ),

            ],

            "reasoning":
                "Gemini client initialization failed."

        }

        return _build_frontend_investigation(

            normalized_case,

            initial_risk,

            collected_tool_data,

            final_result

        )

    # ===============================================================
    # Prepare Gemini tools
    # ===============================================================

    tool_schemas = _build_tool_schemas()

    gemini_tools = [

        types.Tool(
            function_declarations=tool_schemas
        )

    ]

    # ===============================================================
    # Initial evidence sent to Gemini
    # ===============================================================

    baseline_for_model = _compact_tool_result(
        baseline_profile
    )

    transaction_for_model = _compact_tool_result(
        flagged_transaction_result
    )

    prompt = f"""
Investigate the following fraud case.

CASE:
{normalized_case}

MANDATORY TIGERGRAPH CUSTOMER PROFILE:
{json.dumps(baseline_for_model, indent=2, default=str)}

MANDATORY TIGERGRAPH EXACT TRANSACTION LOOKUP:
{json.dumps(transaction_for_model, indent=2, default=str)}

TigerGraph customer retrieval status:
{collected_tool_data.get("retrieval_status")}

TigerGraph exact transaction retrieval status:
{collected_tool_data.get("transaction_retrieval_status")}

The application has already retrieved the exact flagged transaction
when a transaction ID was available.

Use the exact flagged transaction as the primary transaction evidence.

Pay attention to:

- actual transaction risk score
- transaction amount
- transaction timestamp
- transaction region
- transaction channel
- previous confirmed fraud cases
- recent high-risk transactions
- transaction timing
- velocity behavior
- connected devices
- cards
- graph relationships

If additional investigation is needed, you may use the available tools.

Do not invent evidence.

Do not generate a numerical risk score.
The application calculates the numerical risk score separately.

Your task is to provide an evidence-based fraud verdict,
confidence, evidence, and reasoning.

Return the final result in JSON.
"""

    contents = [

        types.Content(

            role="user",

            parts=[

                types.Part(
                    text=prompt
                )

            ]

        )

    ]

    result = None

    # ===============================================================
    # Gemini investigation loop
    # ===============================================================

    for step in range(MAX_STEPS):

        try:

            response = client.models.generate_content(

                model=MODEL,

                contents=contents,

                config=types.GenerateContentConfig(

                    system_instruction=SYSTEM_PROMPT,

                    tools=gemini_tools,

                    temperature=0.1,

                )

            )

        except Exception as exc:

            result = {

                "verdict":
                    "uncertain",

                "confidence":
                    0.0,

                "evidence": [

                    (
                        "TigerGraph customer retrieval status: "
                        f"{collected_tool_data.get('retrieval_status')}"
                    ),

                    (
                        "TigerGraph transaction retrieval status: "
                        f"{collected_tool_data.get('transaction_retrieval_status')}"
                    ),

                    (
                        "Gemini investigation request failed: "
                        f"{exc}"
                    ),

                ],

                "reasoning":
    f"The investigation could not be completed by Gemini. Error: {exc}"

            }

            break

        # -----------------------------------------------------------
        # Check for function calls
        # -----------------------------------------------------------

        function_calls = []

        try:

            if response.candidates:

                candidate = response.candidates[0]

                if candidate.content:

                    for part in candidate.content.parts:

                        if getattr(
                            part,
                            "function_call",
                            None
                        ):

                            function_calls.append(
                                part.function_call
                            )

        except Exception:

            function_calls = []

        # -----------------------------------------------------------
        # No function calls = final Gemini response
        # -----------------------------------------------------------

        if not function_calls:

            text = _extract_text(
                response
            )

            parsed = _parse_verdict(
                text
            )

            if parsed:

                result = parsed

            else:

                result = {

                    "verdict":
                        "uncertain",

                    "confidence":
                        0.0,

                    "evidence": [

                        (
                            "Gemini returned a response "
                            "that was not valid JSON."
                        )

                    ],

                    "reasoning":
                        text or
                        "No valid Gemini response was returned."

                }

            break

        # -----------------------------------------------------------
        # Execute requested tools
        # -----------------------------------------------------------

        contents.append(
            response.candidates[0].content
        )

        for function_call in function_calls:

            function_name = function_call.name

            function_args = dict(
                function_call.args
                or {}
            )

            tool_result = _run_additional_tool(

                function_name,

                function_args,

                collected_tool_data

            )

            compact_result = _compact_tool_result(
                tool_result
            )

            contents.append(

    types.Content(

        role="user",

        parts=[
            types.Part.from_function_response(

                            name=function_name,

                            response=compact_result

                        )

                    ]

                )

            )

        if step < MAX_STEPS - 1:

            time.sleep(0.3)

    # ===============================================================
    # Safety fallback
    # ===============================================================

    if result is None:

        result = {

            "verdict":
                "uncertain",

            "confidence":
                0.0,

            "evidence": [

                "Investigation reached the maximum number of steps."

            ],

            "reasoning":
                "The agent could not produce a final conclusion."

        }

    # ===============================================================
    # Validate result
    # ===============================================================

    if not isinstance(
        result,
        dict
    ):

        result = {

            "verdict":
                "uncertain",

            "confidence":
                0.0,

            "evidence": [
                "Invalid investigation result."
            ],

            "reasoning":
                "The investigation returned an invalid result."

        }

    result.setdefault(
        "verdict",
        "uncertain"
    )

    result.setdefault(
        "confidence",
        0.0
    )

    result.setdefault(
        "evidence",
        []
    )

    result.setdefault(
        "reasoning",
        ""
    )

    # ===============================================================
    # Normalize Gemini confidence
    # ===============================================================

    result["confidence"] = max(
        0,
        min(
            1,
            _safe_number(
                result.get(
                    "confidence",
                    0
                ),
                0
            )
        )
    )

    # ===============================================================
    # Build complete frontend response
    # ===============================================================

    return _build_frontend_investigation(

        normalized_case,

        initial_risk,

        collected_tool_data,

        result

    )
