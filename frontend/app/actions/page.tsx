import {
  CheckCircle2,
  Lock,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import GlassCard from "@/components/ui/GlassCard";

export default function ActionsPage() {
  return (
    <div className="dashboard">

      <section className="page-heading">

        <div>

          <span className="eyebrow">
            POLICY CONTROL
          </span>

          <h1>
            Actions & Policy
          </h1>

          <p>
            Controlled next-best-actions with
            explicit human approval boundaries.
          </p>

        </div>

      </section>

      <div className="actions-grid">

        <GlassCard className="nba-card">

          <div className="action-icon large">
            <ShieldCheck size={28} />
          </div>

          <span className="eyebrow">
            NEXT BEST ACTION
          </span>

          <h2>
            Block card
          </h2>

          <p>
            The current fraud assessment crosses
            the policy threshold for card blocking.
          </p>

          <div className="policy-status">
            <CheckCircle2 size={16} />
            Action allowed by policy
          </div>

        </GlassCard>

        <GlassCard className="approval-card">

          <div className="action-icon">
            <UserCheck size={22} />
          </div>

          <span className="eyebrow">
            APPROVAL
          </span>

          <h2>
            Human analyst
          </h2>

          <p>
            Card blocking requires explicit human
            approval before simulated execution.
          </p>

          <div className="approval-lock">
            <Lock size={15} />
            Approval required
          </div>

          <button className="approve-button">
            Review approval
          </button>

        </GlassCard>

      </div>

    </div>
  );
}