from pathlib import Path
import json

import pandas as pd

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.agent import investigate, normalize_case


app = FastAPI(
    title="Fraud Investigation Agent API"
)


# -------------------------------------------------------------------
# CORS
# -------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------------
# Paths
# -------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

CASE_FILE = (
    BASE_DIR /
    "data" /
    "case_pack.csv"
)

LIVE_CASE_FILE = (
    BASE_DIR /
    "data" /
    "live_cases.json"
)


# -------------------------------------------------------------------
# Request models
# -------------------------------------------------------------------

class CaseRequest(BaseModel):

    case_id: str

    customer_id: str

    transaction_id: str

    card_id: str = ""

    trigger_type: str

    trigger_text: str

    # Optional for compatibility with existing benchmark cases.
    # New investigations do not need to provide this.
    risk_score: float | None = None


class InvestigateRequest(BaseModel):

    case_id: str


# -------------------------------------------------------------------
# Live case storage
# -------------------------------------------------------------------

def load_live_cases():

    if not LIVE_CASE_FILE.exists():

        return []

    try:

        with open(
            LIVE_CASE_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)

            if isinstance(
                data,
                list
            ):

                return data

    except Exception:

        pass

    return []


def save_live_cases(
    cases
):

    LIVE_CASE_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(
        LIVE_CASE_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            cases,
            file,
            indent=2
        )


# -------------------------------------------------------------------
# Benchmark cases
# -------------------------------------------------------------------

def get_benchmark_cases():

    df = pd.read_csv(
        CASE_FILE
    )

    cases = []

    for _, row in df.iterrows():

        risk_score = None

        if "risk_score" in df.columns:

            value = row["risk_score"]

            if pd.notna(value):

                risk_score = float(
                    value
                )

        cases.append({

            "case_id":
                str(
                    row["case_id"]
                ),

            "customer_id":
                str(
                    row["customer_id"]
                ),

            "transaction_id":
                str(
                    row["flagged_txn_id"]
                ),

            "card_id":
                (
                    str(
                        row["card_id"]
                    )
                    if "card_id" in df.columns
                    else ""
                ),

            "trigger_type":
                str(
                    row["trigger_type"]
                ),

            "trigger_text":
                str(
                    row["trigger_text"]
                ),

            "risk_score":
                risk_score,

            "source":
                "benchmark",

            "status":
                "Ready",

        })

    return cases


# -------------------------------------------------------------------
# All cases
# -------------------------------------------------------------------

def get_all_cases():

    benchmark = (
        get_benchmark_cases()
    )

    live = (
        load_live_cases()
    )

    return benchmark + live


def find_case(
    case_id: str
):

    all_cases = (
        get_all_cases()
    )

    for case in all_cases:

        if case["case_id"] == case_id:

            return case

    return None


# -------------------------------------------------------------------
# Case normalization
# -------------------------------------------------------------------

def build_case_text(
    case_data
):

    return normalize_case(

        case_id=case_data[
            "case_id"
        ],

        trigger_type=case_data[
            "trigger_type"
        ],

        trigger_text=case_data[
            "trigger_text"
        ],

        flagged_txn_id=case_data[
            "transaction_id"
        ],

        customer_id=case_data[
            "customer_id"
        ],

        card_id=case_data.get(
            "card_id",
            ""
        ),

        # Important:
        # Existing benchmark cases may have a model score.
        # New live cases can leave this as None.
        risk_score=case_data.get(
            "risk_score"
        ),

    )


# -------------------------------------------------------------------
# Empty investigation structure
# -------------------------------------------------------------------

def empty_investigation():

    return {

        "graph_evidence": [],

        "patterns": [],

        "risk": {

            "initial": None,

            "graph": None,

            "final": None,

        },

        "agent": {

            "summary": "",

            "interpretation": "",

            "decision": "",

        },

        "next_best_action": {

            "action": "",

            "reason": "",

            "approval_route": "",

            "approval_required": False,

        },

        "customer_profile": {

            "cards": [],

            "transactions": [],

            "devices": [],

            "past_cases": [],

        },

    }


# -------------------------------------------------------------------
# Root
# -------------------------------------------------------------------

@app.get("/")
def root():

    return {

        "message":
            "Fraud Investigation Agent API is running"

    }


# -------------------------------------------------------------------
# GET /cases
# -------------------------------------------------------------------

@app.get("/cases")
def get_cases():

    return {

        "cases":
            get_all_cases()

    }


# -------------------------------------------------------------------
# GET /cases/{case_id}
# -------------------------------------------------------------------

@app.get(
    "/cases/{case_id}"
)
def get_case(
    case_id: str
):

    case = find_case(
        case_id
    )

    if not case:

        return {

            "error":
                f"Case not found: {case_id}"

        }

    return case


# -------------------------------------------------------------------
# POST /cases
# -------------------------------------------------------------------

@app.post("/cases")
def create_case(
    request: CaseRequest
):

    cases = (
        load_live_cases()
    )

    existing = [

        case

        for case in cases

        if case["case_id"]
        == request.case_id

    ]

    if existing:

        return {

            "error":
                f"Case already exists: "
                f"{request.case_id}"

        }


    case = {

        "case_id":
            request.case_id,

        "customer_id":
            request.customer_id,

        "transaction_id":
            request.transaction_id,

        "card_id":
            request.card_id,

        "trigger_type":
            request.trigger_type,

        "trigger_text":
            request.trigger_text,

        "risk_score":
            request.risk_score,

        "source":
            "live",

        "status":
            "Ready",

    }


    cases.append(
        case
    )

    save_live_cases(
        cases
    )


    # ---------------------------------------------------------------
    # IMPORTANT
    #
    # Return the FraudCase directly.
    #
    # The frontend's createCase() is typed as Promise<FraudCase>.
    # ---------------------------------------------------------------

    return case


# -------------------------------------------------------------------
# POST /investigate
# -------------------------------------------------------------------

@app.post(
    "/investigate"
)
def investigate_case(
    request: InvestigateRequest
):

    case_data = find_case(
        request.case_id
    )

    if not case_data:

        return {

            "error":
                f"Case not found: "
                f"{request.case_id}"

        }


    case_text = build_case_text(
        case_data
    )

    result = investigate(
        case_text
    )


    return {

        "case_id":
            request.case_id,

        "case_text":
            case_text,

        "result":
            result,

    }


# -------------------------------------------------------------------
# POST /cases/{case_id}/investigate
# -------------------------------------------------------------------

@app.post(
    "/cases/{case_id}/investigate"
)
def investigate_case_from_case(
    case_id: str
):

    case_data = find_case(
        case_id
    )

    if not case_data:

        return {

            "error":
                f"Case not found: {case_id}"

        }


    case_text = build_case_text(
        case_data
    )

    result = investigate(
        case_text
    )


    # ---------------------------------------------------------------
    # Return the investigation itself.
    #
    # This matches the frontend's:
    #
    # investigateCase() -> CaseInvestigation
    #
    # rather than forcing the frontend to unwrap:
    #
    # response.result
    # ---------------------------------------------------------------

    if isinstance(
        result,
        dict
    ):

        return result


    return empty_investigation()


# -------------------------------------------------------------------
# GET /cases/{case_id}/investigation
# -------------------------------------------------------------------

@app.get(
    "/cases/{case_id}/investigation"
)
def get_case_investigation(
    case_id: str
):

    case_data = find_case(
        case_id
    )

    if not case_data:

        return {

            "error":
                f"Case not found: {case_id}"

        }


    case_text = build_case_text(
        case_data
    )


    result = investigate(
        case_text
    )


    investigation = (
        empty_investigation()
    )


    # ---------------------------------------------------------------
    # Initial risk
    # ---------------------------------------------------------------

    investigation[
        "risk"
    ][
        "initial"
    ] = case_data.get(
        "risk_score"
    )


    # ---------------------------------------------------------------
    # Copy investigation result
    # ---------------------------------------------------------------

    if isinstance(
        result,
        dict
    ):

        # -----------------------------------------------------------
        # Graph evidence
        # -----------------------------------------------------------

        investigation[
            "graph_evidence"
        ] = result.get(
            "graph_evidence",
            result.get(
                "graph",
                []
            )
        )


        # -----------------------------------------------------------
        # Fraud patterns
        # -----------------------------------------------------------

        investigation[
            "patterns"
        ] = result.get(
            "patterns",
            result.get(
                "fraud_patterns",
                []
            )
        )


        # -----------------------------------------------------------
        # Risk
        # -----------------------------------------------------------

        risk = result.get(
            "risk",
            {}
        )


        if isinstance(
            risk,
            dict
        ):

            investigation[
                "risk"
            ][
                "initial"
            ] = risk.get(
                "initial",
                case_data.get(
                    "risk_score"
                )
            )

            investigation[
                "risk"
            ][
                "graph"
            ] = risk.get(
                "graph"
            )

            investigation[
                "risk"
            ][
                "final"
            ] = risk.get(
                "final"
            )


        # -----------------------------------------------------------
        # Agent
        # -----------------------------------------------------------

        agent = result.get(
            "agent",
            {}
        )


        if isinstance(
            agent,
            dict
        ):

            investigation[
                "agent"
            ] = {

                "summary":
                    agent.get(
                        "summary",
                        ""
                    ),

                "interpretation":
                    agent.get(
                        "interpretation",
                        ""
                    ),

                "decision":
                    agent.get(
                        "decision",
                        ""
                    ),

            }


        # -----------------------------------------------------------
        # Next best action
        # -----------------------------------------------------------

        nba = result.get(
            "next_best_action",
            result.get(
                "nba",
                {}
            )
        )


        if isinstance(
            nba,
            dict
        ):

            investigation[
                "next_best_action"
            ] = {

                "action":
                    nba.get(
                        "action",
                        ""
                    ),

                "reason":
                    nba.get(
                        "reason",
                        ""
                    ),

                "approval_route":
                    nba.get(
                        "approval_route",
                        ""
                    ),

                "approval_required":
                    nba.get(
                        "approval_required",
                        False
                    ),

            }


        # -----------------------------------------------------------
        # Customer profile
        # -----------------------------------------------------------

        customer_profile = result.get(
            "customer_profile",
            {}
        )


        if isinstance(
            customer_profile,
            dict
        ):

            investigation[
                "customer_profile"
            ] = {

                "cards":
                    customer_profile.get(
                        "cards",
                        []
                    ),

                "transactions":
                    customer_profile.get(
                        "transactions",
                        []
                    ),

                "devices":
                    customer_profile.get(
                        "devices",
                        []
                    ),

                "past_cases":
                    customer_profile.get(
                        "past_cases",
                        []
                    ),

            }


    return investigation