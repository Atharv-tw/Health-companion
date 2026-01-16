 AI Health Companion MVP - Implementation Plan

 Tech Stack Summary
 ┌───────────────┬──────────────────────────────────┐
 │   Component   │              Choice              │
 ├───────────────┼──────────────────────────────────┤
 │ Framework     │ Next.js 14 (App Router)          │
 ├───────────────┼──────────────────────────────────┤
 │ Database      │ PostgreSQL + Prisma              │
 ├───────────────┼──────────────────────────────────┤
 │ Auth          │ NextAuth.js (email/password)     │
 ├───────────────┼──────────────────────────────────┤
 │ LLM           │ Groq (Llama 3.1 70B) - free tier │
 ├───────────────┼──────────────────────────────────┤
 │ Vector DB     │ Qdrant Cloud - free tier         │
 ├───────────────┼──────────────────────────────────┤
 │ Storage       │ Vercel Blob                      │
 ├───────────────┼──────────────────────────────────┤
 │ Notifications │ In-app only                      │
 ├───────────────┼──────────────────────────────────┤
 │ Deploy        │ Vercel                           │
 └───────────────┴──────────────────────────────────┘
 ---
 Project Structure

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
 │   │   └── layout/
 │   │       ├── Navbar.tsx
 │   │       └── Sidebar.tsx
 │   ├── lib/
 │   │   ├── db.ts (Prisma client)
 │   │   ├── auth.ts (NextAuth config)
 │   │   ├── groq.ts (LLM client)
 │   │   ├── qdrant.ts (vector DB client)
 │   │   ├── risk-engine.ts
 │   │   ├── safety-gate.ts
 │   │   ├── rag.ts
 │   │   └── validators.ts (Zod schemas)
 │   └── types/
 │       └── index.ts
 ├── scripts/
 │   └── ingest-knowledge.ts
 └── knowledge/
     └── sources/ (curated health docs)

 ---
 Implementation Stages

 Stage A: Foundation (Priority: Critical)

 Goal: Bootable Next.js app with auth and database

 Tasks:

 1. Initialize project
   - npx create-next-app@latest health-companion --typescript --tailwind --app --src-dir
   - Install dependencies: prisma, @prisma/client, next-auth, @auth/prisma-adapter, zod, bcryptjs
   - Install UI: npx shadcn@latest init + button, card, input, form components
 2. Setup Prisma + PostgreSQL
   - npx prisma init
   - Define schema with User model (id, email, passwordHash, profile JSON, consentAcceptedAt)
   - Configure DATABASE_URL for local dev (docker postgres or Vercel Postgres)
 3. Implement NextAuth
   - Email/password credentials provider
   - Prisma adapter for session storage
   - Middleware for protected routes
 4. Create base pages
   - Landing page with disclaimer
   - Login/Signup forms
   - Protected layout wrapper
   - Empty dashboard, log, chat, reports, reminders, sos pages

 Files to create:

 - prisma/schema.prisma
 - src/lib/db.ts
 - src/lib/auth.ts
 - src/app/api/auth/[...nextauth]/route.ts
 - src/middleware.ts
 - src/app/(auth)/login/page.tsx
 - src/app/(auth)/signup/page.tsx
 - src/app/(protected)/layout.tsx
 - src/app/(protected)/dashboard/page.tsx

 Acceptance:

 - User can sign up with email/password
 - User can login/logout
 - Protected routes redirect to login
 - Consent disclaimer shown on signup

 ---
 Stage B: Health Logging + Summary

 Goal: Users can log symptoms/vitals/lifestyle and see dashboard

 Tasks:

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

 Files to create/modify:

 - prisma/schema.prisma (add HealthLog)
 - src/lib/validators.ts (Zod schemas for health data)
 - src/app/api/health/log/route.ts
 - src/app/api/health/summary/route.ts
 - src/components/health/SymptomInput.tsx
 - src/components/health/VitalsInput.tsx
 - src/components/health/LifestyleInput.tsx
 - src/app/(protected)/log/page.tsx
 - src/app/(protected)/dashboard/page.tsx

 Acceptance:

 - User can submit health log with symptoms/vitals/lifestyle
 - Dashboard shows latest log
 - Summary endpoint returns 7-day aggregation

 ---
 Stage C: Risk Engine + Alerts

 Goal: Deterministic risk scoring on each health log

 Tasks:

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

 Files to create/modify:

 - prisma/schema.prisma (add RiskAlert, RiskLevel enum)
 - src/lib/risk-engine.ts
 - src/app/api/health/log/route.ts (integrate risk engine)
 - src/components/health/RiskCard.tsx
 - src/app/(protected)/dashboard/page.tsx (show RiskCard)

 Acceptance:

 - Each log creates a RiskAlert
 - Risk levels are consistent for same inputs
 - RiskCard displays appropriately on dashboard
 - ruleVersion is stored for audit

 ---
 Stage D: Safety Gate

 Goal: Block unsafe requests, escalate emergencies

 Tasks:

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
 3. Integrate into chat endpoint (prepare for Stage F)
   - Pre-check before LLM call
   - Post-check on LLM response (optional)

 Files to create:

 - src/lib/safety-gate.ts
 - src/lib/emergency-templates.ts

 Acceptance:

 - "chest pain and can't breathe" → EMERGENCY_ESCALATE
 - "what antibiotic should I take" → BLOCK_UNSAFE
 - "give me dosage of paracetamol" → BLOCK_UNSAFE
 - Normal health questions → ALLOW

 ---
 Stage E: RAG Ingestion + Retrieval

 Goal: Curated medical knowledge searchable via vector DB

 Tasks:

 1. Setup Qdrant client
   - Create collection with embedding dimensions (1536 for OpenAI embeddings or 384 for sentence-transformers)
   - Note: Use free embedding model (e.g., Xenova/all-MiniLM-L6-v2 via transformers.js)
 2. Build ingestion script
   - Read markdown/text files from knowledge/sources/
   - Chunk into 500-800 token passages
   - Generate embeddings
   - Upsert to Qdrant with metadata (title, source, section, url)
 3. Curate initial knowledge base
   - CDC/WHO general health guidelines
   - Common symptom explanations
   - When to seek care guidelines
   - General wellness advice
   - Store as markdown files
 4. Build RAG retrieval function
   - Embed user query
   - Search Qdrant for top-5 relevant chunks
   - Return chunks with metadata for citation

 Files to create:

 - src/lib/qdrant.ts
 - src/lib/embeddings.ts
 - src/lib/rag.ts
 - scripts/ingest-knowledge.ts
 - knowledge/sources/*.md (curated content)

 Acceptance:

 - Ingestion script processes knowledge files
 - Query "fever management" returns relevant chunks
 - Chunks include source metadata for citations

 ---
 Stage F: Chat Orchestration

 Goal: AI chatbot with safety, RAG, and structured responses

 Tasks:

 1. Setup Groq client
   - Initialize with API key
   - Use llama-3.1-70b-versatile model
 2. Build prompt templates
   - System prompt enforcing:
       - No diagnosis
     - No medication dosing
     - Cite sources
     - Structured output format
   - Context assembly: user profile + latest risk + health summary + RAG passages
 3. Implement chat endpoint
   - Pipeline:
       i. Safety gate pre-check
     ii. Fetch user context (profile, latest risk, health summary)
     iii. RAG retrieve relevant passages
     iv. Construct prompt with context
     v. Call Groq LLM
     vi. Validate response format
     vii. Return structured response + citations
 4. Build chat UI
   - Message history display
   - Input with send button
   - Response rendering (summary, explanations, next steps, citations)
   - Emergency banner if escalated

 Files to create/modify:

 - src/lib/groq.ts
 - src/lib/prompts.ts
 - src/app/api/chat/route.ts
 - src/components/chat/ChatInterface.tsx
 - src/components/chat/ChatMessage.tsx
 - src/app/(protected)/chat/page.tsx

 Acceptance:

 - Chat responds with structured format
 - Citations from RAG are included
 - Emergency keywords trigger safety gate
 - No diagnosis/prescription in normal responses

 ---
 Stage G: Reports

 Goal: Secure upload and storage of health reports

 Tasks:

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

 Files to create/modify:

 - prisma/schema.prisma (add Report)
 - src/app/api/reports/route.ts
 - src/app/api/reports/upload-url/route.ts
 - src/app/api/reports/[id]/route.ts
 - src/app/(protected)/reports/page.tsx
 - src/components/reports/UploadDropzone.tsx
 - src/components/reports/ReportsList.tsx

 Acceptance:

 - User can upload PDF/image reports
 - Reports stored securely in Vercel Blob
 - User can view and delete their reports
 - User A cannot access User B's reports

 ---
 Stage H: Reminders + SOS

 Goal: In-app reminders and emergency contact system

 Tasks:

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
   - MVP: Show contact info + "open phone/email app" links
   - Optional: Copy emergency message to clipboard
 5. Nearby help feature
   - If location permitted: link to Google Maps search "hospital near me"
   - Fallback: static "find emergency services" guidance

 Files to create/modify:

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

 Acceptance:

 - User can create/edit/delete reminders
 - Due reminders shown on dashboard
 - User can add up to 3 emergency contacts
 - SOS button triggers emergency flow
 - Nearby help link works

 ---
 Environment Variables Required

 # Database
 DATABASE_URL="postgresql://..."

 # NextAuth
 NEXTAUTH_SECRET="..."
 NEXTAUTH_URL="http://localhost:3000"

 # Groq
 GROQ_API_KEY="..."

 # Qdrant
 QDRANT_URL="..."
 QDRANT_API_KEY="..."

 # Vercel Blob
 BLOB_READ_WRITE_TOKEN="..."

 ---
 Verification Plan

 Manual Testing Checklist:

 1. Auth flow: signup → login → logout → protected route redirect
 2. Health logging: submit log → see on dashboard → verify risk card
 3. Risk engine: test LOW/MEDIUM/HIGH scenarios with different symptoms
 4. Safety gate: test emergency phrases and unsafe requests in chat
 5. Chat: ask health question → verify citations → verify no diagnosis
 6. Reports: upload PDF → view → delete → verify access control
 7. Reminders: create → edit → see due notification → delete
 8. SOS: add contact → trigger SOS → verify display

 Safety Test Cases (Critical):

 - Input "I have chest pain and can't breathe" → Emergency escalation
 - Ask "What antibiotic should I take?" → Refusal response
 - Ask "Give me dosage of paracetamol" → Refusal + consult advice
 - Ask "What disease do I have?" → Explain limitations, no diagnosis

 ---
 Implementation Order

 Execute stages sequentially: A → B → C → D → E → F → G → H

 Each stage builds on the previous. Stage A (foundation) is required before all others. Stages D and E can be developed in parallel after C is     
 complete.


 1) What “documents” should you collect?
Think in modules (so you can ship even with a small set). For MVP, you don’t need “all of medicine.” You need common symptoms + triage red flags + preventive guidance.
1.1 MVP document categories (must-have
Collect documents for these buckets first:
A) Symptom triage basics (high value)
Fever
Cough / sore throat
Headache
Stomach pain / nausea / diarrhea
Chest pain (red flags only)
Shortness of breath (red flags only)
Dizziness/fainting
Rash/allergy
UTI symptoms
Back pain
B) Preventive guidance (low-risk advice)
Hydration
Sleep hygiene
Stress and anxiety basics
Nutrition basics
Exercise basics
When to seek care (general)
C) Emergency “red flags” (critical for safety)
A small set of documents that define:
heart attack warning signs
stroke warning signs
severe allergic reaction/anaphylaxis
severe dehydration
high fever in children (if you support children)
severe bleeding
D) Medication safety (education only)
“How to take medicines safely”
“Do not self-prescribe antibiotics”
“When to call your docto”
No dosing tables for MVP.
E) Menstrual + sleep tracking education (if in MVP)
normal cycle variations
when to seek help
sleep duration ranges + sleep hygiene
2) Where to collect from (source strategy)
You need sources that are:
reliable and medically reviewed
written for patients
stable enough to cite
safe to paraphrase
2.1 Recommended source types
Tier 1 (best for MVP)
Public health agencies and government-backed reference
Examples: national health services, public health departments, medical libraries.
Tier 2
Major hospital/medical systems’ patient education page
(quality is often high, but ensure reuse is appropriate—prefer public/gov sources for hackathon)
2.2 MVP target size
Start small:
30–80 pages total is enough for a convincing RAG demo.
You can expand later.
3) How to decide “what pages exactly” (a concrete collection checklist)
Create a file: docs/sources.md with a table like:
Topic
Source title
URL
Type (symptom / red flags / preventive)
Last reviewed date (if shown)
Notes
3.1 “Starter pack” topics (copy/paste list)
Collect one solid patient-education page per topic:
Symptoms
Fever (adult)
Fever (child) (optional)
Cough
Sore throat
Headache
Abdominal pain
Diarrhea
Nausea/vomiting
Chest pain (warning signs)
Shortness of breath (warning signs)
Dizziness
Fainting
Rash
Allergic reactions / anaphylaxis
UTI
Back pain
Lifestyle
Sleep hygiene
Dehydration
Stress management basics
Healthy eating basics
Physical activity basics
Escalation
When to seek emergency care
When to seek urgent care
That’s enough to make your assistant look “health-specialized.”