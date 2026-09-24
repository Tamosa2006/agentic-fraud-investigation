"use client";

import { FraudCase } from "@/types/fraud";

type Props = {
  fraudCase: FraudCase;
  onMaximize: (fraudCase: FraudCase) => void;
};

function getRiskLevel(score?: number) {
  if (score === undefined || score === null) {
    return "Unknown";
  }

  if (score >= 80) {
    return "High";
  }

  if (score >= 50) {
    return "Medium";
  }

  return "Low";
}

export default function CaseCard({
  fraudCase,
  onMaximize,
}: Props) {
  const riskLevel = getRiskLevel(
    fraudCase.risk_score
  );

  return (
    <article className="case-card">

      {/* TOP */}

      <div className="case-card-top">
        <div>
          <span className="case-card-label">
            CASE
          </span>

          <h3 className="case-card-id">
            {fraudCase.case_id}
          </h3>
        </div>

        <span
          className={
            fraudCase.source === "Live"
              ? "status-badge live"
              : "status-badge"
          }
        >
          {fraudCase.status || "Ready"}
        </span>
      </div>


      {/* DIVIDER */}

      <div className="case-card-divider" />


      {/* DETAILS */}

      <div className="case-card-details">

        <div className="case-card-detail">
          <span>Customer</span>

          <strong>
            {fraudCase.customer_id || "—"}
          </strong>
        </div>


        <div className="case-card-detail">
          <span>Transaction</span>

          <strong>
            {fraudCase.transaction_id || "—"}
          </strong>
        </div>


        <div className="case-card-detail">
          <span>Alert Type</span>

          <strong>
            {fraudCase.alert_type || "—"}
          </strong>
        </div>


        <div className="case-card-detail">
          <span>Risk</span>

          <strong
            className={`risk-value ${riskLevel.toLowerCase()}`}
          >
            {fraudCase.risk_score !== undefined
              ? fraudCase.risk_score
              : "—"}
          </strong>
        </div>

      </div>


      {/* DESCRIPTION */}

      {fraudCase.alert_description && (
        <p className="case-card-description">
          {fraudCase.alert_description}
        </p>
      )}


      {/* FOOTER */}

      <div className="case-card-footer">

        <span className="case-card-source">
          {fraudCase.source || "Benchmark"}
        </span>


        <button
          type="button"
          className="case-max-button"
          onClick={() => onMaximize(fraudCase)}
          aria-label={`Open investigation for ${fraudCase.case_id}`}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3" />
            <path d="M16 3h3a2 2 0 0 1 2 2v3" />
            <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
            <path d="M16 21h3a2 2 0 0 1 2-2v-3" />
          </svg>

          <span>Max</span>
        </button>

      </div>

    </article>
  );
}