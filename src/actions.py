from typing import Dict
from src.policy import check_action


def recommend_action(
    verdict: str,
    confidence: float,
    evidence_count: int = 0
) -> Dict:
    """
    Deterministic next-best-action layer.

    Gemini provides the investigation verdict and confidence.
    This function decides the allowed action and approval route.
    """

    if verdict == "fraud":
        if confidence >= 0.85:
            action = "block_card"
        elif confidence >= 0.65:
            action = "request_customer_verification"
        else:
            action = "escalate_to_human"

    elif verdict == "legit":
        if confidence >= 0.80:
            action = "no_action"
        else:
            action = "escalate_to_human"

    else:
        action = "escalate_to_human"

    policy = check_action(action)

    return {
        "recommended_action": action,
        "confidence": confidence,
        "evidence_count": evidence_count,
        "allowed": policy["allowed"],
        "requires_approval": policy["requires_approval"],
        "approval_route": (
            "human_analyst"
            if policy["requires_approval"]
            else "automatic"
        ),
        "policy_reason": policy["reason"],
    }


def create_action_record(
    case_id: str,
    action: str,
    requires_approval: bool,
    approved: bool = False
) -> Dict:

    policy = check_action(action)

    return {
        "case_id": case_id,
        "action": action,
        "allowed": policy["allowed"],
        "requires_approval": requires_approval,
        "approved": approved,
        "status": (
            "approved"
            if approved
            else "pending_approval"
            if requires_approval
            else "recommended"
        ),
    }


def execute_simulated_action(
    case_id: str,
    action: str,
    approved: bool = False
) -> Dict:

    policy = check_action(action)

    if not policy["allowed"]:
        return {
            "case_id": case_id,
            "action": action,
            "executed": False,
            "reason": policy["reason"],
        }

    if policy["requires_approval"] and not approved:
        return {
            "case_id": case_id,
            "action": action,
            "executed": False,
            "reason": "Human approval is required before execution.",
        }

    return {
        "case_id": case_id,
        "action": action,
        "executed": True,
        "simulated": True,
        "message": (
            f"Simulated action '{action}' executed successfully."
        ),
    }
