import {
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import GlassCard from "@/components/ui/GlassCard";

export default function ActionPreview() {
  return (
    <GlassCard className="action-card">

      <div className="action-icon">
        <ShieldCheck size={22} />
      </div>

      <span className="eyebrow">
        NEXT BEST ACTION
      </span>

      <h2>
        Block card
      </h2>

      <p>
        High-confidence fraud assessment.
        Human approval is required before
        execution.
      </p>

      <div className="approval-line">
        <span>
          Approval route
        </span>

        <strong>
          Human analyst
        </strong>
      </div>

      <button className="action-button">
        Review action
        <ArrowRight size={16} />
      </button>

    </GlassCard>
  );
}