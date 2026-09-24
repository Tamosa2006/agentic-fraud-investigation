import {
  FraudCase,
  CaseInvestigation,
} from "@/types/fraud";


const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";


async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },

      cache: "no-store",
    }
  );


  if (!response.ok) {

    const errorText =
      await response.text();

    throw new Error(
      errorText ||
      `Request failed with status ${response.status}`
    );
  }


  return response.json();
}


/* =========================
   CASES
========================= */

export async function fetchCases(): Promise<FraudCase[]> {

  const data =
    await apiRequest<unknown>("/cases");


  /*
   * Backend may return:
   *
   * 1. [...]
   *
   * or
   *
   * 2. { cases: [...] }
   */

  if (Array.isArray(data)) {
    return data as FraudCase[];
  }


  if (
    data &&
    typeof data === "object" &&
    "cases" in data &&
    Array.isArray(
      (data as { cases: unknown }).cases
    )
  ) {

    return (
      (data as {
        cases: FraudCase[];
      }).cases
    );
  }


  console.error(
    "Unexpected /cases response:",
    data
  );


  return [];
}


/* =========================
   SINGLE CASE
========================= */

export async function fetchCase(
  caseId: string
): Promise<FraudCase> {

  return apiRequest<FraudCase>(
    `/cases/${encodeURIComponent(caseId)}`
  );
}


/* =========================
   CREATE CASE
========================= */

export type CreateCaseRequest = {

  case_id: string;

  customer_id: string;

  transaction_id: string;

  card_id?: string;

  trigger_type: string;

  trigger_text: string;
};


export async function createCase(
  data: CreateCaseRequest
): Promise<FraudCase> {

  return apiRequest<FraudCase>(
    "/cases",
    {
      method: "POST",

      body: JSON.stringify(data),
    }
  );
}


/* =========================
   INVESTIGATE CASE
========================= */

export async function investigateCase(
  caseId: string
): Promise<CaseInvestigation> {

  return apiRequest<CaseInvestigation>(
    `/cases/${encodeURIComponent(
      caseId
    )}/investigate`,
    {
      method: "POST",
    }
  );
}


/* =========================
   CASE INVESTIGATION
========================= */

export async function fetchCaseInvestigation(
  caseId: string
): Promise<CaseInvestigation> {

  return apiRequest<CaseInvestigation>(
    `/cases/${encodeURIComponent(
      caseId
    )}/investigation`
  );
}


/* =========================
   CREATE INVESTIGATION
========================= */

export async function createInvestigation(
  data: Record<string, unknown>
): Promise<CaseInvestigation> {

  return apiRequest<CaseInvestigation>(
    "/investigations",
    {
      method: "POST",

      body: JSON.stringify(data),
    }
  );
}