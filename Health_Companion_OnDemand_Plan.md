# Health Companion MVP - Implementation Plan (with On-Demand.io Integration)

## 🚀 Overview
An intelligent personal health assistant built for the **On-Demand.io Hackathon Track**. It leverages **On-Demand.io Agents** for safe, hallucination-free health guidance, RAG retrieval from medical docs, and automated guardrails.

## 🛠 Tech Stack
| Component | Choice | Role |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | Frontend & Backend API |
| **Database** | PostgreSQL + Prisma | User data, Health logs, Reports metadata |
| **Auth** | NextAuth.js | Secure Email/Password authentication |
| **AI Agent** | **On-Demand.io Agent API** | Chat orchestration, Tool usage, Safety |
| **RAG** | **On-Demand.io Knowledge** | Storage & Retrieval of medical docs |
| **Storage** | Vercel Blob | PDF/Image Reports storage |
| **Deploy** | Vercel | Hosting |

---

## 📂 Project Structure

```
health-companion/
├── prisma/
│   └── schema.prisma          # DB Schema (User, HealthLog, RiskAlert, Report)
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login / Signup
│   │   ├── (protected)/       # App Features
│   │   │   ├── dashboard/     # Main Hub
│   │   │   ├── log/           # Symptom/Vitals Entry
│   │   │   ├── chat/          # On-Demand Agent Interface
│   │   │   ├── reports/       # Medical Reports (Blob)
│   │   │   └── sos/           # Emergency Button
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth Routes
│   │   │   ├── chat/          # Calls On-Demand.io API
│   │   │   ├── health/        # Logging & Summary APIs
│   │   │   └── reports/       # Upload Management
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── chat/              # Chat Interface Components
│   │   ├── health/            # Health Logging Forms
│   │   └── layout/            # Navbar, Sidebar
│   ├── lib/
│   │   ├── db.ts              # Prisma Client
│   │   ├── on-demand.ts       # On-Demand.io API Client (NEW)
│   │   ├── risk-engine.ts     # Deterministic Rule Engine
│   │   └── utils.ts           # Helpers
├── knowledge/                 # Raw Markdown files for On-Demand Ingestion
│   └── sources/
└── .env                       # Secrets (incl. ON_DEMAND_API_KEY)
```

---

## 📅 Implementation Stages

### Stage A: Foundation (Critical) 🏗️
**Goal:** Bootable Next.js app with Auth & Database.
1.  **Initialize:** `npx create-next-app@latest health-companion`.
2.  **Dependencies:** Install `prisma`, `next-auth`, `zod`, `shadcn/ui`.
3.  **Database:** Setup PostgreSQL & User Schema.
4.  **Auth:** Configure NextAuth (Email/Password).
5.  **UI:** Basic Layout & Dashboard shell.

### Stage B: Health Logging 📝
**Goal:** Users capture health data.
1.  **Schema:** Add `HealthLog` (Symptoms, Vitals).
2.  **API:** `POST /api/health/log`.
3.  **UI:** Forms for Symptoms, Vitals, Lifestyle.
4.  **Dashboard:** Display simple recent logs.

### Stage C: Risk Engine ⚠️
**Goal:** Deterministic analysis of logs.
1.  **Logic:** `risk-engine.ts` (Rules: e.g., Temp > 39°C = High Risk).
2.  **Integration:** Run on every log submission.
3.  **UI:** `RiskCard` component showing current status.

### Stage D: On-Demand.io Integration (The "Brain") 🧠
**Goal:** Replace manual RAG/Chat with On-Demand Agents.

#### 1. On-Demand Platform Setup
*   **Create Agent:** "Health Companion".
*   **Ingest Knowledge:** Upload Markdown files (WHO guidelines, First Aid) to On-Demand Knowledge Base.
*   **Configure Guardrails:**
    *   Block: "diagnose", "prescribe", "dosage".
    *   Escalate: "suicide", "chest pain".
*   **Define Tools:**
    *   (Optional) `get_latest_risk` (External API tool calling our app).

#### 2. App Integration
*   **Client Lib:** `src/lib/on-demand.ts` to wrap API calls.
*   **Chat API:** `POST /api/chat`
    *   Construct payload: `message` + `context` (User Profile, Last Risk Level).
    *   Call `https://api.on-demand.io/agent/run`.
    *   Return structured response.

### Stage E: Reports & SOS 📂🚨
**Goal:** File management & Emergency triggers.
1.  **Reports:** Vercel Blob upload for PDFs.
2.  **SOS:** Simple "Emergency Contacts" list & call button.

---

## ✅ Hackathon "Winning" Features
1.  **Agentic AI:** Not just a chatbot. It uses *tools* and *verified knowledge*.
2.  **Safety First:** On-Demand Guardrails prevent hallucinations/dangerous advice.
3.  **Context Aware:** The Agent knows your recent symptoms (passed via context).

## 📝 Next Steps (Immediate)
1.  Start **Stage A** (Foundation).
2.  Get **On-Demand.io API Key** from user.
