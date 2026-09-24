"use client";

import { useState } from "react";

import { FraudCase } from "@/types/fraud";
import CaseCard from "./CaseCard";

type Props = {
  cases: FraudCase[];
  onMaximize: (fraudCase: FraudCase) => void;
};

export default function CaseGrid({
  cases,
  onMaximize,
}: Props) {
  const [selectedCaseId, setSelectedCaseId] =
    useState<string | null>(null);

  function handleMaximize(fraudCase: FraudCase) {
    setSelectedCaseId(fraudCase.case_id);

    setTimeout(() => {
      onMaximize(fraudCase);
    }, 450);
  }

  if (cases.length === 0) {
    return (
      <section className="case-grid-section case-grid-enter">
        <div className="case-grid-header">
          <div>
            <span className="section-label">
              INVESTIGATIONS
            </span>

            <h2>Case Queue</h2>

            <p>
              No fraud investigations are currently
              available.
            </p>
          </div>
        </div>

        <div className="case-grid-empty">
          <div className="case-grid-empty-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="2"
              />

              <path d="M7 9h10" />
              <path d="M7 13h6" />
              <path d="M7 17h4" />
            </svg>
          </div>

          <h3>No cases found</h3>

          <p>
            New investigations will appear here when
            they are submitted.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="case-grid-section case-grid-enter">

      <div className="case-grid-header">

        <div>
          <span className="section-label">
            INVESTIGATIONS
          </span>

          <h2>Case Queue</h2>

          <p>
            Review benchmark cases and newly submitted
            fraud alerts.
          </p>
        </div>

        <div className="case-grid-count">
          <strong>{cases.length}</strong>
          <span>Cases</span>
        </div>

      </div>


      <div className="case-grid">

        {cases.map((fraudCase, index) => {

          const selected =
            selectedCaseId === fraudCase.case_id;

          return (
            <div
              key={fraudCase.case_id}
              className={
                selected
                  ? "case-card-wrapper case-card-selected"
                  : "case-card-wrapper"
              }
              style={{
                "--case-index": index,
              } as React.CSSProperties}
            >
              <CaseCard
                fraudCase={fraudCase}
                onMaximize={handleMaximize}
              />
            </div>
          );
        })}

      </div>

    </section>
  );
}