import Link from "next/link";
import {
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";

import GlassCard from "@/components/ui/GlassCard";

export default function HeroInvestigation() {
  return (
    <GlassCard className="hero-card">

      <div className="hero-content">

        <div className="hero-label">
          <ShieldAlert size={15} />
          ACTIVE INVESTIGATION
        </div>

        <h1>
          AI-powered fraud
          <br />
          investigation.
        </h1>

        <p>
          Investigate transaction behavior, discover
          hidden graph relationships and generate
          controlled next-best actions.
        </p>

        <Link
          href="/investigation"
          className="hero-button"
        >
          Start Investigation

          <ArrowUpRight size={17} />
        </Link>

      </div>

      <div className="hero-visual">

        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <div className="hero-orbit orbit-three" />

        <div className="hero-core">
          <ShieldAlert size={34} />
        </div>

        <span className="node node-a" />
        <span className="node node-b" />
        <span className="node node-c" />
        <span className="node node-d" />

      </div>

    </GlassCard>
  );
}