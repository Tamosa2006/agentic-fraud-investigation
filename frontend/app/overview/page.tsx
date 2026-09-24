"use client";

import {
  useEffect,
  useState,
} from "react";

import HeroInvestigation from "@/components/overview/HeroInvestigation";
import RiskCard from "@/components/overview/RiskCard";
import CaseQueuePreview from "@/components/overview/CaseQueuePreview";
import GraphPreview from "@/components/overview/GraphPreview";
import EvidencePreview from "@/components/overview/EvidencePreview";
import ActionPreview from "@/components/overview/ActionPreview";

import CaseInvestigationModal from "@/components/overview/CaseInvestigationModal";

import {
  fetchCases,
} from "@/lib/api";

import {
  FraudCase,
} from "@/types/fraud";


export default function OverviewPage() {

  const [
    cases,
    setCases,
  ] = useState<FraudCase[]>([]);


  const [
    selectedCase,
    setSelectedCase,
  ] = useState<FraudCase | null>(
    null
  );


  useEffect(() => {

    fetchCases()

      .then((data) => {

        setCases(data);

      })

      .catch((error) => {

        console.error(
          "Failed to load cases:",
          error
        );

      });

  }, []);


  return (

    <div className="dashboard">


      {/* PAGE HEADER */}

      <section className="page-heading">

        <div>

          <span className="eyebrow">
            FRAUD OPERATIONS
          </span>


          <h1>
            Investigation overview
          </h1>


          <p>
            Monitor fraud signals,
            graph intelligence and
            agent decisions from
            one workspace.
          </p>

        </div>

      </section>


      {/* DASHBOARD */}

      <div className="overview-grid">

        <HeroInvestigation />


        <RiskCard />


        <CaseQueuePreview
          cases={cases}
          onMaximize={(fraudCase) => {

            setSelectedCase(
              fraudCase
            );

          }}
        />


        <GraphPreview />


        <EvidencePreview />


        <ActionPreview />

      </div>


      {/* CASE INVESTIGATION */}

      {selectedCase && (
        <CaseInvestigationModal
          fraudCase={selectedCase}
          onClose={() => {
            setSelectedCase(null);
          }}
        />
      )}

    </div>

  );
}