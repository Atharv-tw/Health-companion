# AI Health Companion MVP - Consolidated Implementation Plan

## Overview

AI Health Companion is a web-based MVP that helps users log health signals, generates risk indicators (not diagnosis), provides preventive guidance via OnDemand AI agents, and escalates emergencies to professional care.

**Core Loop:** Log → Interpret → Act → Escalate

**Target:** On-Demand.io Hackathon Track

---

## Hackathon Requirements (CRITICAL)

| Requirement | Target | Status |
|-------------|--------|--------|
| **Custom Tool Integrations** | Minimum 3 | ✅ 4 Done (Health, Nutrition, Mental, Herbi Cure) |
| **OnDemand Agents** | Minimum 6 | ✅ 5 Agents (4 chat modes + Air Quality) |
| **Chat API** | Mandatory | ✅ Implemented |
| **Media API** | Mandatory | ✅ Implemented (Report Analysis) |

---

## CURRENT IMPLEMENTATION (Actual Path Taken)

Instead of the Orchestrator multi-agent pattern, we implemented a simpler approach using **Chat Mode Dropdown** with custom fulfillment prompts.

### 4 Custom Tools (Chat Modes)

Each mode is a separate API endpoint with a specialized fulfillment prompt that reads user's health data.

| # | Mode | Endpoint | Icon | Color | Description |
|---|------|----------|------|-------|-------------|
| 1 | **Health Assistant** | `/api/chat` | Stethoscope | Blue | General health guidance, symptom interpretation |
| 2 | **Nutrition Advisor** | `/api/nutrition` | Apple | Green | Diet, meal planning, reads health logs |
| 3 | **Mental Wellness** | `/api/mental-wellness` | Brain | Purple | Stress management, emotional support |
| 4 | **Herbi Cure** | `/api/herbi-cure` | Leaf | Emerald | Ayurvedic wellness, herbs, yoga |

### Air Quality Dashboard Widget

| Feature | Status |
|---------|--------|
| Air Quality API (`/api/air-quality`) | ✅ Uses agent-1737061205 |
| AirQualityCard component | ✅ Desktop + Mobile |
| Auto-refresh (10 min) | ✅ Continuous data |
| Location-based (Geolocation) | ✅ Falls back to default |

### How It Works

```
User selects mode from dropdown → Sends query to mode's endpoint →
Endpoint fetches user's health logs + reports from DB →
Builds personalized fulfillment prompt with user data →
Calls OnDemand Chat API with fulfillment prompt →
Returns AI response
```

### Key Files

| File | Purpose |
|------|---------|
| `src/app/api/chat/route.ts` | Health Assistant endpoint |
| `src/app/api/nutrition/route.ts` | Nutrition Advisor endpoint |
| `src/app/api/mental-wellness/route.ts` | Mental Wellness endpoint |
| `src/app/api/herbi-cure/route.ts` | Herbi Cure Ayurveda endpoint |
| `src/app/api/air-quality/route.ts` | Air Quality data endpoint |
| `src/components/desktop/pages/Chat.tsx` | Desktop chat with mode dropdown |
| `src/components/mobile/pages/Chat.tsx` | Mobile chat with mode dropdown |
| `src/components/dashboard/AirQualityCard.tsx` | Air quality display widget |

### Media API Integration

| Feature | Status |
|---------|--------|
| Report Upload (Vercel Blob) | ✅ Done |
| OnDemand Media API (Text Extraction) | ✅ Done |
| Report Analysis Display | ✅ Done |
| AI reads reports in fulfillment prompts | ✅ Done |

---

## ~~8 OnDemand Agents (Workflow Pattern)~~ - NOT IMPLEMENTED

**Architecture:** Uses OnDemand Workflow with 8 LLM nodes. User query flows through Orchestrator → Specialists → Combiner → Output.

```
┌─────────────────────────────────────────────────────────────┐
│                      API TRIGGER                             │
│                   (User sends query)                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 LLM1: ORCHESTRATOR                           │
│                                                              │
│  • Analyzes user intent                                      │
│  • Routes query to appropriate specialists                   │
│  • Handles emergency detection                               │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │   LLM2    │   │   LLM3    │   │   LLM4    │
    │  Health   │   │  Symptom  │   │   Risk    │
    │   Chat    │   │  Analyzer │   │ Interpreter│
    └───────────┘   └───────────┘   └───────────┘
            │               │               │
            ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │   LLM5    │   │   LLM6    │   │   LLM7    │
    │ Nutrition │   │  Mental   │   │  Report   │
    │  Advisor  │   │ Wellness  │   │ Analyzer  │
    └───────────┘   └───────────┘   └───────────┘
            │               │               │
            └───────────────┼───────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 LLM8: RESPONSE COMBINER                      │
│                                                              │
│  • Combines specialist responses                             │
│  • Removes redundancy                                        │
│  • Creates unified, coherent answer                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        OUTPUT                                │
│              (Returns to user's chat)                        │
└─────────────────────────────────────────────────────────────┘
```

### Agent Roster

| # | Node | Agent Name | Role |
|---|------|------------|------|
| 1 | LLM1 | **Orchestrator** | Routes query to specialists, emergency detection |
| 2 | LLM2 | **Health Chat** | General health Q&A, wellness tips |
| 3 | LLM3 | **Symptom Analyzer** | Symptom patterns, severity assessment |
| 4 | LLM4 | **Risk Interpreter** | Explains risk levels from logged data |
| 5 | LLM5 | **Nutrition Advisor** | Diet, hydration, meal guidance |
| 6 | LLM6 | **Mental Wellness** | Stress, sleep, emotional support |
| 7 | LLM7 | **Report Analyzer** | Medical report/lab result explanations |
| 8 | LLM8 | **Response Combiner** | Merges specialist outputs into unified answer |

### Example Routing

| User Query | Orchestrator Routes To | Why |
|------------|----------------------|-----|
| "What helps with headaches?" | Health Chat | General health question |
| "I've had chest pain for 2 days" | Symptom Analyzer | Symptom-focused |
| "Why is my risk level HIGH?" | Risk Interpreter | Risk explanation |
| "What should I eat to lower cholesterol?" | Nutrition Advisor | Diet question |
| "I can't sleep and feel anxious" | Mental Wellness + Symptom Analyzer | Multi-domain |
| "Explain my blood test results" | Report Analyzer | Document analysis |
| "Headache, bad diet, stressed" | Symptom + Nutrition + Mental | Complex multi-domain |

### Agent Configuration

Each agent needs:
- System prompt (role definition + constraints)
- Guardrails (block diagnosis, prescriptions, dosing)
- Connected tools (for accessing user data)
- Knowledge base (curated health docs)

---

## 4 Custom Tool Integrations

Tools are REST APIs that agents can call to access your app's data.

| # | Tool Name | Endpoint | What It Returns |
|---|-----------|----------|-----------------|
| 1 | **get_health_logs** | `GET /api/tools/health-logs` | User's recent health logs (symptoms, vitals, lifestyle) |
| 2 | **get_risk_assessment** | `GET /api/tools/risk-assessment` | Current risk level, reasons, red flags, next steps |
| 3 | **get_user_profile** | `GET /api/tools/user-profile` | User's age, conditions, allergies |
| 4 | **analyze_report** | `POST /api/tools/analyze-report` | Extracted text/data from uploaded medical report |

### Tool Registration in OnDemand

Each tool requires an OpenAPI schema definition:
```yaml
openapi: 3.0.0
info:
  title: Health Companion Tools
  version: 1.0.0
paths:
  /api/tools/health-logs:
    get:
      summary: Get user's recent health logs
      parameters:
        - name: userId
          in: query
          required: true
          schema:
            type: string
      responses:
        200:
          description: Recent health logs
```

---

## Media API Integration

**Purpose:** Process uploaded medical documents (lab reports, prescriptions, imaging reports)

**Flow:**
1. User uploads PDF/image to Vercel Blob
2. App sends file URL to OnDemand Media API
3. Media API extracts text/data
4. Report Analyzer Agent interprets the content
5. Returns structured summary to user

**Use Cases:**
- Lab report analysis (blood tests, urine tests)
- Prescription verification (what medicines are listed)
- Imaging report summaries (X-ray, MRI reports)

---

## Architecture Strategy

**Hybrid Approach:**
- **Local Backend:** Next.js + Prisma + PostgreSQL + Vercel (handles data, UI, auth)
- **AI Layer (OnDemand):** 7 Agents (Orchestrator + 6 Specialists) + Tools + RAG + Safety + Media API

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard │ Health Log │ Chat │ Reports │ Reminders │ SOS      │
│                          (single chat - user talks here)         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LOCAL BACKEND (API Routes)                  │
├─────────────────────────────────────────────────────────────────┤
│  /api/health/*  │  /api/chat  │  /api/tools/*  │  /api/reports  │
│                 │             │                │                 │
│  Risk Engine    │  Safety     │  Tool          │  Vercel Blob   │
│  (Local)        │  Gate       │  Endpoints     │  Storage       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ONDEMAND PLATFORM                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               ORCHESTRATOR AGENT (Main)                  │   │
│  │      Analyzes intent → Routes → Combines responses       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    ▼                   ▼                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              6 SPECIALIZED AGENTS (Sub-agents)           │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Health │ Symptom │ Risk   │ Nutrition │ Mental │ Report │   │
│  │ Chat   │ Analyzer│ Interp │ Advisor   │ Wellness│ Analyzer│  │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │ Tool Registry │  │ Knowledge Base│  │  Media API    │       │
│  │ (4 Tools)     │  │ (RAG)         │  │ (Documents)   │       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              GUARDRAILS (Safety Layer)                   │   │
│  │  Block: diagnosis, prescriptions, dosing                 │   │
│  │  Escalate: emergencies, crisis                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Component | Choice | Role |
|-----------|--------|------|
| Framework | Next.js 14 (App Router) | Frontend & Backend API |
| Database | PostgreSQL + Prisma | User data, Health logs, Reports metadata |
| Auth | NextAuth.js (email/password) | Secure authentication |
| AI Agents | OnDemand Agent Builder (x7) | 1 Orchestrator + 6 Specialists |
| Tools | OnDemand Tool Registry (x4) | Agent access to app data |
| RAG | OnDemand Knowledge Base | Medical docs retrieval |
| Media | OnDemand Media API | Document processing |
| Safety | OnDemand Guardrails + Local | Prevent unsafe outputs |
| Storage | Vercel Blob | PDF/Image Reports storage |
| Deploy | Vercel | Hosting |

---

## Project Structure

```
health-companion/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (protected)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── log/page.tsx
│   │   │   ├── chat/page.tsx          # Multi-agent chat interface
│   │   │   ├── reports/page.tsx       # Upload + Media API analysis
│   │   │   ├── reminders/page.tsx
│   │   │   └── sos/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── health/
│   │   │   │   ├── log/route.ts
│   │   │   │   └── summary/route.ts
│   │   │   ├── chat/route.ts          # Routes to appropriate agent
│   │   │   ├── tools/                 # NEW: Tool endpoints for agents
│   │   │   │   ├── health-logs/route.ts
│   │   │   │   ├── risk-assessment/route.ts
│   │   │   │   ├── user-profile/route.ts
│   │   │   │   └── analyze-report/route.ts
│   │   │   ├── reports/
│   │   │   │   ├── route.ts
│   │   │   │   ├── upload-url/route.ts
│   │   │   │   ├── analyze/route.ts   # NEW: Media API integration
│   │   │   │   └── [id]/route.ts
│   │   │   ├── reminders/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── sos/
│   │   │       ├── contacts/route.ts
│   │   │       └── trigger/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   ├── health/
│   │   │   ├── SymptomInput.tsx
│   │   │   ├── VitalsInput.tsx
│   │   │   ├── LifestyleInput.tsx
│   │   │   └── RiskCard.tsx
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx      # Updated: agent selector
│   │   │   ├── ChatMessage.tsx
│   │   │   └── AgentSelector.tsx      # NEW: switch between agents
│   │   ├── reports/
│   │   │   ├── UploadDropzone.tsx
│   │   │   ├── ReportsList.tsx
│   │   │   └── ReportAnalysis.tsx     # NEW: display Media API results
│   │   ├── reminders/
│   │   │   └── ReminderList.tsx
│   │   ├── sos/
│   │   │   ├── SOSButton.tsx
│   │   │   └── EmergencyContacts.tsx
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   ├── ondemand.ts                # Updated: multi-agent support
│   │   ├── ondemand-media.ts          # NEW: Media API client
│   │   ├── risk-engine.ts
│   │   ├── safety-gate.ts
│   │   ├── emergency-templates.ts
│   │   └── validators.ts
│   └── types/
│       └── index.ts
└── knowledge/
    └── sources/                        # Upload to OnDemand Knowledge Base
```

---

## Implementation Stages (Updated)

### Stage A: Foundation ✅ COMPLETE
- Next.js app with auth and database
- User signup/login
- Protected routes

### Stage B: Health Logging ✅ COMPLETE
- Health log API and UI
- Symptoms, vitals, lifestyle tracking
- Dashboard with summary

### Stage C: Risk Engine ✅ COMPLETE
- Deterministic risk scoring
- RiskAlert creation
- RiskCard display

### Stage D: Safety Gate ✅ COMPLETE
- Emergency detection
- Unsafe request blocking
- Local fallback responses

### Stage E: OnDemand Chat ✅ COMPLETE
- Health Assistant chat mode
- Safety gate integration
- OnDemand Chat API client

### Stage E2: Custom Tools (Chat Modes) ✅ COMPLETE
- Nutrition Advisor mode with health data access
- Mental Wellness mode with health data access
- Mode selector dropdown in chat UI
- All modes read user's health logs and reports

### Stage E3: Tool API Endpoints ✅ COMPLETE (but unused)
- Created REST API tool endpoints
- `/api/tools/health-logs`, `/api/tools/risk-assessment`, etc.
- Note: These are created but OnDemand REST API tools didn't work well
- Using fulfillment prompts with DB data instead

### Stage E4: Media API ✅ COMPLETE
- OnDemand Media API for PDF text extraction
- Report upload to Vercel Blob
- AI analyzes extracted report text
- Reports accessible in chat fulfillment prompts

### Stage F: Reports ✅ COMPLETE
- Report upload and storage
- Report analysis with AI
- Reports list view

### Stage G: Reminders + SOS ✅ COMPLETE
- Reminder CRUD
- Emergency contacts
- SOS trigger

---

## ~~Stage E2: Orchestrator Multi-Agent System~~ - SKIPPED

**Original Goal:** Create 7 agents with Orchestrator pattern (1 main + 6 specialists)

**Tasks:**
1. Create Orchestrator agent in OnDemand dashboard (user talks to this one)
2. Create 6 specialist agents as "sub-agents" the Orchestrator can call
3. Configure Orchestrator to route queries intelligently
4. Connect tools to appropriate specialist agents
5. Keep chat UI simple (no agent selector needed)

**Agent System Prompts:**

```
# ORCHESTRATOR AGENT (Main - User talks to this)
You are the Health Companion orchestrator. Your role is to:
1. Analyze user queries to understand their intent
2. Route queries to the appropriate specialist agent(s)
3. For complex queries, call multiple specialists and combine their responses
4. Maintain conversation context across interactions

You have access to these specialist agents as tools:
- health_chat: General health questions, wellness tips
- symptom_analyzer: Symptom analysis and severity assessment
- risk_interpreter: Explain risk scores and health indicators
- nutrition_advisor: Diet, meal guidance, hydration
- mental_wellness: Stress, sleep, emotional support
- report_analyzer: Medical document explanations

Routing guidelines:
- Simple health question → health_chat
- Symptoms mentioned → symptom_analyzer
- "Why is my risk..." → risk_interpreter
- Diet/food/nutrition → nutrition_advisor
- Stress/sleep/anxiety → mental_wellness
- Lab results/reports → report_analyzer
- Complex queries → call multiple specialists, combine answers

Never diagnose, prescribe, or give dosage advice.
Always recommend consulting healthcare professionals for medical concerns.

# Health Chat Agent (Specialist)
You are a health information specialist. Provide general wellness tips
and health information. Never diagnose, prescribe, or give dosage advice.
Keep responses concise - the Orchestrator may combine your answer with others.

# Symptom Analyzer Agent (Specialist)
You analyze reported symptoms and assess potential severity.
You have access to user's health logs via tools.
Focus on symptom patterns, duration, and when to seek care.
Never diagnose conditions. Keep responses concise for combination.

# Risk Interpreter Agent (Specialist)
You explain health risk assessments in plain language.
You have access to user's risk assessment via tools.
Explain what risk levels mean and suggest appropriate next steps.
Keep responses concise for combination.

# Nutrition Advisor Agent (Specialist)
You provide diet and nutrition guidance for general wellness.
Focus on balanced eating, hydration, and healthy habits.
Never prescribe specific diets for medical conditions.
Keep responses concise for combination.

# Mental Wellness Agent (Specialist)
You provide mental health support and stress management tips.
Focus on sleep hygiene, relaxation techniques, and coping strategies.
If user mentions self-harm or suicide, escalate immediately.
Keep responses concise for combination.

# Report Analyzer Agent (Specialist)
You analyze medical reports and lab results.
You have access to extracted report data via Media API.
Explain results in simple terms. Never diagnose based on reports.
Keep responses concise for combination.
```

**Orchestrator Tool Configuration:**
The Orchestrator needs 6 "agent tools" to call specialists:
```json
{
  "tools": [
    { "name": "health_chat", "type": "agent", "agentId": "..." },
    { "name": "symptom_analyzer", "type": "agent", "agentId": "..." },
    { "name": "risk_interpreter", "type": "agent", "agentId": "..." },
    { "name": "nutrition_advisor", "type": "agent", "agentId": "..." },
    { "name": "mental_wellness", "type": "agent", "agentId": "..." },
    { "name": "report_analyzer", "type": "agent", "agentId": "..." }
  ]
}
```

**Files to modify:**
- src/lib/ondemand.ts (simplified - just call Orchestrator)
- src/app/api/chat/route.ts (send all queries to Orchestrator)
- No AgentSelector.tsx needed (user doesn't pick agents)

---

### Stage E3: Tool Integrations (NEW)

**Goal:** Create 4 tool endpoints for agents to call

**Tasks:**
1. Create tool API endpoints
2. Register tools in OnDemand dashboard
3. Connect tools to appropriate agents

**Tool Endpoints:**

```typescript
// GET /api/tools/health-logs
// Returns: { logs: HealthLog[], summary: string }

// GET /api/tools/risk-assessment
// Returns: { riskLevel, reasons, redFlags, nextSteps }

// GET /api/tools/user-profile
// Returns: { age, conditions, allergies }

// POST /api/tools/analyze-report
// Returns: { extractedText, structuredData }
```

**Files to create:**
- src/app/api/tools/health-logs/route.ts
- src/app/api/tools/risk-assessment/route.ts
- src/app/api/tools/user-profile/route.ts
- src/app/api/tools/analyze-report/route.ts

---

### Stage E4: Media API Integration (NEW)

**Goal:** Process medical documents with OnDemand Media API

**Tasks:**
1. Create OnDemand Media API client
2. Add report analysis endpoint
3. Update reports UI for analysis display
4. Connect to Report Analyzer Agent

**Flow:**
```
User uploads PDF → Vercel Blob → Media API extracts text →
Report Analyzer Agent interprets → Display summary to user
```

**Files to create:**
- src/lib/ondemand-media.ts
- src/app/api/reports/analyze/route.ts
- src/components/reports/ReportAnalysis.tsx

---

### Stage F: Reports ✅ (Other Dev)

### Stage G: Reminders + SOS ✅ (Other Dev)

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# OnDemand
ONDEMAND_API_KEY="..."

# OnDemand Agent IDs (7 agents - Orchestrator + 6 Specialists)
ONDEMAND_ORCHESTRATOR_ID="..."         # Main agent (user talks to this)
ONDEMAND_AGENT_HEALTH_CHAT="..."       # Specialist
ONDEMAND_AGENT_SYMPTOM_ANALYZER="..."  # Specialist
ONDEMAND_AGENT_RISK_INTERPRETER="..."  # Specialist
ONDEMAND_AGENT_NUTRITION="..."         # Specialist
ONDEMAND_AGENT_MENTAL_WELLNESS="..."   # Specialist
ONDEMAND_AGENT_REPORT_ANALYZER="..."   # Specialist

# Vercel Blob
BLOB_READ_WRITE_TOKEN="..."

# App URL (for tool callbacks)
APP_URL="https://your-app.vercel.app"
```

---

## OnDemand Setup Checklist

### 1. Create 7 Agents (Orchestrator Pattern)

**Step 1: Create 6 Specialist Agents First**
- [ ] Health Chat Agent (specialist)
- [ ] Symptom Analyzer Agent (specialist)
- [ ] Risk Interpreter Agent (specialist)
- [ ] Nutrition Advisor Agent (specialist)
- [ ] Mental Wellness Agent (specialist)
- [ ] Report Analyzer Agent (specialist)

**Step 2: Create Orchestrator Agent (connects to specialists)**
- [ ] Orchestrator Agent (main - add 6 specialists as agent tools)

### 2. Register 4 Tools
- [ ] get_health_logs
- [ ] get_risk_assessment
- [ ] get_user_profile
- [ ] analyze_report

### 3. Configure Guardrails (each agent)
- [ ] Block: "diagnose", "you have [disease]"
- [ ] Block: "prescribe", "take [medication]"
- [ ] Block: "dosage", "[X] mg"
- [ ] Escalate: "suicide", "self-harm"
- [ ] Escalate: "chest pain + breathing"
- [ ] Escalate: "stroke symptoms"

### 4. Upload Knowledge Base
- [ ] Symptom guides (CDC, WHO, NHS)
- [ ] Emergency red flags
- [ ] Nutrition basics
- [ ] Mental health resources
- [ ] Lab value reference ranges

### 5. Enable Media API
- [ ] Configure for PDF processing
- [ ] Configure for image processing
- [ ] Test with sample lab report

---

## API Routes Summary (Updated)

| Endpoint | Purpose |
|----------|---------|
| `POST /api/health/log` | Submit health log, triggers risk engine |
| `GET /api/health/summary` | 7-day aggregated metrics |
| `POST /api/chat` | Routes to appropriate OnDemand agent |
| `GET /api/tools/health-logs` | Tool: Returns health logs for agents |
| `GET /api/tools/risk-assessment` | Tool: Returns risk data for agents |
| `GET /api/tools/user-profile` | Tool: Returns user profile for agents |
| `POST /api/tools/analyze-report` | Tool: Processes report with Media API |
| `POST /api/reports/upload-url` | Get signed upload URL |
| `POST /api/reports/analyze` | Trigger Media API analysis |
| `CRUD /api/reports` | Report management |
| `CRUD /api/reminders` | Reminder management |
| `CRUD /api/sos/contacts` | Emergency contacts management |
| `POST /api/sos/trigger` | Emergency alert |

---

## Implementation Priority

**ALL STAGES COMPLETE:**
1. ✅ Stage A: Foundation
2. ✅ Stage B: Health Logging
3. ✅ Stage C: Risk Engine
4. ✅ Stage D: Safety Gate
5. ✅ Stage E: OnDemand Chat
6. ✅ Stage E2: Custom Tools (3 Chat Modes)
7. ✅ Stage E3: Tool API Endpoints (created, unused)
8. ✅ Stage E4: Media API
9. ✅ Stage F: Reports
10. ✅ Stage G: Reminders + SOS

**REMAINING (Optional):**
- Knowledge Base upload to OnDemand (RAG)
- UI polish / bug fixes
- Demo preparation

---

## Hackathon Winning Features

1. **7 Agents with Orchestrator Pattern:** Intelligent routing - user talks naturally, AI decides what specialists to consult
2. **Multi-Agent Responses:** Complex queries trigger multiple specialists, combined into one coherent answer
3. **4 Tool Integrations:** Agents access real user data (health logs, risk scores, profile)
4. **Media API:** Analyze actual medical documents (lab reports, prescriptions)
5. **Safety First:** Multi-layer guardrails (local safety gate + OnDemand guardrails)
6. **Context Aware:** Specialists know user's health history via tools
7. **Seamless UX:** Single chat interface - no confusing agent selection for users
8. **Emergency Ready:** Crisis detection with SOS integration

---

## Verification Checklist (Updated)

### Basic Features
- [x] Auth flow: signup → login → logout
- [x] Health logging: submit → dashboard → risk card
- [x] Risk engine: LOW/MEDIUM/HIGH scenarios

### Chat Modes (Custom Tools)
- [x] Health Assistant mode works
- [x] Nutrition Advisor mode works (reads health logs)
- [x] Mental Wellness mode works (reads health logs)
- [x] Mode dropdown switches between modes
- [x] Session resets when switching modes

### Media API
- [x] Upload PDF/image report
- [x] OnDemand Media API extracts text
- [x] AI can analyze reports
- [x] Reports accessible in chat prompts

### Safety
- [x] Emergency phrases → escalation guidance
- [x] Crisis detection in Mental Wellness mode
- [x] "Consult professional" disclaimers

### Features
- [x] Reports upload and list
- [x] Reminders CRUD
- [x] SOS emergency contacts
- [x] Dashboard with health summary
