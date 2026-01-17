import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ONDEMAND_CHAT_API = "https://api.on-demand.io/chat/v1";
const FULFILLMENT_MODEL = "predefined-openai-gpt4.1";

// Air Quality Agent
const AIR_QUALITY_AGENT = "agent-1737061205";

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
    agentIds: [AIR_QUALITY_AGENT],
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
    console.error("Air quality session creation error:", error);
    throw new Error("Failed to create air quality session");
  }

  const data = await response.json();
  return data.data?.id || data.id;
}

async function queryAirQuality(
  apiKey: string,
  sessionId: string,
  location: string
): Promise<string> {
  const fulfillmentPrompt = `You are an Air Quality Information specialist. Provide clear, concise air quality data.

When responding about air quality, always structure your response as follows:
1. Current AQI (Air Quality Index) value and category (Good/Moderate/Unhealthy/etc.)
2. Main pollutants and their levels
3. Health recommendations based on current conditions
4. Best time for outdoor activities if applicable

Keep responses brief and actionable. Use simple language.
If you cannot get real-time data for the location, provide general guidance.`;

  const requestBody = {
    query: `What is the current air quality in ${location}? Provide AQI, pollutants, and health advice.`,
    endpointId: FULFILLMENT_MODEL,
    responseMode: "sync",
    agentIds: [AIR_QUALITY_AGENT],
    modelConfigs: {
      fulfillmentPrompt: fulfillmentPrompt,
      temperature: 0.3,
      topP: 0.9,
      maxTokens: 800,
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
    console.error("Air quality query error:", error);
    throw new Error(`Failed to get air quality data: ${error}`);
  }

  const data = await response.json();
  return (
    data.data?.answer ||
    data.answer ||
    "Unable to retrieve air quality information."
  );
}

export async function GET(request: NextRequest) {
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

    // Get location from query params or use default
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location") || "current location";

    // Create session and query
    const chatSessionId = await createSession(apiKey, session.user.id);
    const airQualityData = await queryAirQuality(apiKey, chatSessionId, location);

    return NextResponse.json({
      data: airQualityData,
      location: location,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Air quality API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch air quality data" },
      { status: 500 }
    );
  }
}
