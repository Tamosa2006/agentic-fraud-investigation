import {
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

import GlassCard from "@/components/ui/GlassCard";

type Props = {
  risk?: number;
  verdict?: string;
};

export default function RiskCard({
  risk = 92,
  verdict = "fraud",
}: Props) {
  const circumference = 2 * Math.PI * 58;

  const offset =
    circumference -
    (risk / 100) * circumference;

  return (
    <GlassCard className="risk-card">

      <div className="card-header">

        <div>
          <span className="eyebrow">
            INVESTIGATION RISK
          </span>

          <h3>
            Current assessment
          </h3>
        </div>

        <ArrowUpRight size={17} />

      </div>

      <div className="risk-ring">

        <svg
          width="150"
          height="150"
          viewBox="0 0 150 150"
        >

          <circle
            cx="75"
            cy="75"
            r="58"
            className="risk-track"
          />

          <circle
            cx="75"
            cy="75"
            r="58"
            className="risk-progress"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />

        </svg>

        <div className="risk-value">
          <strong>
            {risk}%
          </strong>

          <span>
            {verdict}
          </span>
        </div>

      </div>

      <div className="risk-footer">

        <AlertTriangle size={15} />

        <span>
          AI confidence assessment
        </span>

      </div>

    </GlassCard>
  );
}