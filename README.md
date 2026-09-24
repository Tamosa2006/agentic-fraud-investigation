# Agentic Fraud Investigation System

An AI-powered agentic fraud investigation system that combines **AI agents, graph-based analysis, transaction intelligence, and evidence-driven investigation workflows** to help investigators analyze suspicious financial activity and determine appropriate next actions.

The system uses **TigerGraph** to represent relationships between accounts, transactions, devices, merchants, and other entities, allowing investigators to identify connected fraud patterns that may not be obvious from individual transactions.





https://github.com/user-attachments/assets/ae849407-5d73-4fb8-b306-e234528812cb





---

## Overview

Traditional fraud detection often focuses on individual transactions or isolated alerts. This project approaches fraud investigation as a **connected graph problem**.

The system:

* Receives and organizes suspicious cases
* Investigates transaction relationships
* Uses graph-based analysis through TigerGraph
* Identifies connected entities and suspicious patterns
* Generates investigation evidence
* Produces a risk assessment
* Suggests a **Next-Best Action (NBA)**
* Provides an investigator-friendly interface for reviewing cases
* Maintains an evidence-based investigation workflow

> **Important:** The system provides investigation support and recommendations. Final decisions remain with the human investigator.

---

# Key Features

### 🔎 Case Investigation

Investigators can open a suspicious case and examine the available transaction and entity information.

### 🕸️ Graph-Based Investigation

TigerGraph is used to model relationships between entities such as:

```text
Customer
   ↓
Account
   ↓
Transaction
   ↓
Merchant
   ↓
Device
```

This allows the investigator to investigate connections across multiple entities instead of looking at transactions independently.

### 🤖 Agentic Investigation

The system uses an agent-based workflow to process a case, investigate relevant information, generate evidence, and determine the appropriate next investigation step.

### 📊 Risk Analysis

Cases are analyzed using multiple pieces of evidence rather than relying only on a single transaction.

### 📋 Evidence Generation

Investigation findings are presented as structured evidence so that the reasoning behind the recommendation can be reviewed.

### ⚡ Next-Best Action

The system suggests an appropriate next action based on the investigation findings and available evidence.

Possible actions may include:

* Request additional information
* Escalate the case
* Continue monitoring
* Review connected entities
* Prepare the case for further investigation

---

# System Workflow

```text
                    Suspicious Case
                          │
                          ▼
                  Case Investigation
                          │
                          ▼
                    AI Agent
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
       Transaction Data          Knowledge/Policy
              │                       │
              └───────────┬───────────┘
                          ▼
                    TigerGraph
                          │
                          ▼
                 Graph Investigation
                          │
                          ▼
                    Evidence
                          │
                          ▼
                    Risk Analysis
                          │
                          ▼
                 Next-Best Action
                          │
                          ▼
                 Investigator Review
```

---

# Technology Stack

| Component        | Technology                  |
| ---------------- | --------------------------- |
| Frontend         | Next.js / React             |
| Backend          | Python                      |
| AI / Agent Layer | Python-based agent workflow |
| Graph Database   | TigerGraph                  |
| Database / Data  | Transaction dataset         |
| Styling          | CSS                         |
| Version Control  | Git / GitHub                |

---

# Project Structure

```text
agentic-fraud-investigation/
│
├── data/
│   └── transactions.csv
│
├── knowledge/
│   ├── fraud_patterns.md
│   └── fraud_policy.md
│
├── frontend/
│   ├── app/
│   ├── components/
│   └── ...
│
├── agents/
│   └── ...
│
├── graph/
│   └── ...
│
├── ...
│
├── README.md
└── .gitignore
```

> The transaction dataset is intentionally excluded from GitHub because of its size and is maintained locally.

---

# How to Run the Project

## 1. Clone the Repository

```bash
git clone https://github.com/Tamosa2006/agentic-fraud-investigation.git
cd agentic-fraud-investigation
```

---

## 2. Create a Python Virtual Environment

Windows:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\Activate.ps1
```

---

## 3. Install Python Dependencies

```powershell
pip install -r requirements.txt
```

---

## 4. Configure Environment Variables

Create a `.env` file in the required project directory and add the required API credentials/configuration.

Example:

```env
TIGERGRAPH_HOST=your_tigergraph_host
TIGERGRAPH_USERNAME=your_username
TIGERGRAPH_PASSWORD=your_password
```

Add any additional API keys required by the agent configuration.

**Never commit your `.env` file to GitHub.**

---

## 5. Add the Transaction Dataset

The transaction dataset is not included in the repository because of its large size.

Place the dataset locally at:

```text
data/transactions.csv
```

The file is already included in `.gitignore`.

---

# Running the Frontend

Navigate to the frontend directory:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

# Using the Application

## 1. Overview Dashboard

The dashboard provides a high-level view of the investigation environment.

It gives investigators quick access to:

* Active investigations
* Recent cases
* Risk information
* Investigation statistics
* Graph activity
* Evidence summaries

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/0b381ed4-2c1b-48ac-a0c2-20146f1de587" />


### What this page does

The Overview page acts as the starting point for the investigator. It summarizes the current investigation environment and provides navigation to individual cases and investigation workflows.

---

# 2. Case Queue

The Case Queue displays suspicious cases that require investigation.

### Screenshot

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/5bd8188e-08a5-47fa-8425-b4942341e039" />


### What this page does

Each case contains relevant information that allows an investigator to identify the case and begin the investigation.

The investigator can select a case to open the detailed investigation workflow.

---

# 3. New Investigation

The New Investigation section allows an investigator to start an investigation for a new suspicious case.

### Screenshot

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/b01ee1dc-efa3-49af-8bf8-e7e2ead368e5" />


### What this page does

The investigator provides the required case information and starts the investigation process.

The submitted case becomes available to the investigation workflow for further analysis.

---

# 4. Investigation Details

The Investigation Details page provides a deeper view of an individual case.

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/32ca002e-0ab9-41ae-a714-b9983e341a1a" />


### What this page does

This page brings together the information required to understand the case, including:

* Case information
* Transaction information
* Connected entities
* Risk indicators
* Investigation findings
* Evidence
* Recommended actions

---

# 5. Transaction Analysis

The transaction section allows investigators to inspect suspicious transactions associated with a case.

### Screenshot

*Add your screenshot here.*

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/5cc25858-d1a2-464c-b1fb-1285dbdb64df" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f40d1339-4321-40b5-9a25-74e168c2f71b" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d3b65831-deed-47a7-8576-f4839c34c839" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/89c3a772-45c6-499f-827c-cf2282e83634" />


### What this page does

Investigators can examine transaction-level information and identify suspicious activity that may require deeper graph investigation.

---

# 6. Graph Investigation

The graph investigation view is one of the core components of the system.

### Screenshot

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d0ca4915-5292-4761-909f-34f44c54295a" />


### What this page does

Instead of examining transactions independently, the graph represents relationships between entities.

For example:

```text
Account A
   │
   ├── Transaction ──► Account B
   │
   ├── Device ───────► Device X
   │
   └── Merchant ─────► Merchant Y
```

This makes it possible to investigate connected entities and identify relationships that may indicate coordinated or suspicious activity.

---

# 7. Risk Score

The Risk section summarizes the risk indicators identified during the investigation.

### Screenshot

<img width="1670" height="509" alt="image" src="https://github.com/user-attachments/assets/fd69e8f0-df40-4d44-b47c-84911f726d11" />


### What this page does

The risk view brings together relevant signals from the investigation and presents them in a structured format.

The purpose is to help the investigator understand **why a case requires attention**, rather than presenting a score without supporting evidence.

---

# 8. Evidence

The Evidence section presents the findings collected during the investigation.

### Screenshot

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/917ee2e8-fa77-4d00-98d6-b12cb0a99036" />


### What this page does

Evidence provides a structured explanation of the observations discovered during the investigation.

This allows investigators to review the basis of the investigation outcome and trace findings back to relevant case information.

---

# 9. Next-Best Action

The Next-Best Action section provides an action recommendation based on the available investigation evidence.

### Screenshot

*Add your screenshot here.*

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/da68a400-5b7f-456c-bc34-0eb4a615d01e" />


### What this page does

The system uses the investigation context to suggest the next step that an investigator can consider.

The recommendation is intended to support the investigator rather than replace human decision-making.

---

# TigerGraph Integration

TigerGraph is used as the graph layer of the investigation system.

The graph represents relationships between entities involved in financial activity.

For example:

```text
Customer
   │
   ▼
Account
   │
   ▼
Transaction
   │
   ├────────► Merchant
   │
   ├────────► Device
   │
   └────────► Other Account
```

This graph structure allows the investigation system to perform relationship-based analysis.

Instead of asking only:

> "Is this transaction suspicious?"

the system can investigate questions such as:

> "What other entities are connected to this account?"

> "Which accounts are connected through common devices?"

> "Are multiple suspicious transactions connected?"

> "What relationships exist around this case?"

---

# Agentic Investigation Flow

The investigation agent follows a structured workflow:

```text
Case Input
    ↓
Understand Case
    ↓
Collect Relevant Information
    ↓
Query Investigation Data
    ↓
Analyze Graph Relationships
    ↓
Identify Evidence
    ↓
Evaluate Risk Indicators
    ↓
Determine Investigation State
    ↓
Generate Next-Best Action
    ↓
Present Results to Investigator
```

The workflow is designed so that investigation results can be reviewed instead of treating the AI output as an unexplained final decision.

---

# Knowledge Base

The project also contains investigation knowledge and policy information.

```text
knowledge/
├── fraud_patterns.md
└── fraud_policy.md
```

These resources provide contextual information that can be used by the investigation workflow when interpreting suspicious activity and determining appropriate investigation actions.

---

# Dataset

The project uses a transaction dataset for investigation and testing.

Because the dataset is approximately **675 MB**, it is not stored in the Git repository.

The expected local path is:

```text
data/transactions.csv
```

This file is excluded using `.gitignore`.

---

# Security

Do not commit sensitive credentials or secrets.

The following should remain local:

```text
.env
API keys
TigerGraph credentials
private datasets
```

The repository `.gitignore` is configured to prevent sensitive configuration files and the large transaction dataset from being committed.

---

# Future Improvements

Potential future improvements include:

* More advanced fraud-pattern detection
* Additional graph queries
* More investigation agents
* Real-time transaction streaming
* Improved evidence tracing
* Investigator feedback loops
* Automated case prioritization
* Expanded explainability
* Additional financial fraud patterns
* Production deployment

---

# Project Purpose

This project explores how **AI agents and graph databases can work together for financial fraud investigation**.

The goal is not simply to detect suspicious transactions, but to provide investigators with a connected view of the case, supporting evidence, graph relationships, and potential next actions within a single investigation workflow.

---


