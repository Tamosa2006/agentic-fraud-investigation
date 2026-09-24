import {
  Database,
  GitBranch,
  Network,
  ArrowRight,
} from "lucide-react";

import GlassCard from "@/components/ui/GlassCard";

type GraphEvidence = {
  source?: string;
  source_type?: string;
  relationship?: string;
  target?: string;
  target_type?: string;
  outcome?: string;
  pattern?: string;
};

type GraphPreviewProps = {
  customerId?: string;
  graphEvidence?: GraphEvidence[];
};

export default function GraphPreview({
  customerId = "C12382",
  graphEvidence = [],
}: GraphPreviewProps) {
  const findings = graphEvidence.filter(
    (item) => item.source || item.target
  );

  const visibleFindings = findings.slice(0, 8);

  const customerCount = new Set(
    findings
      .filter((item) => item.source_type === "Customer")
      .map((item) => item.source)
  ).size;

  return (
    <GlassCard className="graph-card">

      <div className="card-header">

        <div>
          <span className="eyebrow">
            TIGERGRAPH
          </span>

          <h3>
            Graph intelligence
          </h3>
        </div>

        <Network size={18} />

      </div>

      <div className="graph-preview">

        <svg
          viewBox="0 0 400 210"
          className="graph-svg"
        >

          <line x1="200" y1="105" x2="95" y2="45" />
          <line x1="200" y1="105" x2="305" y2="45" />
          <line x1="200" y1="105" x2="95" y2="170" />
          <line x1="200" y1="105" x2="305" y2="170" />

          <circle cx="200" cy="105" r="28" />
          <circle cx="95" cy="45" r="17" />
          <circle cx="305" cy="45" r="17" />
          <circle cx="95" cy="170" r="17" />
          <circle cx="305" cy="170" r="17" />

        </svg>

        <div className="graph-center">
          <GitBranch size={20} />
          <span>{customerId}</span>
        </div>

      </div>

      <div className="graph-stats">

        <div>
          <Database size={15} />
          <span>Customers</span>
          <strong>
            {customerCount || "—"}
          </strong>
        </div>

        <div>
          <Network size={15} />
          <span>Relationships</span>
          <strong>
            {findings.length || "—"}
          </strong>
        </div>

      </div>

      <div className="graph-findings">

        <div className="findings-header">
          <div>
            <span className="eyebrow">
              CONNECTED ENTITIES
            </span>

            <h4>
              Graph evidence
            </h4>
          </div>

          <span className="finding-count">
            {findings.length} findings
          </span>
        </div>

        {visibleFindings.length === 0 ? (

          <div className="empty-state">
            No graph relationships returned.
          </div>

        ) : (

          <div className="finding-list">

            {visibleFindings.map((item, index) => (

              <div
                className="finding-row"
                key={`${item.source}-${item.relationship}-${item.target}-${index}`}
              >

                <div className="finding-entity">

                  <span className="entity-type">
                    {item.source_type || "Entity"}
                  </span>

                  <strong>
                    {item.source || "—"}
                  </strong>

                </div>

                <div className="finding-relationship">

                  <span>
                    {item.relationship || "—"}
                  </span>

                  <ArrowRight size={14} />

                </div>

                <div className="finding-entity">

                  <span className="entity-type">
                    {item.target_type || "Entity"}
                  </span>

                  <strong>
                    {item.target || "—"}
                  </strong>

                </div>

                <div className="finding-evidence">

                  {item.outcome && (
                    <span>
                      {item.outcome}
                    </span>
                  )}

                  {item.pattern && (
                    <span>
                      {item.pattern}
                    </span>
                  )}

                  {!item.outcome && !item.pattern && (
                    <span>
                      {item.source_type || "Entity"}
                      {" → "}
                      {item.target_type || "Entity"}
                    </span>
                  )}

                </div>

              </div>

            ))}

          </div>

        )}

        {findings.length > 8 && (
          <div className="findings-footer">
            Showing 8 of {findings.length} graph findings
          </div>
        )}

      </div>

    </GlassCard>
  );
}