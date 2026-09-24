import json
from pathlib import Path
from typing import Optional


MEMORY_DIR = Path("outputs")
MEMORY_FILE = MEMORY_DIR / "case_memory.json"


def _load_memory() -> list:
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)

    if not MEMORY_FILE.exists():
        return []

    try:
        with open(MEMORY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception:
        return []


def _save_memory(cases: list):
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)

    with open(MEMORY_FILE, "w", encoding="utf-8") as f:
        json.dump(cases, f, indent=2, default=str)


def save_case(case: dict) -> dict:
    """
    Save an investigation result into case memory.
    """

    cases = _load_memory()

    case_id = case.get("case_id")

    # Replace an existing record for the same case.
    cases = [
        existing
        for existing in cases
        if existing.get("case_id") != case_id
    ]

    cases.append(case)
    _save_memory(cases)

    return {
        "saved": True,
        "case_id": case_id,
        "total_cases": len(cases),
    }


def get_case(case_id: str) -> Optional[dict]:
    """
    Retrieve one previous investigation.
    """

    cases = _load_memory()

    for case in cases:
        if case.get("case_id") == case_id:
            return case

    return None


def get_customer_cases(customer_id: str) -> list:
    """
    Retrieve previous cases for a customer.
    """

    cases = _load_memory()

    return [
        case
        for case in cases
        if case.get("customer_id") == customer_id
    ]


def find_similar_cases(
    customer_id: Optional[str] = None,
    device_id: Optional[str] = None,
    pattern: Optional[str] = None,
    limit: int = 5,
) -> list:
    """
    Find previous investigations that share important entities
    or fraud-pattern information.
    """

    cases = _load_memory()
    matches = []

    for case in cases:
        score = 0

        if customer_id and case.get("customer_id") == customer_id:
            score += 3

        if device_id and device_id in case.get("devices", []):
            score += 3

        if pattern and case.get("fraud_pattern") == pattern:
            score += 2

        if score > 0:
            matches.append((score, case))

    matches.sort(key=lambda x: x[0], reverse=True)

    return [case for _, case in matches[:limit]]


def memory_summary(
    customer_id: Optional[str] = None,
    limit: int = 5,
) -> dict:
    """
    Return a compact summary of previous investigations.
    """

    if customer_id:
        cases = get_customer_cases(customer_id)
    else:
        cases = _load_memory()

    cases = cases[-limit:]

    return {
        "case_count": len(cases),
        "cases": cases,
    }