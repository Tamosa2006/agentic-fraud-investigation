import {
  CheckCircle2,
  FileSearch,
} from "lucide-react";

import GlassCard from "@/components/ui/GlassCard";

const evidence = [
  {
    source: "TigerGraph",
    finding: "Shared device detected",
    level: "HIGH",
  },
  {
    source: "Transactions",
    finding: "Unusual transaction burst",
    level: "HIGH",
  },
  {
    source: "Case history",
    finding: "Previous fraud relationship",
    level: "MEDIUM",
  },
];

export default function EvidencePreview() {
  return (
    <GlassCard className="evidence-card">

      <div className="card-header">

        <div>
          <span className="eyebrow">
            EVIDENCE
          </span>

          <h3>
            Investigation signals
          </h3>
        </div>

        <FileSearch size={18} />

      </div>

      <div className="evidence-list">

        {evidence.map((item) => (

          <div
            key={item.source}
            className="evidence-row"
          >

            <CheckCircle2 size={17} />

            <div>

              <strong>
                {item.source}
              </strong>

              <span>
                {item.finding}
              </span>

            </div>

            <small>
              {item.level}
            </small>

          </div>

        ))}

      </div>

    </GlassCard>
  );
}