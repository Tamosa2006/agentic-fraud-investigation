"use client";

import { useEffect, useState } from "react";

import CaseGrid from "@/components/cases/CaseGrid";
import CaseInvestigationModal from "@/components/overview/CaseInvestigationModal";

import { fetchCases } from "@/lib/api";
import { FraudCase } from "@/types/fraud";


export default function CasesPage() {
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


  return (
    <main className="cases-page">

      {/* ------------------------------------------------ */}
      {/* Page Header */}
      {/* ------------------------------------------------ */}

      <section className="cases-page-header">

        <div>
          <span className="section-label">
            FRAUD OPERATIONS
          </span>

          <h1>Case Investigations</h1>

          <p>
            Review fraud alerts, investigate graph
            relationships, and inspect agent decisions.
          </p>
        </div>

        <div className="cases-page-status">

          <span
            className={
              loading
                ? "connection-dot loading"
                : error
                  ? "connection-dot error"
                  : "connection-dot"
            }
          />

          <span>
            {loading
              ? "Loading cases"
              : error
                ? "Backend unavailable"
                : "Investigation system online"}
          </span>

        </div>

      </section>


      {/* ------------------------------------------------ */}
      {/* Error */}
      {/* ------------------------------------------------ */}

      {error && (
        <section className="cases-page-error">

          <div className="cases-page-error-icon">

            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />

              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>

          </div>

          <div>
            <strong>
              Unable to load cases
            </strong>

            <p>
              {error}
            </p>
          </div>

        </section>
      )}


      {/* ------------------------------------------------ */}
      {/* Loading */}
      {/* ------------------------------------------------ */}

      {loading && !error ? (

        <section className="cases-loading">

          <div className="cases-loading-spinner" />

          <p>
            Loading investigation cases...
          </p>

        </section>

      ) : (

        <CaseGrid
          cases={cases}
          onMaximize={handleMaximize}
        />

      )}


      {/* ------------------------------------------------ */}
      {/* Investigation Modal */}
      {/* ------------------------------------------------ */}

      {selectedCase && (

        <CaseInvestigationModal
          fraudCase={selectedCase}
          onClose={handleClose}
        />

      )}

    </main>
  );
}
