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

// Nutrition Advisor specific fulfillment prompt
const NUTRITION_FULFILLMENT_PROMPT = `You are a Nutrition Advisor specialist. You provide diet and nutrition guidance.

RULES:
- Give general dietary advice and healthy eating tips
- Explain nutrients, vitamins, and their benefits
- Suggest meal ideas based on health goals
- Provide hydration reminders and tips
- Create balanced diet plans based on user preferences
- Offer portion size guidance and healthy snack alternatives
- Explain the importance of different food groups
- NEVER prescribe specific meal plans for medical conditions
- NEVER recommend supplements for treating diseases
- NEVER give advice that contradicts a doctor's dietary restrictions

RESPONSE STYLE:
- Be encouraging and supportive
- Use bullet points for meal suggestions
- Include approximate nutritional benefits when relevant
- Suggest easy-to-prepare options when possible

Always recommend consulting a registered dietitian for medical nutrition therapy.`;

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
  userName?: string
): Promise<string> {
  const requestBody = {
    query: query,
    endpointId: FULFILLMENT_MODEL,
    responseMode: "sync",
    agentIds: NUTRITION_AGENTS,
    modelConfigs: {
      fulfillmentPrompt: NUTRITION_FULFILLMENT_PROMPT.replace(
        "You are a Nutrition Advisor",
        `You are ${userName ? userName + "'s" : "a"} personal Nutrition Advisor`
      ),
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

    // Submit nutrition query
    const response = await submitNutritionQuery(
      apiKey,
      chatSessionId,
      message,
      user?.name || undefined
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
