import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ONDEMAND_CHAT_API = "https://api.on-demand.io/chat/v1";
const FULFILLMENT_MODEL = "predefined-openai-gpt4.1";

// Herbi Cure Ayurveda Agent
const HERBI_CURE_AGENT = "agent-1717418141";

// Build the Herbi Cure fulfillment prompt with user health data
function buildHerbiCurePrompt(
  userName: string,
  healthData: string,
  reportData: string
): string {
  return `You are ${userName}'s Ayurveda Companion - Herbi Cure. You provide traditional Ayurvedic wellness guidance based on their health data.

USER'S HEALTH DATA:
${healthData || "No recent health logs available."}

USER'S MEDICAL REPORTS:
${reportData || "No reports uploaded yet."}

RULES:
- Provide Ayurvedic lifestyle and dietary recommendations
- Suggest traditional herbs and natural remedies for common ailments
- Explain Ayurvedic concepts (doshas, prakruti, etc.) in simple terms
- Recommend yoga and pranayama practices suitable for their condition
- Suggest Ayurvedic daily routines (dinacharya) and seasonal routines (ritucharya)
- Consider their symptoms and health patterns when giving advice
- Offer herbal tea and home remedy suggestions
- Explain the Ayurvedic perspective on their symptoms
- NEVER replace modern medical treatment
- NEVER diagnose diseases or prescribe medications
- NEVER recommend stopping any prescribed medications
- NEVER suggest herbs that may interact with common medications without warning

RESPONSE STYLE:
- Be warm and holistic in your approach
- Reference their specific health data when relevant
- Use traditional Ayurvedic terminology with clear explanations
- Provide practical, easy-to-follow suggestions
- Include Sanskrit terms with translations where appropriate
- Balance ancient wisdom with practical modern application

SAFETY:
- Always recommend consulting both Ayurvedic practitioners and modern doctors
- Warn about potential herb-drug interactions
- Note pregnancy/nursing contraindications for any herbs mentioned
- If symptoms are severe, always recommend professional medical care first

WHEN TO SEE A DOCTOR IMMEDIATELY (Ayurveda cannot address these):
- High fever (above 103°F/39.4°C)
- Severe pain (chest, abdomen, head)
- Difficulty breathing or shortness of breath
- Signs of infection (spreading redness, pus, high fever)
- Symptoms lasting more than 7 days without improvement
- Blood in stool, urine, vomit, or cough
- Sudden weakness, numbness, or confusion
- Severe allergic reactions
- Any emergency symptoms
- Chronic conditions requiring medical management (diabetes, heart disease, etc.)

MANDATORY: Always recommend seeing a medical doctor for any serious health concern. Ayurveda is complementary - it does NOT replace modern medicine. End every response about health issues with a reminder to consult a healthcare professional. This is non-negotiable.

Remember: Ayurveda complements modern medicine; it does not replace it.`;
}

interface ContextMetadata {
  key: string;
  value: string;
}

async function createSession(
  apiKey: string,
  externalUserId: string,
  contextMetadata: ContextMetadata[] = []
): Promise<string> {
  const body: Record<string, unknown> = {
    externalUserId: externalUserId,
    agentIds: [HERBI_CURE_AGENT],
  };

  if (contextMetadata.length > 0) {
    body.contextMetadata = contextMetadata;
  }

  const response = await fetch(`${ONDEMAND_CHAT_API}/sessions`, {
    method: "POST",
    headers: {
      apikey: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Herbi Cure session creation error:", error);
    throw new Error("Failed to create Herbi Cure session");
  }

  const data = await response.json();
  return data.data?.id || data.id;
}

async function submitHerbiCureQuery(
  apiKey: string,
  sessionId: string,
  query: string,
  fulfillmentPrompt: string
): Promise<string> {
  const requestBody = {
    query: query,
    endpointId: FULFILLMENT_MODEL,
    responseMode: "sync",
    agentIds: [HERBI_CURE_AGENT],
    modelConfigs: {
      fulfillmentPrompt: fulfillmentPrompt,
      temperature: 0.4,
      topP: 0.9,
      maxTokens: 1500,
      presencePenalty: 0,
      frequencyPenalty: 0,
    },
  };

  const response = await fetch(
    `${ONDEMAND_CHAT_API}/sessions/${sessionId}/query`,
    {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Herbi Cure query error:", error);
    throw new Error(`Failed to get Herbi Cure response: ${error}`);
  }

  const data = await response.json();
  return (
    data.data?.answer ||
    data.answer ||
    "I couldn't generate an Ayurvedic response. Please try again."
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.ONDEMAND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const { message, sessionId: existingSessionId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get user profile for personalization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, profile: true },
    });

    // Fetch recent health logs (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const healthLogs = await prisma.healthLog.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        RiskAlert: true,
      },
    });

    // Fetch user's reports with extracted text
    const reports = await prisma.report.findMany({
      where: {
        userId: session.user.id,
        extractedText: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        fileName: true,
        extractedText: true,
        createdAt: true,
      },
    });

    // Format health logs data
    let healthData = "";
    if (healthLogs.length > 0) {
      healthData = healthLogs.map((log, index) => {
        const symptoms = log.symptoms as { name: string; severity: string }[] | null;
        const vitals = log.vitals as { type: string; value: number; unit: string }[] | null;
        const lifestyle = log.lifestyle as { sleep?: number; water?: number; exercise?: number; stress?: string } | null;
        const risk = log.RiskAlert;

        let entry = `Entry ${index + 1} (${log.createdAt.toLocaleDateString()}):\n`;

        if (symptoms && symptoms.length > 0) {
          entry += `  Symptoms: ${symptoms.map(s => `${s.name} (${s.severity})`).join(", ")}\n`;
        }

        if (vitals && vitals.length > 0) {
          entry += `  Vitals: ${vitals.map(v => `${v.type}: ${v.value}${v.unit}`).join(", ")}\n`;
        }

        if (lifestyle) {
          const parts = [];
          if (lifestyle.sleep) parts.push(`Sleep: ${lifestyle.sleep}hrs`);
          if (lifestyle.water) parts.push(`Water: ${lifestyle.water} glasses`);
          if (lifestyle.exercise) parts.push(`Exercise: ${lifestyle.exercise}mins`);
          if (lifestyle.stress) parts.push(`Stress: ${lifestyle.stress}`);
          if (parts.length > 0) {
            entry += `  Lifestyle: ${parts.join(", ")}\n`;
          }
        }

        if (risk) {
          entry += `  Risk Level: ${risk.riskLevel}\n`;
        }

        return entry;
      }).join("\n");
    }

    // Format reports data
    let reportData = "";
    if (reports.length > 0) {
      reportData = reports.map((report, index) => {
        const text = report.extractedText?.substring(0, 1500) || "";
        return `Report ${index + 1}: ${report.fileName} (${report.createdAt.toLocaleDateString()})\n${text}${text.length >= 1500 ? "..." : ""}`;
      }).join("\n\n");
    }

    // Build context metadata
    const contextMetadata: ContextMetadata[] = [
      { key: "userId", value: session.user.id },
    ];

    if (user?.name) {
      contextMetadata.push({ key: "userName", value: user.name });
    }

    // Create session or use existing
    const chatSessionId =
      existingSessionId || (await createSession(apiKey, session.user.id, contextMetadata));

    // Build personalized prompt with health data
    const fulfillmentPrompt = buildHerbiCurePrompt(
      user?.name || "User",
      healthData,
      reportData
    );

    // Submit query with full context
    const response = await submitHerbiCureQuery(
      apiKey,
      chatSessionId,
      message,
      fulfillmentPrompt
    );

    return NextResponse.json({
      response,
      sessionId: chatSessionId,
    });
  } catch (error) {
    console.error("Herbi Cure API error:", error);
    return NextResponse.json(
      { error: "Failed to process Ayurveda request" },
      { status: 500 }
    );
  }
}
