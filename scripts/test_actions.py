import sys
import os

sys.path.insert(
    0,
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

from src.actions import (
    recommend_action,
    create_action_record,
    execute_simulated_action,
)


print("=== NBA TEST ===")

result = recommend_action(
    verdict="fraud",
    confidence=0.91,
    evidence_count=5
)

print(result)


print("\n=== ACTION RECORD ===")

record = create_action_record(
    case_id="HHG-011",
    action=result["recommended_action"],
    requires_approval=result["requires_approval"],
)

print(record)


print("\n=== SIMULATED EXECUTION ===")

execution = execute_simulated_action(
    case_id="HHG-011",
    action=result["recommended_action"],
    approved=False,
)

print(execution)