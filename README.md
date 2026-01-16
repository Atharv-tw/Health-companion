# AI Health Companion

An AI-powered health assistant built for the **OnDemand.io Hackathon**. Log health signals, get risk indicators, chat with specialized AI agents, and access emergency support.

## Features

- **Health Logging** - Track symptoms, vitals, and lifestyle factors
- **Risk Engine** - Deterministic risk scoring (LOW/MEDIUM/HIGH/EMERGENCY)
- **AI Chat** - 7 specialized agents via OnDemand Workflow
- **Report Analysis** - Upload and analyze medical documents
- **Reminders** - Medication, hydration, and sleep reminders
- **SOS Emergency** - Quick access to emergency contacts

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL + Prisma |
| Auth | NextAuth.js |
| AI | OnDemand.io Workflow API |
| Storage | Vercel Blob |
| Styling | Tailwind CSS + shadcn/ui |

## Architecture

```
User → Chat UI → OnDemand Workflow → Orchestrator Agent
                                          ↓
                    ┌─────────────────────┼─────────────────────┐
                    ↓                     ↓                     ↓
              Health Chat          Symptom Analyzer       Risk Interpreter
                    ↓                     ↓                     ↓
             Nutrition Advisor     Mental Wellness       Report Analyzer
```

**7 OnDemand Agents:**
1. **Orchestrator** - Routes queries to specialists
2. **Health Chat** - General health Q&A
3. **Symptom Analyzer** - Symptom assessment
4. **Risk Interpreter** - Explains risk scores
5. **Nutrition Advisor** - Diet guidance
6. **Mental Wellness** - Stress & emotional support
7. **Report Analyzer** - Lab result explanations

**4 Tool Integrations:**
- `GET /api/tools/health-logs` - User's health history
- `GET /api/tools/risk-assessment` - Current risk data
- `GET /api/tools/user-profile` - User profile info
- `POST /api/tools/analyze-report` - Document analysis

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OnDemand.io API key

### Installation

```bash
# Clone the repo
git clone https://github.com/Atharv-tw/Health-companion.git
cd Health-companion/health-companion

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Push database schema
npx prisma db push

# Run development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OnDemand
ONDEMAND_API_KEY="your-api-key"
ONDEMAND_WORKFLOW_ID="your-workflow-id"

# Vercel Blob (optional)
BLOB_READ_WRITE_TOKEN=""
```

## Project Structure

```
health-companion/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, Signup
│   │   ├── (protected)/     # Dashboard, Chat, Reports, etc.
│   │   └── api/
│   │       ├── chat/        # AI chat endpoint
│   │       ├── health/      # Health logging
│   │       ├── tools/       # OnDemand tool endpoints
│   │       ├── reports/     # Report management
│   │       ├── reminders/   # Reminder CRUD
│   │       └── sos/         # Emergency contacts
│   ├── components/
│   │   ├── chat/            # Chat interface
│   │   ├── health/          # Health logging forms
│   │   ├── reports/         # Report upload/list
│   │   ├── reminders/       # Reminder list
│   │   └── sos/             # SOS button, contacts
│   └── lib/
│       ├── ondemand.ts      # OnDemand API client
│       ├── risk-engine.ts   # Risk scoring logic
│       └── safety-gate.ts   # Safety checks
```

## Safety Features

- **Emergency Detection** - Recognizes crisis keywords, urges immediate help
- **Blocked Responses** - Refuses diagnosis, prescriptions, dosage advice
- **Guardrails** - Multi-layer safety (local + OnDemand)
- **Disclaimers** - Always recommends professional consultation

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send message to AI workflow |
| `/api/health/log` | POST | Submit health log |
| `/api/health/summary` | GET | Get 7-day health summary |
| `/api/tools/health-logs` | GET | Tool: Get user's health logs |
| `/api/tools/risk-assessment` | GET | Tool: Get risk data |
| `/api/tools/user-profile` | GET | Tool: Get user profile |
| `/api/tools/analyze-report` | POST | Tool: Analyze document |
| `/api/reports` | GET/POST | Report management |
| `/api/reminders` | GET/POST | Reminder management |
| `/api/sos/contacts` | GET/POST | Emergency contacts |
| `/api/sos/trigger` | POST | Trigger SOS alert |

## OnDemand Integration

This project uses the **OnDemand.io Workflow API** with the Orchestrator pattern:

1. All user queries go to a single workflow endpoint
2. The Orchestrator agent analyzes intent and routes to specialists
3. Specialists can call tool APIs to access user data
4. Responses are combined and returned to the user

## Team

Built for the OnDemand.io Hackathon.

## License

MIT
