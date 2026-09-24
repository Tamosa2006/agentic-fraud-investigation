"use client";

import {
  Database,
  GitBranch,
  Network,
  ShieldAlert,
} from "lucide-react";

import GlassCard from "@/components/ui/GlassCard";

export default function GraphPage() {
  return (
    <div className="dashboard">

      <section className="page-heading">

        <div>

          <span className="eyebrow">
            TIGERGRAPH
          </span>

          <h1>
            Graph Intelligence
          </h1>

          <p>
            Explore relationships discovered across
            customers, devices, cards and transactions.
          </p>

        </div>

      </section>

      <div className="graph-page-grid">

        <GlassCard className="large-graph">

          <div className="card-header">

            <div>
              <span className="eyebrow">
                FRAUD NETWORK
              </span>

              <h3>
                Entity relationship map
              </h3>
            </div>

            <GitBranch size={19} />

          </div>

          <div className="network">

            <svg
              viewBox="0 0 800 420"
            >

              <line x1="400" y1="210" x2="180" y2="100" />
              <line x1="400" y1="210" x2="620" y2="100" />
              <line x1="400" y1="210" x2="180" y2="320" />
              <line x1="400" y1="210" x2="620" y2="320" />
              <line x1="180" y1="100" x2="620" y2="100" />

              <circle cx="400" cy="210" r="45" />
              <circle cx="180" cy="100" r="30" />
              <circle cx="620" cy="100" r="30" />
              <circle cx="180" cy="320" r="30" />
              <circle cx="620" cy="320" r="30" />

            </svg>

            <div className="network-node center">
              C12382
              <small>Customer</small>
            </div>

            <div className="network-node n1">
              D-192
              <small>Device</small>
            </div>

            <div className="network-node n2">
              C09121
              <small>Customer</small>
            </div>

            <div className="network-node n3">
              TXN-01
              <small>Transaction</small>
            </div>

            <div className="network-node n4">
              FC-018
              <small>Fraud Case</small>
            </div>

          </div>

        </GlassCard>

        <div className="graph-side">

          <GraphStat
            icon={<Database size={20} />}
            label="Graph entities"
            value="12,482"
          />

          <GraphStat
            icon={<Network size={20} />}
            label="Relationships"
            value="38,921"
          />

          <GraphStat
            icon={<ShieldAlert size={20} />}
            label="Fraud links"
            value="1,284"
          />

        </div>

      </div>

    </div>
  );
}

function GraphStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <GlassCard className="graph-stat">

      <div className="stat-icon">
        {icon}
      </div>

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </GlassCard>
  );
}