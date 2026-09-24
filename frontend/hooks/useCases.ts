"use client";

import { useEffect, useState } from "react";

import { fetchCases } from "@/lib/api";
import { FraudCase } from "@/types/fraud";


export function useCases() {

  const [cases, setCases] = useState<FraudCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    async function loadCases() {

      try {

        const data = await fetchCases();

        setCases(data);

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load cases"
        );

      } finally {

        setLoading(false);

      }

    }

    loadCases();

  }, []);


  return {
    cases,
    loading,
    error,
  };
}