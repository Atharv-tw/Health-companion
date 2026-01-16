/**
 * OnDemand API Client
 *
 * Handles communication with OnDemand.io AI Agent API
 * for health-related chat functionality.
 */

const ONDEMAND_API_BASE = "https://api.on-demand.io/chat/v1";

interface OnDemandConfig {
  apiKey: string;
  agentId: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface OnDemandQueryRequest {
  endpointId: string;
  query: string;
  pluginIds?: string[];
  responseMode?: "sync" | "stream";
}

interface OnDemandResponse {
  answer: string;
  citations?: Array<{
    source: string;
    title?: string;
    snippet?: string;
  }>;
  sessionId?: string;
}

interface OnDemandError {
  error: string;
  code?: string;
  details?: string;
}

/**
 * Get OnDemand configuration from environment
 */
function getConfig(): OnDemandConfig {
  const apiKey = process.env.ONDEMAND_API_KEY;
  const agentId = process.env.ONDEMAND_AGENT_ID;

  if (!apiKey) {
    throw new Error("ONDEMAND_API_KEY is not configured");
  }

  return {
    apiKey,
    agentId: agentId || "health-companion",
  };
}

/**
 * Create a new chat session with OnDemand
 */
export async function createSession(): Promise<string> {
  const config = getConfig();

  const response = await fetch(`${ONDEMAND_API_BASE}/sessions`, {
    method: "POST",
    headers: {
      apikey: config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pluginIds: [],
      externalUserId: `health-companion-${Date.now()}`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create session: ${error}`);
  }

  const data = await response.json();
  return data.data?.id || data.sessionId || data.id;
}

/**
 * Send a query to OnDemand and get a response
 */
export async function sendQuery(
  sessionId: string,
  query: string,
  context?: { healthSummary?: string; recentSymptoms?: string[] }
): Promise<OnDemandResponse> {
  const config = getConfig();

  // Build the query with context if available
  let enrichedQuery = query;
  if (context?.healthSummary) {
    enrichedQuery = `[User Health Context: ${context.healthSummary}]\n\nUser Question: ${query}`;
  }

  const requestBody: OnDemandQueryRequest = {
    endpointId: config.agentId,
    query: enrichedQuery,
    pluginIds: ["plugin-1712327325", "plugin-1713962163"], // Medical knowledge plugins
    responseMode: "sync",
  };

  const response = await fetch(
    `${ONDEMAND_API_BASE}/sessions/${sessionId}/query`,
    {
      method: "POST",
      headers: {
        apikey: config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    let errorData: OnDemandError;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { error: errorText };
    }
    throw new Error(errorData.error || "Failed to get response from OnDemand");
  }

  const data = await response.json();

  // Extract the response from OnDemand's response format
  return {
    answer: data.data?.answer || data.answer || data.response || "I couldn't generate a response.",
    citations: data.data?.citations || data.citations || [],
    sessionId: sessionId,
  };
}

/**
 * Send a message and get AI response (simplified interface)
 */
export async function chat(
  sessionId: string | null,
  message: string,
  context?: { healthSummary?: string; recentSymptoms?: string[] }
): Promise<{ response: OnDemandResponse; sessionId: string }> {
  // Create session if not provided
  const activeSessionId = sessionId || (await createSession());

  // Send query
  const response = await sendQuery(activeSessionId, message, context);

  return {
    response,
    sessionId: activeSessionId,
  };
}

/**
 * Check if OnDemand API is available
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const config = getConfig();
    // Simple ping to check if we can reach the API
    const response = await fetch(`${ONDEMAND_API_BASE}/sessions`, {
      method: "POST",
      headers: {
        apikey: config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pluginIds: [],
        externalUserId: "health-check",
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Format AI response with citations
 */
export function formatResponseWithCitations(response: OnDemandResponse): string {
  let formatted = response.answer;

  if (response.citations && response.citations.length > 0) {
    formatted += "\n\n---\n**Sources:**\n";
    response.citations.forEach((citation, index) => {
      formatted += `${index + 1}. ${citation.title || citation.source}\n`;
    });
  }

  return formatted;
}
