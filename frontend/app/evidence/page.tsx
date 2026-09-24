import {
  CheckCircle2,
  FileSearch,
  Database,
} from "lucide-react";

import GlassCard from "@/components/ui/GlassCard";

const evidence = [
  [
    "TigerGraph",
    "Shared device detected between customers",
    "HIGH",
  ],
  [
    "Transactions",
    "Multiple transactions within short window",
    "HIGH",
  ],
  [
    "Case history",
    "Related customer previously investigated",
    "MEDIUM",
  ],
  [
    "Velocity analysis",
    "Small-amount transaction burst detected",
    "HIGH",
  ],
];

export default function EvidencePage() {
  return (
    <div className="dashboard">

      <section className="page-heading">

        <div>

          <span className="eyebrow">
            INVESTIGATION DATA
          </span>

          <h1>
            Evidence
          </h1>

          <p>
            Evidence returned by graph queries,
            transaction analysis and case history.
          </p>

        </div>

      </section>

      <GlassCard className="table-card">

        <div className="card-header">

          <div>

            <span className="eyebrow">
              EVIDENCE LEDGER
            </span>

            <h3>
              Investigation findings
            </h3>

          </div>

          <FileSearch size={19} />

        </div>

        <div className="evidence-table">

          {evidence.map(
            ([source, finding, relevance]) => (

              <div
                className="evidence-table-row"
                key={source}
              >

                <div className="evidence-source">

                  <Database size={17} />

                  <strong>
                    {source}
                  </strong>

                </div>

                <span>
                  {finding}
                </span>

                <div className="relevance">
                  <CheckCircle2 size={15} />
                  {relevance}
                </div>

              </div>

            )
          )}

        </div>

      </GlassCard>

    </div>
  );
}