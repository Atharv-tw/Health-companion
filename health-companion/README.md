# AI Health Companion

> A context-aware health understanding layer that sits between raw health data and medical professionals.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://health-companion-navy.vercel.app)
[![YouTube](https://img.shields.io/badge/YouTube-Demo-red)](https://youtu.be/XeYYUFI3iCk)

---

## The Problem

Modern healthcare generates a lot of data—but very little understanding.

People track symptoms, receive lab reports, monitor vitals, and experience daily physical or mental changes. Yet this information remains **fragmented, confusing, and hard to act on**. Most users are left guessing what matters, what's normal, and when to seek help.

### Core Problems Today

| Problem | Description |
|---------|-------------|
| **Health data exists, but insight doesn't** | Symptoms, reports, and vitals are scattered across apps, PDFs, and notes. Users don't know what signals are important vs noise. Information overload leads to inaction, anxiety, or wrong assumptions. |
| **Prevention comes too late** | Early warning signs (patterns, recurring symptoms, subtle changes) are ignored. Most tools respond after a problem escalates. There is no intelligent "early-alert" layer for everyday health. |
| **Generic and unsafe AI advice** | Most health chatbots lack user context and history. Answers are broad, misleading, or overly confident. Some tools cross dangerous lines into diagnosis or prescriptions. |
| **Poor handling of sensitive scenarios** | Mental health, stress, panic, or emergency signals are mishandled. No clear escalation path to real-world medical help. Users are left unsupported when stakes are highest. |
| **Medical reports are not human-readable** | Lab reports and prescriptions are written for clinicians. Patients don't understand what is normal, what is concerning, or what actions are safe to take next. |

---

## The Solution

AI Health Companion acts as a **safe, context-aware health understanding layer**, sitting between raw data and medical professionals.

**It does not diagnose or prescribe.**
**It helps users understand, assess risk, and act responsibly.**

### Key Features

- **Understand health data clearly** — Convert lab reports, vitals, and symptoms into plain-language explanations. Highlight what's normal vs what needs attention.

- **Detect early risk patterns** — Identify recurring symptoms or concerning trends over time. Surface early warning signs before they escalate.

- **Personalized, context-aware guidance** — Responses are based on user history, lifestyle, and prior data. Guidance adapts as the user's health profile evolves.

- **Safe AI by design** — Strict boundaries to avoid diagnosis, prescriptions, or dosage advice. Built-in safety checks for mental health and emergency signals. Responsible escalation to human medical help when needed.

- **Make medical reports patient-friendly** — Explain lab values, medical terms, and reports in simple language. Clarify what the report means, what questions to ask a doctor, and what safe next steps look like.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Authentication** | NextAuth.js |
| **AI Engine** | OnDemand AI (GPT-4.1 + RAG) |
| **Safety Layer** | Custom guardrails + emergency detection |
| **Styling** | Tailwind CSS + Framer Motion |
| **Storage** | Vercel Blob |
| **Deployment** | Vercel |

---

## Core Modules

### Multi-Modal AI Chat
Five specialized AI assistants, each with focused expertise:
- **Health Assistant** — General health guidance and symptom understanding
- **Nutrition Advisor** — Diet plans and nutrition recommendations
- **Mental Wellness** — Stress management and emotional support
- **Herbi Cure** — Ayurvedic remedies and traditional wellness
- **Medication Help** — Drug information and interaction checks

### Health Logging
- Track symptoms, vitals, and lifestyle factors
- Automatic risk assessment with deterministic rule engine
- Pattern detection across multiple logs

### Medical Report Analysis
- Upload PDFs, images, or documents
- AI-powered extraction and plain-language explanation
- Highlights concerning values and suggested questions for doctors

### Emergency SOS
- One-tap emergency contact alerts
- Automatic detection of crisis keywords
- Safe escalation to professional help

---

## Safety First

AI Health Companion is built with strict safety boundaries:

| Never Does | Always Does |
|------------|-------------|
| Diagnose diseases | Explain possibilities |
| Prescribe medications | Recommend consulting professionals |
| Suggest dosages | Provide general information |
| Delay emergency care | Escalate emergencies immediately |

---

## Links

- **Live Site**: [health-companion-navy.vercel.app](https://health-companion-navy.vercel.app)
- **Demo Video**: [YouTube](https://youtu.be/XeYYUFI3iCk)

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OnDemand API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Atharv-tw/Health-companion.git
cd Health-companion/health-companion

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
ONDEMAND_API_KEY="your-ondemand-key"
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

---

## Project Structure

```
health-companion/
├── prisma/              # Database schema
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js App Router pages & API
│   ├── components/     # React components (desktop/mobile)
│   ├── lib/            # Core utilities
│   │   ├── ondemand.ts       # AI integration
│   │   ├── risk-engine.ts    # Deterministic risk scoring
│   │   ├── safety-gate.ts    # Input/output safety checks
│   │   └── emergency-templates.ts
│   └── types/          # TypeScript definitions
└── knowledge/          # RAG knowledge sources
```

---

## License

MIT License

---

<p align="center">
  <strong>Built for humans, guided by responsibility.</strong>
</p>
