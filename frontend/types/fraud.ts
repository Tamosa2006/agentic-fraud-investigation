export type FraudCase = {
  case_id: string;
  customer_id?: string;
  transaction_id?: string;
  card_id?: string;
  alert_type?: string;
  risk_score?: number;
  alert_description?: string;
  source?: string;
  status?: string;
  created_at?: string;
};

export type GraphEvidence = {
  entity?: string;
  relationship?: string;
  target?: string;
  details?: string;
};

export type FraudPattern = {
  name?: string;
  description?: string;
  severity?: string;
};

export type RiskAnalysis = {
  initial?: number;
  graph?: number;
  final?: number;
};

export type AgentInvestigation = {
  summary?: string;
  interpretation?: string;
  decision?: string;
};

export type NextBestAction = {
  action?: string;
  reason?: string;
  approval_route?: string;
  approval_required?: boolean;
};


/* =========================================================
   ACTUAL TIGERGRAPH CUSTOMER PROFILE RESULT
   ========================================================= */

export type CustomerProfileTransaction = {
  txn_id?: string;
  amount?: number;
  ts?: string;
  channel?: string;
  product_cd?: string;
  region?: string;
  email_domain?: string;
  card_type?: string;
  risk_score?: number;
  device_id?: string;
  is_online?: boolean;
};

export type CustomerProfileCase = {
  case_id?: string;
  outcome?: string;
  pattern?: string;
  opened_at?: string;
  closed_at?: string;
  exposure_usd?: number;
  analyst_notes?: string;
};

export type CustomerProfileResult = {
  cards?: string[];

  transactions?: CustomerProfileTransaction[];

  devices?: string[];

  past_cases?: CustomerProfileCase[];
};


/* =========================================================
   CASE INVESTIGATION
   ========================================================= */

export type CaseInvestigation = {
  graph_evidence?: GraphEvidence[];

  patterns?: FraudPattern[];

  risk?: RiskAnalysis;

  agent?: AgentInvestigation;

  next_best_action?: NextBestAction;

  customer_profile?: CustomerProfileResult;
};