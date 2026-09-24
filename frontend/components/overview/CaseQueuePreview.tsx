"use client";

import { FraudCase } from "@/types/fraud";

type Props = {
  cases: FraudCase[];
  onMaximize: (fraudCase: FraudCase) => void;
};

export default function CaseQueuePreview({
  cases,
  onMaximize,
}: Props) {
  return (
    <section className="panel case-queue-panel">
      {/* =========================
          HEADER
      ========================== */}

      <div className="panel-header">
        <div>
          <span className="section-label">
            OPERATIONS
          </span>

          <h2>
            Case Queue
          </h2>

          <p>
            Benchmark investigations and newly
            submitted fraud alerts.
          </p>
        </div>

        <div className="case-count">
          {cases.length} cases
        </div>
      </div>


      {/* =========================
          TABLE
      ========================== */}

      <div className="case-table-wrapper">

        <table className="case-table">

          <thead>
            <tr>
              <th>CASE</th>
              <th>CUSTOMER</th>
              <th>TYPE</th>
              <th>SOURCE</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>


          <tbody>

            {cases.map((fraudCase) => {

              const isLive =
                fraudCase.source === "Live";

              return (
                <tr
                  key={fraudCase.case_id}
                >

                  {/* CASE */}

                  <td>
                    <div className="case-id-cell">

                      <span className="case-id">
                        {fraudCase.case_id}
                      </span>

                      {isLive && (
                        <span className="case-live-indicator">
                          LIVE
                        </span>
                      )}

                    </div>
                  </td>


                  {/* CUSTOMER */}

                  <td>
                    {fraudCase.customer_id ||
                      "—"}
                  </td>


                  {/* TYPE */}

                  <td>

                    <span className="type-badge">
                      {fraudCase.alert_type ||
                        "risk_score"}
                    </span>

                  </td>


                  {/* SOURCE */}

                  <td>
                    {fraudCase.source ||
                      "Benchmark"}
                  </td>


                  {/* STATUS */}

                  <td>

                    <span
                      className={
                        isLive
                          ? "status-badge live"
                          : "status-badge"
                      }
                    >
                      {fraudCase.status ||
                        "Ready"}
                    </span>

                  </td>


                  {/* ACTION */}

                  <td>

                    <button
                      type="button"
                      className="case-max-button"
                      onClick={() =>
                        onMaximize(
                          fraudCase
                        )
                      }
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

                      <span>
                        Max
                      </span>

                    </button>

                  </td>

                </tr>
              );
            })}


            {/* EMPTY STATE */}

            {cases.length === 0 && (
              <tr>

                <td
                  colSpan={6}
                  className="table-empty"
                >

                  No investigations available.

                </td>

              </tr>
            )}

          </tbody>

        </table>

      </div>

    </section>
  );
}