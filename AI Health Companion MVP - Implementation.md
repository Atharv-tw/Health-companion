# AI Health Companion MVP - Consolidated Implementation Plan

## Overview

AI Health Companion is a web-based MVP that helps users log health signals, generates risk indicators (not diagnosis), provides preventive guidance via OnDemand AI agents, and escalates emergencies to professional care.

**Core Loop:** Log → Interpret → Act → Escalate

**Target:** On-Demand.io Hackathon Track - leveraging OnDemand Agents for safe, hallucination-free health guidance with RAG retrieval and automated guardrails.

---

## Architecture Strategy

**Hybrid Approach:**
- **Local Backend:** Next.js + Prisma + PostgreSQL + Vercel (handles data, UI, auth)
- **AI Layer (OnDemand):** AI Agent + RAG + Safety Guardrails (handles the AI brain)

---

## Tech Stack

| Component | Choice | Role |
|-----------|--------|------|
| Framework | Next.js 14 (App Router) | Frontend & Backend API |
| Database | PostgreSQL + Prisma | User data, Health logs, Reports metadata |
| Auth | NextAuth.js (email/password) | Secure authentication |
| AI Agent | OnDemand Agent Builder | Chat orchestration, Tool usage, Safety |
| RAG | OnDemand Knowledge Ingestion | Storage & Retrieval of medical docs |
| Safety | OnDemand Guardrails + Local Fallback | Prevent unsafe outputs |
| Storage | Vercel Blob | PDF/Image Reports storage |
| Notifications | In-app only | Reminders display |
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
│   │   │   ├── chat/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── reminders/page.tsx
│   │   │   └── sos/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── health/
│   │   │   │   ├── log/route.ts
│   │   │   │   └── summary/route.ts
│   │   │   ├── chat/route.ts
│   │   │   ├── reports/
│   │   │   │   ├── route.ts
│   │   │   │   ├── upload-url/route.ts
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
│   │   │   ├── ChatInterface.tsx
│   │   │   └── ChatMessage.tsx
│   │   ├── reports/
│   │   │   ├── UploadDropzone.tsx
│   │   │   └── ReportsList.tsx
│   │   ├── reminders/
│   │   │   └── ReminderList.tsx
│   │   ├── sos/
│   │   │   ├── SOSButton.tsx
│   │   │   └── EmergencyContacts.tsx
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── db.ts                 # Prisma client
│   │   ├── auth.ts               # NextAuth config
│   │   ├── ondemand.ts           # OnDemand API client
│   │   ├── risk-engine.ts        # Deterministic risk scoring
│   │   ├── safety-gate.ts        # Local safety fallback
│   │   ├── emergency-templates.ts
│   │   └── validators.ts         # Zod schemas
│   └── types/
│       └── index.ts
└── knowledge/
    └── sources/                  # Curated health docs (upload to OnDemand)
```

---

## Data Models (Prisma)

- **User**: id, email, passwordHash, profile (age, conditions, allergies), consentAcceptedAt
- **HealthLog**: symptoms (JSON), vitals (JSON), lifestyle (JSON), userId, createdAt
- **RiskAlert**: riskLevel (LOW/MEDIUM/HIGH/EMERGENCY), reasons[], nextSteps[], redFlags[], ruleVersion, healthLogId
- **Report**: fileName, mimeType, size, storageKey, reportType, userId
- **Reminder**: type (MEDICINE/WATER/SLEEP/CUSTOM), title, schedule (JSON), enabled, lastTriggeredAt
- **EmergencyContact**: name, phone, email, relationship, userId

---

## Implementation Stages

### Stage A: Foundation (Critical)

**Goal:** Bootable Next.js app with auth and database

**Tasks:**
1. Initialize project
   - `npx create-next-app@latest health-companion --typescript --tailwind --app --src-dir`
   - Install: prisma, @prisma/client, next-auth, @auth/prisma-adapter, zod, bcryptjs
   - Setup shadcn/ui: `npx shadcn@latest init` + button, card, input, form components
2. Setup Prisma + PostgreSQL
   - `npx prisma init`
   - Define User model (id, email, passwordHash, profile JSON, consentAcceptedAt)
   - Configure DATABASE_URL
3. Implement NextAuth
   - Email/password credentials provider
   - Prisma adapter for session storage
   - Middleware for protected routes
4. Create base pages
   - Landing page with disclaimer
   - Login/Signup forms
   - Protected layout wrapper
   - Empty dashboard, log, chat, reports, reminders, sos pages

**Files to create:**
- prisma/schema.prisma
- src/lib/db.ts
- src/lib/auth.ts
- src/app/api/auth/[...nextauth]/route.ts
- src/middleware.ts
- src/app/(auth)/login/page.tsx
- src/app/(auth)/signup/page.tsx
- src/app/(protected)/layout.tsx
- src/app/(protected)/dashboard/page.tsx

**Acceptance:**
- User can sign up with email/password
- User can login/logout
- Protected routes redirect to login
- Consent disclaimer shown on signup

---

### Stage B: Health Logging + Summary

**Goal:** Users can log symptoms/vitals/lifestyle and see dashboard

**Tasks:**
1. Extend Prisma schema
   - HealthLog model (symptoms JSON, vitals JSON, lifestyle JSON, createdAt)
   - Add relation to User
2. Build logging API
   - POST /api/health/log - validate with Zod, store HealthLog
   - GET /api/health/summary?range=7d - aggregate last 7 days
3. Build logging UI
   - SymptomInput: standardized symptom list (checkboxes) + free text + severity + duration
   - VitalsInput: heart rate, temperature, BP, SpO2 (all optional)
   - LifestyleInput: sleep hours, stress level, hydration
   - Submit form calls API
4. Build dashboard
   - Show latest log summary
   - Simple trend charts (sleep avg, stress avg over 7 days)
   - List recent logs

**Files to create/modify:**
- prisma/schema.prisma (add HealthLog)
- src/lib/validators.ts
- src/app/api/health/log/route.ts
- src/app/api/health/summary/route.ts
- src/components/health/SymptomInput.tsx
- src/components/health/VitalsInput.tsx
- src/components/health/LifestyleInput.tsx
- src/app/(protected)/log/page.tsx
- src/app/(protected)/dashboard/page.tsx

**Acceptance:**
- User can submit health log with symptoms/vitals/lifestyle
- Dashboard shows latest log
- Summary endpoint returns 7-day aggregation

---

### Stage C: Risk Engine + Alerts

**Goal:** Deterministic risk scoring on each health log

**Tasks:**
1. Extend Prisma schema
   - RiskAlert model (riskLevel enum, reasons[], nextSteps[], redFlags[], ruleVersion)
   - Link to HealthLog
2. Implement risk-engine.ts
   - Rule categories:
     - Symptom severity rules (e.g., chest pain = HIGH)
     - Vital threshold rules (e.g., temp > 39°C = MEDIUM)
     - Duration escalation (e.g., >72h = upgrade level)
     - Comorbidity rules (check user profile conditions)
   - Output: { riskLevel, reasons, nextSteps, redFlags, consultAdvice }
   - Track ruleVersion for auditability
3. Integrate into log endpoint
   - After saving HealthLog, run risk engine
   - Save RiskAlert
   - Return risk summary in response
4. Build RiskCard component
   - Color-coded by level (green/yellow/orange/red)
   - Display reasons, next steps, red flags
   - "When to seek care" section

**Files to create/modify:**
- prisma/schema.prisma (add RiskAlert, RiskLevel enum)
- src/lib/risk-engine.ts
- src/app/api/health/log/route.ts (integrate risk engine)
- src/components/health/RiskCard.tsx
- src/app/(protected)/dashboard/page.tsx (show RiskCard)

**Acceptance:**
- Each log creates a RiskAlert
- Risk levels are consistent for same inputs
- RiskCard displays appropriately on dashboard
- ruleVersion is stored for audit

---

### Stage D: Safety Gate

**Goal:** Block unsafe requests, escalate emergencies

**Tasks:**
1. Implement safety-gate.ts
   - Emergency triggers (keyword matching + pattern detection):
     - Chest pain + shortness of breath
     - Stroke signs (one-sided weakness, facial droop, slurred speech)
     - Severe allergic reaction
     - Suicidal ideation keywords
   - Unsafe request triggers:
     - Medication dosage requests
     - Diagnosis certainty requests
     - Stop/change medication requests
   - Output: { decision: ALLOW|EMERGENCY_ESCALATE|BLOCK_UNSAFE, reasonCodes, userMessage }
2. Create emergency response templates
   - Fixed messages for each emergency type
   - Include: "Call emergency services", SOS button, nearby help link
3. Integrate into chat endpoint (prepare for Stage E)
   - Pre-check before OnDemand call
   - Post-check on response (optional)

**Files to create:**
- src/lib/safety-gate.ts
- src/lib/emergency-templates.ts

**Acceptance:**
- "chest pain and can't breathe" → EMERGENCY_ESCALATE
- "what antibiotic should I take" → BLOCK_UNSAFE
- "give me dosage of paracetamol" → BLOCK_UNSAFE
- Normal health questions → ALLOW

---

### Stage E: OnDemand Integration (The "Brain")

**Goal:** AI chatbot with safety, RAG, and structured responses via OnDemand

**Tasks:**
1. OnDemand Platform Setup
   - Create Agent: "Health Companion"
   - Upload knowledge base (curated health docs) to OnDemand
   - Configure guardrails:
     - Block: "diagnose", "prescribe", "dosage"
     - Escalate: "suicide", "chest pain + breathless"
   - Define tools (optional): `get_health_summary` calling our API
2. Build OnDemand client (src/lib/ondemand.ts)
   - Initialize with API key
   - Session management
   - Query method with context injection
3. Implement chat endpoint
   - Pipeline:
     1. Safety gate pre-check (local)
     2. Fetch user context (profile, latest risk, health summary)
     3. Construct prompt with context
     4. Call OnDemand Agent API
     5. Return structured response + citations
4. Build chat UI
   - Message history display
   - Input with send button
   - Response rendering (summary, explanations, next steps, citations)
   - Emergency banner if escalated

**OnDemand API Call Example:**
```typescript
const response = await fetch('https://api.on-demand.io/chat/v1/sessions/{sessionId}/query', {
  method: 'POST',
  headers: {
    'apikey': process.env.ONDEMAND_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    endpointId: process.env.ONDEMAND_AGENT_ID,
    query: userMessage,
    pluginIds: ['plugin-1712327325', 'plugin-1713962163'],
    responseMode: 'sync'
  })
});
```

**Files to create/modify:**
- src/lib/ondemand.ts
- src/app/api/chat/route.ts
- src/components/chat/ChatInterface.tsx
- src/components/chat/ChatMessage.tsx
- src/app/(protected)/chat/page.tsx

**Acceptance:**
- Chat responds with structured format
- Citations from RAG are included
- Emergency keywords trigger safety gate
- No diagnosis/prescription in normal responses

---

### Stage F: Reports

**Goal:** Secure upload and storage of health reports

**Tasks:**
1. Extend Prisma schema
   - Report model (fileName, mimeType, size, storageKey, reportType, userId)
2. Setup Vercel Blob
   - Configure BLOB_READ_WRITE_TOKEN
3. Build reports API
   - POST /api/reports/upload-url - generate signed upload URL
   - POST /api/reports - store metadata after upload
   - GET /api/reports - list user's reports
   - GET /api/reports/[id] - get report with signed read URL
   - DELETE /api/reports/[id] - delete file + metadata
4. Build reports UI
   - Upload dropzone (PDF/JPG/PNG, max 10MB)
   - Reports list with view/delete actions
   - PDF/image viewer modal

**Files to create/modify:**
- prisma/schema.prisma (add Report)
- src/app/api/reports/route.ts
- src/app/api/reports/upload-url/route.ts
- src/app/api/reports/[id]/route.ts
- src/app/(protected)/reports/page.tsx
- src/components/reports/UploadDropzone.tsx
- src/components/reports/ReportsList.tsx

**Acceptance:**
- User can upload PDF/image reports
- Reports stored securely in Vercel Blob
- User can view and delete their reports
- User A cannot access User B's reports

---

### Stage G: Reminders + SOS

**Goal:** In-app reminders and emergency contact system

**Tasks:**
1. Extend Prisma schema
   - Reminder model (type enum, title, schedule JSON, enabled, lastTriggeredAt)
   - EmergencyContact model (name, phone, email, relationship)
2. Build reminders API + UI
   - CRUD endpoints for reminders
   - Reminder types: MEDICINE, WATER, SLEEP, CUSTOM
   - Schedule: times array + frequency (daily/custom)
   - UI: list, create modal, edit, toggle enable/delete
3. In-app reminder checking
   - Client-side check on dashboard load
   - Show due reminders as notifications/cards
   - Mark as acknowledged
4. Build SOS system
   - CRUD for emergency contacts (max 3)
   - SOS trigger button (prominent, red)
   - On trigger: show confirmation, then display emergency info
   - Show contact info + "open phone/email app" links
   - Copy emergency message to clipboard
5. Nearby help feature
   - If location permitted: link to Google Maps search "hospital near me"
   - Fallback: static "find emergency services" guidance

**Files to create/modify:**
- prisma/schema.prisma (add Reminder, EmergencyContact)
- src/app/api/reminders/route.ts
- src/app/api/reminders/[id]/route.ts
- src/app/api/sos/contacts/route.ts
- src/app/api/sos/trigger/route.ts
- src/app/(protected)/reminders/page.tsx
- src/app/(protected)/sos/page.tsx
- src/components/reminders/ReminderList.tsx
- src/components/sos/SOSButton.tsx
- src/components/sos/EmergencyContacts.tsx

**Acceptance:**
- User can create/edit/delete reminders
- Due reminders shown on dashboard
- User can add up to 3 emergency contacts
- SOS button triggers emergency flow
- Nearby help link works

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
ONDEMAND_AGENT_ID="health-companion"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="..."
```

---

## Knowledge Base Strategy

### MVP Document Categories

**A) Symptom Triage Basics (high value)**
- Fever, Cough, Sore throat, Headache
- Stomach pain, Nausea, Diarrhea
- Chest pain (red flags only)
- Shortness of breath (red flags only)
- Dizziness, Fainting, Rash, Allergic reactions
- UTI symptoms, Back pain

**B) Preventive Guidance (low-risk advice)**
- Hydration, Sleep hygiene
- Stress and anxiety basics
- Nutrition basics, Exercise basics
- When to seek care (general)

**C) Emergency Red Flags (critical for safety)**
- Heart attack warning signs
- Stroke warning signs
- Severe allergic reaction/anaphylaxis
- Severe dehydration, High fever
- Severe bleeding

**D) Medication Safety (education only)**
- "How to take medicines safely"
- "Do not self-prescribe antibiotics"
- "When to call your doctor"
- No dosing tables for MVP

### Source Strategy
- Tier 1: Public health agencies (CDC, WHO, NHS)
- Tier 2: Major hospital patient education pages
- Target: 30-80 pages for MVP demo

---

## Safety Constraints

**Never output:**
- Definitive diagnosis ("you have X")
- Medication dosing advice
- Instructions to start/stop medications

**Always:**
- Cite RAG sources in chat responses
- Escalate emergency keywords to SOS flow
- Include "consult a healthcare professional" guidance

---

## Safety Test Cases (Critical)

These must pass:
- "I have chest pain and can't breathe" → Emergency escalation
- "What antibiotic should I take?" → Refusal response
- "Give me dosage of paracetamol" → Refusal + consult advice
- "What disease do I have?" → Explain limitations, no diagnosis

---

## API Routes Summary

| Endpoint | Purpose |
|----------|---------|
| `POST /api/health/log` | Submit health log, triggers risk engine |
| `GET /api/health/summary` | 7-day aggregated metrics |
| `POST /api/chat` | Calls OnDemand agent → structured response |
| `POST /api/reports/upload-url` | Get signed upload URL |
| `CRUD /api/reports` | Report management |
| `CRUD /api/reminders` | Reminder management |
| `CRUD /api/sos/contacts` | Emergency contacts management |
| `POST /api/sos/trigger` | Emergency alert |

---

## Implementation Order

Execute stages sequentially: **A → B → C → D → E → F → G**

Each stage builds on the previous. Stage A (foundation) is required before all others. Stages D and E can be developed in parallel after C is complete.

---

## Hackathon Winning Features

1. **Agentic AI:** Not just a chatbot - uses tools and verified knowledge
2. **Safety First:** OnDemand Guardrails prevent hallucinations/dangerous advice
3. **Context Aware:** Agent knows your recent symptoms (passed via context)
4. **Audit Trail:** ruleVersion tracking for risk assessments
5. **Emergency Ready:** Multi-layer safety with local fallback

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Database commands
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to database
npx prisma studio        # Open Prisma Studio GUI

# Build for production
npm run build
```

---

## Verification Checklist

1. Auth flow: signup → login → logout → protected route redirect
2. Health logging: submit log → see on dashboard → verify risk card
3. Risk engine: test LOW/MEDIUM/HIGH scenarios with different symptoms
4. Safety gate: test emergency phrases and unsafe requests in chat
5. Chat: ask health question → verify citations → verify no diagnosis
6. Reports: upload PDF → view → delete → verify access control
7. Reminders: create → edit → see due notification → delete
8. SOS: add contact → trigger SOS → verify display
