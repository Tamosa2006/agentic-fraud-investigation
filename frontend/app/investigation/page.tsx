"use client";

import {
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowRight,
  FileSearch,
  ShieldCheck,
  UserRound,
  CreditCard,
  Activity,
  Database,
  BrainCircuit,
  Gauge,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
} from "lucide-react";

import {
  createCase as apiCreateCase,
  investigateCase as apiInvestigateCase,
} from "@/lib/api";

import {
  FraudCase,
  CaseInvestigation,
} from "@/types/fraud";


export default function InvestigationPage() {

  const [form, setForm] = useState({
    case_id: "",
    customer_id: "",
    transaction_id: "",
    card_id: "",
    trigger_type: "",
    trigger_text: "",
  });


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState<string | null>(null);


  const [result, setResult] =
    useState<CaseInvestigation | null>(null);


  const [createdCase, setCreatedCase] =
    useState<FraudCase | null>(null);


  function updateField(
    field: keyof typeof form,
    value: string
  ) {

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

  }


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError(null);
    setResult(null);
    setCreatedCase(null);


    if (
      !form.case_id.trim() ||
      !form.customer_id.trim() ||
      !form.transaction_id.trim() ||
      !form.trigger_type.trim() ||
      !form.trigger_text.trim()
    ) {

      setError(
        "Please complete all required investigation fields."
      );

      return;
    }


    try {

      setLoading(true);


      const newCase =
        await apiCreateCase({

          case_id:
            form.case_id.trim(),

          customer_id:
            form.customer_id.trim(),

          transaction_id:
            form.transaction_id.trim(),

          card_id:
            form.card_id.trim(),

          trigger_type:
            form.trigger_type.trim(),

          trigger_text:
            form.trigger_text.trim(),

        });


      setCreatedCase(newCase);


      const investigation =
        await apiInvestigateCase(
          newCase.case_id
        );


      setResult(
        investigation
      );

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Investigation failed."
      );

    } finally {

      setLoading(false);

    }
  }


  const finalRisk =
    result?.risk?.final;


  function riskLabel(
    score: number | null | undefined
  ) {

    if (
      score === null ||
      score === undefined
    ) {

      return "Pending";
    }


    if (score >= 70) {
      return "High";
    }


    if (score >= 40) {
      return "Medium";
    }


    return "Low";
  }


  function riskClass(
    score: number | null | undefined
  ) {

    if (
      score === null ||
      score === undefined
    ) {

      return "risk-neutral";
    }


    if (score >= 70) {
      return "risk-high";
    }


    if (score >= 40) {
      return "risk-medium";
    }


    return "risk-low";
  }


  return (

    <div className="investigation-page">


      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <section className="investigation-hero">

        <div className="investigation-hero-copy">

          <div className="investigation-breadcrumb">

            <span>
              FRAUD OPERATIONS
            </span>

            <ArrowRight
              size={13}
            />

            <span>
              INVESTIGATION DESK
            </span>

          </div>


          <h1>
            New Investigation
          </h1>


          <p>
            Submit a fraud alert and let the investigation
            agent correlate transaction signals, customer
            history and graph evidence before recommending
            the next action.
          </p>

        </div>


        <div className="investigation-status">

          <div className="status-dot" />

          <div>

            <strong>
              Agent Online
            </strong>

            <span>
              Investigation pipeline ready
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          INVESTIGATION PIPELINE
          ===================================================== */}

      <section className="investigation-pipeline">

        <div className="pipeline-item active">

          <div className="pipeline-icon">
            <FileSearch size={16} />
          </div>

          <div>
            <strong>
              Alert
            </strong>

            <span>
              Intake
            </span>
          </div>

        </div>


        <ArrowRight
          className="pipeline-arrow"
          size={15}
        />


        <div className="pipeline-item">

          <div className="pipeline-icon">
            <Database size={16} />
          </div>

          <div>
            <strong>
              TigerGraph
            </strong>

            <span>
              Evidence
            </span>
          </div>

        </div>


        <ArrowRight
          className="pipeline-arrow"
          size={15}
        />


        <div className="pipeline-item">

          <div className="pipeline-icon">
            <Activity size={16} />
          </div>

          <div>
            <strong>
              Detection
            </strong>

            <span>
              Patterns
            </span>
          </div>

        </div>


        <ArrowRight
          className="pipeline-arrow"
          size={15}
        />


        <div className="pipeline-item">

          <div className="pipeline-icon">
            <BrainCircuit size={16} />
          </div>

          <div>
            <strong>
              Gemini
            </strong>

            <span>
              Reasoning
            </span>
          </div>

        </div>


        <ArrowRight
          className="pipeline-arrow"
          size={15}
        />


        <div className="pipeline-item">

          <div className="pipeline-icon">
            <Gauge size={16} />
          </div>

          <div>
            <strong>
              Risk
            </strong>

            <span>
              Decision
            </span>
          </div>

        </div>

      </section>


      {/* =====================================================
          MAIN WORKSPACE
          ===================================================== */}

      <div className="investigation-workspace">


        {/* ===================================================
            LEFT — ALERT INTAKE
            =================================================== */}

        <section className="investigation-form-card">

          <div className="workspace-card-header">

            <div className="workspace-card-heading">

              <div className="workspace-card-icon">
                <FileSearch size={18} />
              </div>

              <div>

                <span className="eyebrow">
                  ALERT INTAKE
                </span>

                <h2>
                  Investigation details
                </h2>

                <p>
                  Provide the identifiers and context
                  associated with this alert.
                </p>

              </div>

            </div>


            <span className="required-note">
              * Required
            </span>

          </div>


          <form
            onSubmit={handleSubmit}
            className="investigation-form"
          >


            {/* =========================
                IDENTIFIERS
            ========================= */}

            <div className="form-group-title">

              <span>
                CASE IDENTIFIERS
              </span>

            </div>


            <div className="form-grid">


              <div className="form-field">

                <label>
                  Case ID
                  <span>*</span>
                </label>

                <div className="input-wrapper">

                  <FileSearch size={15} />

                  <input
                    type="text"
                    value={form.case_id}
                    onChange={(event) =>
                      updateField(
                        "case_id",
                        event.target.value
                      )
                    }
                    placeholder="LIVE-001"
                  />

                </div>

              </div>


              <div className="form-field">

                <label>
                  Customer ID
                  <span>*</span>
                </label>

                <div className="input-wrapper">

                  <UserRound size={15} />

                  <input
                    type="text"
                    value={form.customer_id}
                    onChange={(event) =>
                      updateField(
                        "customer_id",
                        event.target.value
                      )
                    }
                    placeholder="C12382"
                  />

                </div>

              </div>


              <div className="form-field">

                <label>
                  Transaction ID
                  <span>*</span>
                </label>

                <div className="input-wrapper">

                  <Activity size={15} />

                  <input
                    type="text"
                    value={form.transaction_id}
                    onChange={(event) =>
                      updateField(
                        "transaction_id",
                        event.target.value
                      )
                    }
                    placeholder="3514030"
                  />

                </div>

              </div>


              <div className="form-field">

                <label>
                  Card ID
                </label>

                <div className="input-wrapper">

                  <CreditCard size={15} />

                  <input
                    type="text"
                    value={form.card_id}
                    onChange={(event) =>
                      updateField(
                        "card_id",
                        event.target.value
                      )
                    }
                    placeholder="C12382-K1"
                  />

                </div>

              </div>

            </div>


            {/* =========================
                ALERT CONTEXT
            ========================= */}

            <div className="form-group-title">

              <span>
                ALERT CONTEXT
              </span>

            </div>


            <div className="form-field">

              <label>
                Alert Type
                <span>*</span>
              </label>

              <div className="input-wrapper">

                <AlertTriangle size={15} />

                <select
                  value={form.trigger_type}
                  onChange={(event) =>
                    updateField(
                      "trigger_type",
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Select alert type
                  </option>

                  <option value="risk_score">
                    Risk Score Alert
                  </option>

                  <option value="suspicious_transaction">
                    Suspicious Transaction
                  </option>

                  <option value="velocity">
                    Transaction Velocity
                  </option>

                  <option value="unusual_activity">
                    Unusual Activity
                  </option>

                  <option value="fraud_pattern">
                    Fraud Pattern
                  </option>

                </select>

              </div>

            </div>


            <div className="form-field">

              <label>
                Alert Description
                <span>*</span>
              </label>

              <textarea
                value={form.trigger_text}
                onChange={(event) =>
                  updateField(
                    "trigger_text",
                    event.target.value
                  )
                }
                placeholder="Describe why this transaction was flagged and include any relevant alert context..."
                rows={5}
              />

              <span className="field-hint">
                Include the reason the alert was generated.
              </span>

            </div>


            {/* =========================
                AUTOMATIC RISK
            ========================= */}

            <div className="automatic-risk-card">

              <div className="automatic-risk-icon">

                <ShieldCheck size={19} />

              </div>


              <div className="automatic-risk-content">

                <strong>
                  Risk score calculated automatically
                </strong>

                <p>
                  No manual risk score is required. The
                  investigation engine calculates risk from
                  transaction signals, TigerGraph evidence,
                  customer history and detected patterns.
                </p>

              </div>

            </div>


            {/* =========================
                ERROR
            ========================= */}

            {error && (

              <div className="investigation-form-error">

                <AlertTriangle size={16} />

                <div>

                  <strong>
                    Investigation could not start
                  </strong>

                  <span>
                    {error}
                  </span>

                </div>

              </div>

            )}


            {/* =========================
                SUBMIT
            ========================= */}

            <button
              type="submit"
              className="start-investigation-button"
              disabled={loading}
            >

              {loading ? (

                <>

                  <span className="button-spinner" />

                  Running investigation...

                </>

              ) : (

                <>

                  Run Investigation

                  <ArrowRight size={17} />

                </>

              )}

            </button>


          </form>

        </section>


        {/* ===================================================
            RIGHT — AGENT OUTPUT
            =================================================== */}

        <section className="investigation-result-card">

          <div className="workspace-card-header">

            <div className="workspace-card-heading">

              <div className="workspace-card-icon result-icon">
                <BrainCircuit size={18} />
              </div>

              <div>

                <span className="eyebrow">
                  AGENT OUTPUT
                </span>

                <h2>
                  Investigation result
                </h2>

                <p>
                  Evidence, reasoning and policy action
                  generated by the investigation pipeline.
                </p>

              </div>

            </div>


            <div className="output-status">

              <span className={
                result
                  ? "output-status-dot complete"
                  : loading
                    ? "output-status-dot working"
                    : "output-status-dot"
              } />

              <span>

                {result
                  ? "Complete"
                  : loading
                    ? "Running"
                    : "Ready"}

              </span>

            </div>

          </div>


          {/* =================================================
              EMPTY STATE
              ================================================= */}

          {!result && !loading && (

            <div className="agent-empty-state">

              <div className="empty-agent-icon">

                <ShieldCheck size={30} />

              </div>


              <span className="empty-state-label">
                AGENT READY
              </span>


              <strong>
                Ready for investigation
              </strong>


              <p>
                Submit an alert to retrieve customer
                evidence from TigerGraph and run the
                fraud investigation pipeline.
              </p>


              <div className="agent-readiness">

                <div>

                  <Database size={15} />

                  <span>
                    TigerGraph
                  </span>

                  <CheckCircle2 size={14} />

                </div>


                <div>

                  <BrainCircuit size={15} />

                  <span>
                    Gemini
                  </span>

                  <CheckCircle2 size={14} />

                </div>


                <div>

                  <Gauge size={15} />

                  <span>
                    Risk Engine
                  </span>

                  <CheckCircle2 size={14} />

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              LOADING
              ================================================= */}

          {loading && (

            <div className="agent-empty-state loading-state">

              <div className="investigation-loader">

                <span />
                <span />
                <span />

              </div>


              <span className="empty-state-label">
                INVESTIGATION RUNNING
              </span>


              <strong>
                Agent is investigating
              </strong>


              <p>
                Retrieving graph evidence, customer history
                and transaction signals before generating
                the investigation result.
              </p>


              <div className="loading-steps">

                <div className="loading-step active">

                  <Database size={15} />

                  <span>
                    Querying TigerGraph
                  </span>

                </div>


                <div className="loading-step active">

                  <Activity size={15} />

                  <span>
                    Detecting patterns
                  </span>

                </div>


                <div className="loading-step">

                  <BrainCircuit size={15} />

                  <span>
                    Running agent reasoning
                  </span>

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              RESULT
              ================================================= */}

          {result && (

            <div className="investigation-result">


              {/* =========================
                  RISK HERO
              ========================= */}

              <div className="result-risk-hero">

                <div>

                  <span className="result-risk-label">
                    FINAL RISK SCORE
                  </span>


                  <div className="result-risk-number">

                    {finalRisk !== undefined
                      ? finalRisk
                      : "—"}

                    <span>
                      /100
                    </span>

                  </div>


                  <div className={
                    `risk-badge ${riskClass(finalRisk)}`
                  }>

                    <span />

                    {riskLabel(finalRisk)} Risk

                  </div>

                </div>


                <div className="result-risk-side">

                  <div>

                    <span>
                      INITIAL
                    </span>

                    <strong>
                      {result.risk?.initial ?? "—"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      GRAPH
                    </span>

                    <strong>
                      {result.risk?.graph ?? "—"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      FINAL
                    </span>

                    <strong>
                      {result.risk?.final ?? "—"}
                    </strong>

                  </div>

                </div>

              </div>


              {/* =========================
                  CASE DETAILS
              ========================= */}

              <div className="result-metrics">

                <div className="result-metric">

                  <span>
                    CASE
                  </span>

                  <strong>
                    {createdCase?.case_id ??
                      form.case_id}
                  </strong>

                </div>


                <div className="result-metric">

                  <span>
                    CUSTOMER
                  </span>

                  <strong>
                    {createdCase?.customer_id ??
                      form.customer_id}
                  </strong>

                </div>


                <div className="result-metric">

                  <span>
                    TRANSACTION
                  </span>

                  <strong>
                    {createdCase?.transaction_id ??
                      form.transaction_id}
                  </strong>

                </div>

              </div>


              {/* =========================
                  PATTERNS
              ========================= */}

              {result.patterns &&
                result.patterns.length > 0 && (

                <div className="result-section">

                  <div className="result-section-heading">

                    <div>

                      <span className="result-section-label">
                        DETECTION
                      </span>

                      <h3>
                        Fraud patterns
                      </h3>

                    </div>


                    <span className="result-count">
                      {result.patterns.length} detected
                    </span>

                  </div>


                  <div className="result-patterns">

                    {result.patterns.map(
                      (pattern, index) => (

                        <div
                          key={`${pattern.name ?? "pattern"}-${index}`}
                          className="result-pattern"
                        >

                          <div className="pattern-marker" />

                          <div>

                            <strong>
                              {pattern.name ??
                                "Unknown pattern"}
                            </strong>

                            {pattern.description && (

                              <span>
                                {pattern.description}
                              </span>

                            )}

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}


              {/* =========================
                  AGENT ANALYSIS
              ========================= */}

              {(
                result.agent?.summary ||
                result.agent?.interpretation
              ) && (

                <div className="result-section">

                  <div className="result-section-heading">

                    <div>

                      <span className="result-section-label">
                        AI ANALYSIS
                      </span>

                      <h3>
                        Investigation explanation
                      </h3>

                    </div>

                    <div className="ai-badge">
                      <BrainCircuit size={13} />
                      Gemini
                    </div>

                  </div>


                  <div className="result-analysis-card">

                    <p>
                      {result.agent.summary ??
                        result.agent.interpretation}
                    </p>

                  </div>

                </div>

              )}


              {/* =========================
                  NEXT BEST ACTION
              ========================= */}

              {result.next_best_action && (

                <div className="result-section">

                  <div className="result-section-heading">

                    <div>

                      <span className="result-section-label">
                        DECISION SUPPORT
                      </span>

                      <h3>
                        Next best action
                      </h3>

                    </div>

                    <ClipboardCheck size={17} />

                  </div>


                  <div className="result-action-card">

                    <div className="action-icon">

                      <ShieldCheck size={19} />

                    </div>


                    <div className="action-content">

                      <strong>

                        {result.next_best_action.action ??
                          "Review transaction"}

                      </strong>


                      {result.next_best_action.reason && (

                        <p>

                          {result.next_best_action.reason}

                        </p>

                      )}


                      <div className="action-meta">

                        <span>

                          <UserRound size={13} />

                          {result.next_best_action.approval_route ??
                            "human_analyst"}

                        </span>


                        <span>

                          {result.next_best_action.approval_required
                            ? "Human approval required"
                            : "Automatic action permitted"}

                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              )}


              {/* =========================
                  COMPLETION
              ========================= */}

              <div className="result-complete">

                <CheckCircle2 size={15} />

                <span>
                  Investigation completed successfully
                </span>

              </div>

            </div>

          )}

        </section>

      </div>

    </div>
  );
}
