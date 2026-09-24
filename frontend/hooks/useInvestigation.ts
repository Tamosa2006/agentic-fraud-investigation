"use client";

import { useState } from "react";

import { investigateCase } from "@/lib/api";

type InvestigationResult = {
  [key: string]: unknown;
};

type InvestigationApiResponse = {
  result: InvestigationResult;
};

export function useInvestigation() {

  const [result, setResult] =
    useState<InvestigationResult | null>(null);

  const [selectedCase, setSelectedCase] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  async function investigate(caseId: string) {

    setLoading(true);
    setError("");
    setSelectedCase(caseId);
    setResult(null);

    try {

      const response =
        (await investigateCase(caseId)) as InvestigationApiResponse;

      setResult(response.result);

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Investigation failed"
      );

    } finally {

      setLoading(false);

    }

  }


  return {
    result,
    selectedCase,
    loading,
    error,
    investigate,
  };
}