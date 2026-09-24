"use client";

import { useEffect, useState } from "react";

import HeroInvestigation from "@/components/overview/HeroInvestigation";
import RiskCard from "@/components/overview/RiskCard";
import CaseQueuePreview from "@/components/overview/CaseQueuePreview";
import GraphPreview from "@/components/overview/GraphPreview";
import EvidencePreview from "@/components/overview/EvidencePreview";
import ActionPreview from "@/components/overview/ActionPreview";
import CaseInvestigationModal from "@/components/overview/CaseInvestigationModal";

import { fetchCases } from "@/lib/api";
import { FraudCase } from "@/types/fraud";


export default function OverviewPage() {
  const [cases, setCases] = useState<FraudCase[]>([]);
  const [selectedCase, setSelectedCase] =
    useState<FraudCase | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {
    let mounted = true;

    async function loadCases() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchCases();

        if (mounted) {
          setCases(data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load cases."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCases();

    return () => {
      mounted = false;
    };
  }, []);


  function handleMaximize(
    fraudCase: FraudCase
  ) {
    setSelectedCase(fraudCase);
  }


  function handleClose() {
    setSelectedCase(null);
  }

  const firstCase = cases[0];
  const graphEvidence =
    firstCase && "graph_evidence" in firstCase
      ? ((firstCase as any).graph_evidence ?? [])
      : [];

  return (
    <div className="dashboard">

      {/* ------------------------------------------------ */}
      {/* Page Heading */}
      {/* ------------------------------------------------ */}

      <section className="page-heading">

        <div>
          <span className="eyebrow">
            FRAUD OPERATIONS
          </span>

          <h1>
            Investigation overview
          </h1>

          <p>
            Monitor fraud signals, graph intelligence
            and agent decisions from one workspace.
          </p>
        </div>

      </section>


      {/* ------------------------------------------------ */}
      {/* Overview Grid */}
      {/* ------------------------------------------------ */}

      <div className="overview-grid">

        <HeroInvestigation />

        <RiskCard />

        <CaseQueuePreview
          cases={cases}
          onMaximize={handleMaximize}
        />

        <GraphPreview
          customerId={firstCase?.customer_id ?? ""}
          graphEvidence={graphEvidence}
        />

        <EvidencePreview />

        <ActionPreview />

      </div>


      {/* ------------------------------------------------ */}
      {/* Loading / Error Status */}
      {/* ------------------------------------------------ */}

      {loading && (
        <div className="overview-status">
          Loading investigation cases...
        </div>
      )}

      {error && (
        <div className="overview-status error">
          {error}
        </div>
      )}


      {/* ------------------------------------------------ */}
      {/* Maximized Investigation */}
      {/* ------------------------------------------------ */}

      {selectedCase && (
        <CaseInvestigationModal
          fraudCase={selectedCase}
          onClose={handleClose}
        />
      )}

    </div>
  );
}
