# Health Companion Knowledge Base

This directory contains the source-of-truth medical documents used by the OnDemand AI Agents (RAG).

## Source Documents (`/sources`)

1.  **`chest_pain_protocol.md`**: Triage logic for chest pain (Red/Yellow/Green flags).
2.  **`flu_cold_triage.md`**: Differentiating cold vs. flu and when to seek care.
3.  **`medication_safety.md`**: General safety guidelines and OTC warnings.

## How to Deploy to OnDemand

The "OnDemand DB" is essentially the Knowledge Base configured in your OnDemand Dashboard.

1.  **Log in** to [On-Demand.io Dashboard](https://app.on-demand.io).
2.  Navigate to **Knowledge Base** or **Data Sources**.
3.  Create a new Collection named **"Health-Protocols"**.
4.  **Upload** the markdown files from the `sources` folder.
5.  **Sync/Process** the collection to generate vector embeddings.
6.  **Connect** this Knowledge Base to your Agents:
    *   Orchestrator Agent
    *   Health Chat Agent
    *   Symptom Analyzer Agent
    *   Risk Interpreter Agent

## Auto-Ingestion (API)

If you have an API Key with `knowledge:write` permissions, you can use the ingestion endpoint (check OnDemand docs for `POST /knowledge/ingest`) to automate this.
