from typing import Dict


ALLOWED_ACTIONS = {
    "block_card",
    "block_transaction",
    "monitor_account",
    "request_customer_verification",
    "request_additional_evidence",
    "create_case",
    "escalate_to_human",
    "no_action",
}


# Actions that require human approval.
APPROVAL_REQUIRED = {
    "block_card",
    "block_transaction",
    "monitor_account",
}


def check_action(action: str) -> Dict:
    """
    Check whether an action is known and whether it requires approval.
    """

    if action not in ALLOWED_ACTIONS:
        return {
            "allowed": False,
            "requires_approval": False,
            "action": action,
            "reason": "Action is not in the approved action list.",
        }

    requires_approval = action in APPROVAL_REQUIRED

    return {
        "allowed": True,
        "requires_approval": requires_approval,
        "action": action,
        "reason": (
            "Human approval required."
            if requires_approval
            else "Action may be performed by the agent workflow."
        ),
    }


def can_request_additional_evidence(evidence_requests: int) -> Dict:
    """
    Prevent the agent from requesting unlimited evidence.
    """

    max_requests = 2

    if evidence_requests >= max_requests:
        return {
            "allowed": False,
            "reason": "Maximum additional-evidence requests reached.",
        }

    return {
        "allowed": True,
        "reason": "Additional evidence request is permitted.",
    }


def policy_summary() -> Dict:
    """
    Return the policy configuration for the agent.
    """

    return {
        "allowed_actions": sorted(ALLOWED_ACTIONS),
        "approval_required": sorted(APPROVAL_REQUIRED),
        "max_additional_evidence_requests": 2,
    }