from typing import List, Optional
from pydantic import BaseModel, Field


class Verdict(BaseModel):
    verdict: str
    confidence: float
    evidence: List[str]
    reasoning: str


class Evidence(BaseModel):
    source: str
    finding: str
    relevance: str = "supporting"


class ActionDecision(BaseModel):
    action: str
    requires_approval: bool = False
    approved: bool = False
    explanation: str = ""


class InvestigationRecord(BaseModel):
    case_id: str
    customer_id: Optional[str] = None
    flagged_transaction_id: Optional[str] = None
    evidence: List[Evidence] = Field(default_factory=list)
    verdict: str = "uncertain"
    confidence: float = 0.0
    recommended_action: str = "escalate_to_human"
    action_decision: Optional[ActionDecision] = None
    reasoning: str = ""
    additional_evidence_requested: bool = False
    additional_evidence_received: bool = False