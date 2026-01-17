import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ONDEMAND_CHAT_API = "https://api.on-demand.io/chat/v1";
const FULFILLMENT_MODEL = "predefined-openai-gpt4.1";

// Agents for nutrition chat
const NUTRITION_AGENTS = [
  "agent-1712327325",
  "agent-1713962163",
];

// Build the Nutrition Advisor fulfillment prompt with user health data
function buildNutritionPrompt(
  userName: string,
  healthData: string,
  reportData: string
): string {
  return `You are ${userName}'s personal Nutrition Advisor specialist. You provide personalized diet and nutrition guidance based on their health data.

USER'S HEALTH DATA:
${healthData || "No recent health logs available."}

USER'S MEDICAL REPORTS:
${reportData || "No reports uploaded yet."}

RULES:
- Give personalized dietary advice based on the user's health data above
- Consider their symptoms, vitals, and lifestyle when making recommendations
- If they have specific conditions in their reports, tailor nutrition advice accordingly
- Explain nutrients, vitamins, and their benefits
- Suggest meal ideas based on their health goals and current health status
- Provide hydration reminders and tips
- Create balanced diet plans based on user preferences and health needs
- Offer portion size guidance and healthy snack alternatives
- Explain the importance of different food groups
- NEVER prescribe specific meal plans for medical conditions without recommending professional consultation
- NEVER recommend supplements for treating diseases
- NEVER give advice that contradicts a doctor's dietary restrictions
- If reports show specific values (blood sugar, cholesterol, etc.), consider them in your advice

RESPONSE STYLE:
- Be encouraging and supportive
- Reference their specific health data when relevant
- Use bullet points for meal suggestions
- Include approximate nutritional benefits when relevant
- Suggest easy-to-prepare options when possible
- If their health data suggests concerns, address them with appropriate dietary guidance

Always recommend consulting a registered dietitian for medical nutrition therapy.`;
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
    agentIds: NUTRITION_AGENTS,
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
    console.error("Nutrition session creation error:", error);
    throw new Error("Failed to create nutrition session");
  }

  const data = await response.json();
  return data.data?.id || data.id;
}

async function submitNutritionQuery(
  apiKey: string,
  sessionId: string,
  query: string,
  fulfillmentPrompt: string
): Promise<string> {
  const requestBody = {
    query: query,
    endpointId: FULFILLMENT_MODEL,
    responseMode: "sync",
    agentIds: NUTRITION_AGENTS,
    modelConfigs: {
      fulfillmentPrompt: fulfillmentPrompt,
      temperature: 0.3,
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
    console.error("Nutrition query error:", error);
    throw new Error(`Failed to get nutrition response: ${error}`);
  }

  const data = await response.json();
  return (
    data.data?.answer ||
    data.answer ||
    "I couldn't generate a nutrition response."
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
        riskAlert: true,
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
        const risk = log.riskAlert;

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
    const fulfillmentPrompt = buildNutritionPrompt(
      user?.name || "User",
      healthData,
      reportData
    );

    // Submit nutrition query with full context
    const response = await submitNutritionQuery(
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
    console.error("Nutrition API error:", error);
    return NextResponse.json(
      { error: "Failed to process nutrition request" },
      { status: 500 }
    );
  }
}
