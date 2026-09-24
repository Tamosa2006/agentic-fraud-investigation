"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { FraudCase, CaseInvestigation } from "@/types/fraud";
import {
  fetchCaseInvestigation,
  investigateCase,
} from "@/lib/api";

type Props = {
  fraudCase: FraudCase;
  onClose: () => void;
};

type QueryCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  children?: ReactNode;
};

function getRiskLevel(score?: number | null) {
  if (score === undefined || score === null) {
    return "Unknown";
  }

  if (score >= 80) return "High";
  if (score >= 50) return "Medium";

  return "Low";
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function humanize(value?: string) {
  if (!value) return "—";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function QueryIcon({
  type,
}: {
  type: "customer" | "transactions" | "devices" | "cases" | "cards";
}) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (type === "customer") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c.8-3.5 3.1-5.5 7-5.5s6.2 2 7 5.5" />
      </svg>
    );
  }

  if (type === "transactions") {
    return (
      <svg {...common}>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h10" />
        <circle cx="18" cy="18" r="2" />
      </svg>
    );
  }

  if (type === "devices") {
    return (
      <svg {...common}>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 7h6" />
        <path d="M10 17h4" />
      </svg>
    );
  }

  if (type === "cases") {
    return (
      <svg {...common}>
        <path d="M5 4h14v16H5z" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10h10" />
      <path d="M8 14h2" />
      <path d="M14 14h3" />
    </svg>
  );
}

function QueryCard({
  title,
  description,
  icon,
  children,
}: QueryCardProps) {
  return (
    <article className="investigation-query-card">
      <div className="investigation-query-header">
        <div className="investigation-query-icon">
          {icon}
        </div>

        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      {children}
    </article>
  );
}

function EmptyState({
  text = "No data returned",
}: {
  text?: string;
}) {
  return (
    <div className="investigation-empty">
      <span>{text}</span>
    </div>
  );
}

export default function CaseInvestigationModal({
  fraudCase,
  onClose,
}: Props) {
  const [investigation, setInvestigation] =
    useState<CaseInvestigation | null>(null);

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * The case list contains the original model risk score.
   * Once the investigation has run, prefer the final
   * graph-backed investigation risk.
   */
  const investigationFinalRisk =
    typeof investigation?.risk?.final === "number"
      ? investigation.risk.final
      : null;

  const displayRisk =
    investigationFinalRisk ??
    fraudCase.risk_score ??
    null;

  const riskLevel = getRiskLevel(displayRisk);

  useEffect(() => {
    let cancelled = false;

    async function loadInvestigation() {
      try {
        setLoading(true);
        setError(null);

        const data =
          await fetchCaseInvestigation(
            fraudCase.case_id
          );

        if (!cancelled) {
          setInvestigation(data);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Investigation data could not be loaded."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInvestigation();

    return () => {
      cancelled = true;
    };
  }, [fraudCase.case_id]);

  async function handleRunInvestigation() {
    try {
      setRunning(true);
      setError(null);

      await investigateCase(fraudCase.case_id);

      const data =
        await fetchCaseInvestigation(
          fraudCase.case_id
        );

      setInvestigation(data);
    } catch {
      setError(
        "The investigation could not be completed."
      );
    } finally {
      setRunning(false);
    }
  }

  const profile =
    investigation?.customer_profile;

  const transactions =
    profile?.transactions || [];

  const cards =
    profile?.cards || [];

  const devices =
    profile?.devices || [];

  const pastCases =
    profile?.past_cases || [];

  const graphEvidence =
    investigation?.graph_evidence || [];

  const patterns =
    investigation?.patterns || [];

  const nextBestAction =
    investigation?.next_best_action;

  const evidenceCount =
    graphEvidence.length;

  const patternCount =
    patterns.length;

  const confirmedCases = useMemo(() => {
    return pastCases.filter(
      (item) => {
        const outcome =
          item.outcome?.toLowerCase() || "";

        return (
          outcome === "confirmed fraud" ||
          outcome === "confirmed_fraud"
        );
      }
    ).length;
  }, [pastCases]);

  return (
    <div
      className="investigation-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="investigation-title"
    >
      <div className="investigation-modal">

        {/* =====================================================
            HEADER
            ===================================================== */}

        <header className="investigation-header">
          <div className="investigation-header-left">

            <button
              type="button"
              className="investigation-back-button"
              onClick={onClose}
              aria-label="Close investigation"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div>
              <div className="investigation-eyebrow">
                FRAUD INVESTIGATION
              </div>

              <div className="investigation-title-row">
                <h1 id="investigation-title">
                  {fraudCase.case_id}
                </h1>

                <span
                  className={`investigation-risk-badge ${riskLevel.toLowerCase()}`}
                >
                  {riskLevel} Risk
                </span>
              </div>

              <p className="investigation-subtitle">
                {fraudCase.alert_type ||
                  "Suspicious activity"}{" "}
                ·{" "}
                {fraudCase.customer_id ||
                  "Unknown customer"}
              </p>
            </div>
          </div>

          <div className="investigation-header-right">
            <div className="investigation-live-indicator">
              <span />
              INVESTIGATION ACTIVE
            </div>

            <button
              type="button"
              className="investigation-close-button"
              onClick={onClose}
              aria-label="Close"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          </div>
        </header>

        <main className="investigation-body">

          {/* =====================================================
              ALERT SUMMARY
              ===================================================== */}

          <section className="investigation-hero">

            <div className="investigation-hero-main">
              <div className="investigation-section-kicker">
                ALERT SUMMARY
              </div>

              <h2>
                {fraudCase.alert_type ||
                  "Suspicious transaction detected"}
              </h2>

              <p>
                {fraudCase.alert_description ||
                  "No alert description was provided."}
              </p>
            </div>

            <div className="investigation-risk-panel">
              <span>RISK SCORE</span>

              <strong>
                {displayRisk ?? "—"}
              </strong>

              <div className="risk-meter">
                <div
                  style={{
                    width: `${Math.min(
                      Math.max(displayRisk || 0, 0),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

          </section>

          {/* =====================================================
              QUICK METRICS
              ===================================================== */}

          <section className="investigation-metrics">

            <div className="investigation-metric">
              <span>Customer</span>
              <strong>
                {fraudCase.customer_id || "—"}
              </strong>
            </div>

            <div className="investigation-metric">
              <span>Transaction</span>
              <strong>
                {fraudCase.transaction_id || "—"}
              </strong>
            </div>

            <div className="investigation-metric">
              <span>Graph Evidence</span>
              <strong>{evidenceCount}</strong>
            </div>

            <div className="investigation-metric">
              <span>Patterns</span>
              <strong>{patternCount}</strong>
            </div>

            <div className="investigation-metric">
              <span>Past Fraud Cases</span>
              <strong>{confirmedCases}</strong>
            </div>

          </section>

          {/* =====================================================
              INVESTIGATION CONTROLS
              ===================================================== */}

          <section className="investigation-control-bar">

            <div>
              <span className="investigation-section-kicker">
                AGENT CONTROL
              </span>

              <strong>
                Graph-backed investigation
              </strong>

              <p>
                Run the investigation to refresh
                graph evidence, customer history,
                risk analysis and policy actions.
              </p>
            </div>

            <button
              type="button"
              className="investigation-run-button"
              onClick={handleRunInvestigation}
              disabled={running}
            >
              {running ? (
                <>
                  <span className="investigation-spinner" />
                  Running...
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>

                  Run investigation
                </>
              )}
            </button>

          </section>

          {/* =====================================================
              ERROR
              ===================================================== */}

          {error && (
            <div className="investigation-error">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5" />
                <path d="M12 16h.01" />
              </svg>

              <span>{error}</span>
            </div>
          )}

          {/* =====================================================
              LOADING
              ===================================================== */}

          {loading ? (
            <div className="investigation-loading">

              <div className="investigation-loader-ring" />

              <h3>
                Building investigation workspace
              </h3>

              <p>
                Loading graph evidence, customer
                history and policy analysis...
              </p>

            </div>
          ) : (
            <>

              {/* =================================================
                  CUSTOMER / GRAPH QUERIES
                  ================================================= */}

              <section className="investigation-section">

                <div className="investigation-section-header">
                  <div>
                    <span className="investigation-section-kicker">
                      GRAPH INTELLIGENCE
                    </span>

                    <h2>
                      Customer investigation
                    </h2>

                    <p>
                      Data retrieved from the fraud
                      graph for this investigation.
                    </p>
                  </div>

                  <div className="investigation-source-badge">
                    TIGERGRAPH
                  </div>
                </div>

                <div className="investigation-query-grid">

                  <QueryCard
                    title="Customer profile"
                    description="Cards and connected customer information"
                    icon={
                      <QueryIcon type="customer" />
                    }
                  >
                    <div className="query-stat-grid">

                      <div>
                        <span>Customer ID</span>
                        <strong>
                          {fraudCase.customer_id ||
                            "—"}
                        </strong>
                      </div>

                      <div>
                        <span>Cards</span>
                        <strong>
                          {cards.length}
                        </strong>
                      </div>

                    </div>
                  </QueryCard>

                  <QueryCard
                    title="Recent transactions"
                    description="Recent activity connected to the customer"
                    icon={
                      <QueryIcon type="transactions" />
                    }
                  >
                    {transactions.length === 0 ? (
                      <EmptyState />
                    ) : (
                      <div className="query-list">

                        {transactions
                          .slice(0, 6)
                          .map((transaction) => (
                            <div
                              className="query-list-row"
                              key={
                                transaction.txn_id
                              }
                            >
                              <div>
                                <strong>
                                  {transaction.txn_id ||
                                    "Transaction"}
                                </strong>

                                <span>
                                  {transaction.ts ||
                                    "Unknown time"}
                                </span>
                              </div>

                              <strong>
                                {transaction.amount !==
                                undefined
                                  ? `$${transaction.amount}`
                                  : "—"}
                              </strong>
                            </div>
                          ))}

                      </div>
                    )}
                  </QueryCard>

                  <QueryCard
                    title="Connected devices"
                    description="Devices linked through transaction activity"
                    icon={
                      <QueryIcon type="devices" />
                    }
                  >
                    {devices.length === 0 ? (
                      <EmptyState text="No connected devices returned" />
                    ) : (
                      <div className="query-chip-list">
                        {devices.map((device) => (
                          <span
                            className="query-chip"
                            key={device}
                          >
                            {device}
                          </span>
                        ))}
                      </div>
                    )}
                  </QueryCard>

                  <QueryCard
                    title="Cards"
                    description="Cards associated with the customer"
                    icon={
                      <QueryIcon type="cards" />
                    }
                  >
                    {cards.length === 0 ? (
                      <EmptyState text="No cards returned" />
                    ) : (
                      <div className="query-chip-list">
                        {cards.map((card) => (
                          <span
                            className="query-chip"
                            key={card}
                          >
                            {card}
                          </span>
                        ))}
                      </div>
                    )}
                  </QueryCard>

                  <QueryCard
                    title="Past fraud cases"
                    description="Historical cases connected to this customer"
                    icon={
                      <QueryIcon type="cases" />
                    }
                  >
                    {pastCases.length === 0 ? (
                      <EmptyState text="No historical cases returned" />
                    ) : (
                      <div className="query-list">

                        {pastCases
                          .slice(0, 6)
                          .map((pastCase) => (
                            <div
                              className="query-list-row"
                              key={
                                pastCase.case_id
                              }
                            >
                              <div>
                                <strong>
                                  {pastCase.case_id ||
                                    "Case"}
                                </strong>

                                <span>
                                  {humanize(
                                    pastCase.outcome
                                  )}
                                </span>
                              </div>

                              <span
                                className={`query-outcome ${
                                  pastCase.outcome
                                    ?.toLowerCase()
                                    .includes(
                                      "fraud"
                                    )
                                    ? "fraud"
                                    : "clear"
                                }`}
                              >
                                {humanize(
                                  pastCase.outcome
                                )}
                              </span>
                            </div>
                          ))}

                      </div>
                    )}
                  </QueryCard>

                </div>
              </section>

              {/* =================================================
                  GRAPH EVIDENCE
                  ================================================= */}

              <section className="investigation-section">

                <div className="investigation-section-header">
                  <div>
                    <span className="investigation-section-kicker">
                      GRAPH EVIDENCE
                    </span>

                    <h2>
                      Connected entities
                    </h2>

                    <p>
                      Relationships returned by the
                      fraud investigation graph.
                    </p>
                  </div>

                  <span className="investigation-count-badge">
                    {graphEvidence.length} findings
                  </span>
                </div>

                {graphEvidence.length === 0 ? (
                  <div className="investigation-empty-panel">
                    <h3>
                      No graph evidence returned
                    </h3>

                    <p>
                      The current investigation did
                      not return any graph relationships.
                    </p>
                  </div>
                ) : (
                  <div className="graph-evidence-table-wrap">
                    <table className="graph-evidence-table">
                      <thead>
                        <tr>
                          <th>Entity</th>
                          <th>Relationship</th>
                          <th>Connected To</th>
                          <th>Evidence</th>
                        </tr>
                      </thead>

                      <tbody>
                        {graphEvidence.map(
                          (
                            evidence,
                            index
                          ) => {
                            const item =
                              evidence as any;

                            const source =
                              item.source;

                            const target =
                              item.target;

                            const relationship =
                              item.relationship;

                            const sourceType =
                              item.source_type;

                            const targetType =
                              item.target_type;

                            const evidenceText =
                              [
                                item.outcome,
                                item.pattern,
                              ]
                                .filter(Boolean)
                                .map(
                                  (value) =>
                                    humanize(
                                      String(value)
                                    )
                                )
                                .join(" · ");

                            return (
                              <tr
                                key={`${source}-${relationship}-${target}-${index}`}
                              >
                                <td>
                                  <strong>
                                    {formatValue(
                                      source
                                    )}
                                  </strong>

                                  {sourceType && (
                                    <small>
                                      {humanize(
                                        sourceType
                                      )}
                                    </small>
                                  )}
                                </td>

                                <td>
                                  <span className="graph-edge">
                                    {formatValue(
                                      relationship
                                    )}
                                  </span>
                                </td>

                                <td>
                                  <strong>
                                    {formatValue(
                                      target
                                    )}
                                  </strong>

                                  {targetType && (
                                    <small>
                                      {humanize(
                                        targetType
                                      )}
                                    </small>
                                  )}
                                </td>

                                <td>
                                  {evidenceText ||
                                    `${humanize(
                                      sourceType
                                    )} → ${humanize(
                                      targetType
                                    )}`}
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

              </section>

              {/* =================================================
                  PATTERNS + RISK
                  ================================================= */}

              <section className="investigation-two-column">

                <div className="investigation-panel">

                  <div className="investigation-panel-header">
                    <div>
                      <span className="investigation-section-kicker">
                        DETECTION
                      </span>

                      <h2>
                        Fraud patterns
                      </h2>
                    </div>
                  </div>

                  {patterns.length === 0 ? (
                    <EmptyState text="No fraud patterns identified" />
                  ) : (
                    <div className="pattern-list">

                      {patterns.map(
                        (pattern, index) => {
                          const item =
                            pattern as any;

                          const patternName =
                            item.type ||
                            item.name ||
                            item.pattern;

                          return (
                            <div
                              className="pattern-item"
                              key={index}
                            >
                              <div className="pattern-marker">
                                <span />
                              </div>

                              <div>
                                <strong>
                                  {humanize(
                                    patternName
                                  )}
                                </strong>

                                <p>
                                  {formatValue(
                                    item.description
                                  )}
                                </p>

                                {item.count !==
                                  undefined && (
                                  <small>
                                    {item.count}{" "}
                                    finding
                                    {item.count ===
                                    1
                                      ? ""
                                      : "s"}
                                  </small>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}

                    </div>
                  )}

                </div>

                <div className="investigation-panel">

                  <div className="investigation-panel-header">
                    <div>
                      <span className="investigation-section-kicker">
                        RISK ANALYSIS
                      </span>

                      <h2>
                        Risk assessment
                      </h2>
                    </div>
                  </div>

                  <div className="risk-analysis-card">

                    <div className="risk-analysis-score">
                      <span>Overall risk</span>

                      <strong>
                        {displayRisk ?? "—"}
                      </strong>

                      <small>
                        {riskLevel} risk
                      </small>
                    </div>

                    {investigation?.risk && (
                      <div className="risk-analysis-details">

                        {Object.entries(
                          investigation.risk as Record<
                            string,
                            unknown
                          >
                        )
                          .slice(0, 6)
                          .map(
                            ([key, value]) => (
                              <div
                                key={key}
                              >
                                <span>
                                  {humanize(
                                    key
                                  )}
                                </span>

                                <strong>
                                  {formatValue(
                                    value
                                  )}
                                </strong>
                              </div>
                            )
                          )}

                      </div>
                    )}

                  </div>

                </div>

              </section>

              {/* =================================================
                  AGENT REASONING
                  ================================================= */}

              <section className="investigation-section">

                <div className="investigation-section-header">
                  <div>
                    <span className="investigation-section-kicker">
                      AGENT REASONING
                    </span>

                    <h2>
                      Investigation explanation
                    </h2>

                    <p>
                      Structured reasoning generated
                      from the available investigation
                      evidence.
                    </p>
                  </div>
                </div>

                <div className="agent-reasoning-card">

                  <div className="agent-avatar">
                    AI
                  </div>

                  <div className="agent-reasoning-content">

                    <div className="agent-reasoning-title">
                      <strong>
                        Fraud Investigation Agent
                      </strong>

                      <span>
                        Evidence-backed analysis
                      </span>
                    </div>

                    <p>
                      {investigation?.agent
                        ? formatValue(
                            (
                              investigation.agent as any
                            ).reasoning ||
                              (
                                investigation.agent as any
                              ).summary ||
                              (
                                investigation.agent as any
                              ).interpretation ||
                              (
                                investigation.agent as any
                              ).analysis
                          )
                        : "No agent reasoning was returned for this investigation."}
                    </p>

                  </div>

                </div>

              </section>

              {/* =================================================
                  NEXT BEST ACTION
                  ================================================= */}

              <section className="investigation-section nba-section">

                <div className="investigation-section-header">
                  <div>
                    <span className="investigation-section-kicker">
                      DECISION SUPPORT
                    </span>

                    <h2>
                      Next best action
                    </h2>

                    <p>
                      Policy-controlled action derived
                      from the investigation result.
                    </p>
                  </div>
                </div>

                <div className="nba-card">

                  <div className="nba-card-header">
                    <span className="nba-policy-badge">
                      POLICY CONTROLLED
                    </span>
                  </div>

                  <div className="nba-main">

                    <span className="nba-label">
                      RECOMMENDED ACTION
                    </span>

                    <h3>
                      {humanize(
                        nextBestAction?.action
                      ) ||
                        "No action available"}
                    </h3>

                    {nextBestAction?.reason && (
                      <p>
                        {nextBestAction.reason}
                      </p>
                    )}

                  </div>

                  <div className="nba-footer">

                    <div className="nba-approval">
                      <span className="nba-label">
                        APPROVAL ROUTE
                      </span>

                      <strong>
                        {nextBestAction
                          ?.approval_route ===
                        "human_analyst"
                          ? "Human Analyst"
                          : humanize(
                              nextBestAction
                                ?.approval_route
                            )}
                      </strong>
                    </div>

                    <div className="nba-status">
                      <span className="nba-status-dot" />

                      {nextBestAction
                        ?.approval_required
                        ? "Human approval required"
                        : "Automatic action permitted"}
                    </div>

                  </div>

                </div>

              </section>

            </>
          )}

        </main>
      </div>
    </div>
  );
}
