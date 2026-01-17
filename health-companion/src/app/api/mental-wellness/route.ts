import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ONDEMAND_CHAT_API = "https://api.on-demand.io/chat/v1";
const FULFILLMENT_MODEL = "predefined-openai-gpt4.1";

// Agents for mental wellness chat
const MENTAL_WELLNESS_AGENTS = [
  "agent-1712327325",
  "agent-1713962163",
];

// Build the Mental Wellness fulfillment prompt with user health data
function buildMentalWellnessPrompt(
  userName: string,
  healthData: string,
  reportData: string
): string {
  return `You are ${userName}'s Mental Wellness specialist. You provide stress management and emotional support based on their health data.

USER'S HEALTH DATA:
${healthData || "No recent health logs available."}

USER'S MEDICAL REPORTS:
${reportData || "No reports uploaded yet."}

RULES:
- Offer stress management techniques and coping strategies based on their health patterns
- Provide relaxation and mindfulness exercises
- Give sleep hygiene tips especially if their sleep data shows issues
- Be empathetic and supportive in tone
- Consider their stress levels and lifestyle factors from health logs
- Suggest breathing exercises and grounding techniques
- Provide journaling prompts for emotional processing
- Offer tips for work-life balance
- NEVER provide therapy or psychiatric treatment
- NEVER diagnose mental health conditions
- NEVER recommend specific medications for mental health
- NEVER minimize serious mental health concerns

RESPONSE STYLE:
- Be warm, empathetic, and non-judgmental
- Reference their specific health data when relevant (sleep, stress levels)
- Use calming and supportive language
- Provide actionable, practical techniques
- Include step-by-step instructions for exercises
- If their data shows high stress or poor sleep, acknowledge and address it

CRITICAL: If user mentions suicide, self-harm, or severe mental health crisis:
1. Express genuine concern
2. Provide crisis helpline numbers (988 Suicide & Crisis Lifeline)
3. Encourage immediate professional help
4. Do NOT attempt to counsel through crisis situations

Always recommend consulting a licensed mental health professional for ongoing concerns.`;
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
    agentIds: MENTAL_WELLNESS_AGENTS,
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
    console.error("Mental wellness session creation error:", error);
    throw new Error("Failed to create mental wellness session");
  }

  const data = await response.json();
  return data.data?.id || data.id;
}

async function submitMentalWellnessQuery(
  apiKey: string,
  sessionId: string,
  query: string,
  fulfillmentPrompt: string
): Promise<string> {
  const requestBody = {
    query: query,
    endpointId: FULFILLMENT_MODEL,
    responseMode: "sync",
    agentIds: MENTAL_WELLNESS_AGENTS,
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
    console.error("Mental wellness query error:", error);
    throw new Error(`Failed to get mental wellness response: ${error}`);
  }

  const data = await response.json();
  return (
    data.data?.answer ||
    data.answer ||
    "I couldn't generate a response. Please try again."
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

    // Format health logs data - focus on mental wellness relevant data
    let healthData = "";
    if (healthLogs.length > 0) {
      healthData = healthLogs.map((log, index) => {
        const symptoms = log.symptoms as { name: string; severity: string }[] | null;
        const lifestyle = log.lifestyle as { sleep?: number; water?: number; exercise?: number; stress?: string } | null;
        const risk = log.riskAlert;

        let entry = `Entry ${index + 1} (${log.createdAt.toLocaleDateString()}):\n`;

        if (symptoms && symptoms.length > 0) {
          // Focus on mental health related symptoms
          const mentalSymptoms = symptoms.filter(s =>
            ['anxiety', 'stress', 'fatigue', 'insomnia', 'headache', 'mood', 'irritability', 'depression'].some(
              term => s.name.toLowerCase().includes(term)
            )
          );
          if (mentalSymptoms.length > 0) {
            entry += `  Mental Health Symptoms: ${mentalSymptoms.map(s => `${s.name} (${s.severity})`).join(", ")}\n`;
          }
          if (symptoms.length > mentalSymptoms.length) {
            entry += `  Other Symptoms: ${symptoms.filter(s => !mentalSymptoms.includes(s)).map(s => `${s.name} (${s.severity})`).join(", ")}\n`;
          }
        }

        if (lifestyle) {
          const parts = [];
          if (lifestyle.sleep) parts.push(`Sleep: ${lifestyle.sleep}hrs`);
          if (lifestyle.stress) parts.push(`Stress Level: ${lifestyle.stress}`);
          if (lifestyle.exercise) parts.push(`Exercise: ${lifestyle.exercise}mins`);
          if (lifestyle.water) parts.push(`Hydration: ${lifestyle.water} glasses`);
          if (parts.length > 0) {
            entry += `  Lifestyle: ${parts.join(", ")}\n`;
          }
        }

        if (risk) {
          entry += `  Overall Risk Level: ${risk.riskLevel}\n`;
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
    const fulfillmentPrompt = buildMentalWellnessPrompt(
      user?.name || "User",
      healthData,
      reportData
    );

    // Submit mental wellness query with full context
    const response = await submitMentalWellnessQuery(
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
    console.error("Mental wellness API error:", error);
    return NextResponse.json(
      { error: "Failed to process mental wellness request" },
      { status: 500 }
    );
  }
}
