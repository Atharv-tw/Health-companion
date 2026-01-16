/**
 * OnDemand API Client
 *
 * Handles communication with OnDemand.io AI Agent API.
 * 
 * ARCHITECTURE UPDATE:
 * Supports "Orchestrator Pattern". All user queries are sent to a single
 * Orchestrator Agent (configured in env). This agent autonomously delegates
 * to specialized sub-agents (Health Chat, Symptom Analyzer, etc.) which are
 * registered as "tools" within the OnDemand platform.
 */

const ONDEMAND_API_BASE = "https://api.on-demand.io/chat/v1";

interface OnDemandConfig {
  apiKey: string;
  orchestratorId: string;
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
  // Prefer specific Orchestrator ID, fallback to generic Agent ID, then hardcoded default
  const orchestratorId = process.env.ONDEMAND_ORCHESTRATOR_ID || process.env.ONDEMAND_AGENT_ID;

  if (!apiKey) {
    throw new Error("ONDEMAND_API_KEY is not configured");
  }

  if (!orchestratorId) {
     console.warn("ONDEMAND_ORCHESTRATOR_ID is not configured. Chat may fail.");
  }

  return {
    apiKey,
    orchestratorId: orchestratorId || "health-companion-orchestrator",
  };
}

/**
 * Create a new chat session with OnDemand
 */
export async function createSession(userId?: string): Promise<string> {
  const config = getConfig();

  const response = await fetch(`${ONDEMAND_API_BASE}/sessions`, {
    method: "POST",
    headers: {
      apikey: config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pluginIds: [],
      // We tag the session with the user ID for debugging/tracking
      externalUserId: userId ? `user-${userId}` : `health-companion-${Date.now()}`,
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
 * Send a query to the Orchestrator Agent
 */
export async function sendQuery(
  sessionId: string,
  query: string,
  userId?: string, // Vital for tools to work
  context?: { healthSummary?: string; recentSymptoms?: string[] }
): Promise<OnDemandResponse> {
  const config = getConfig();
  
  // Construct the enriched query with context
  let enrichedQuery = query;

  // We inject context as a system-like instruction at the start
  // The Orchestrator will use this to inform its routing/decisions
  const contextParts = [];
  if (context?.healthSummary) {
    contextParts.push(`[Context: User Health Summary: ${context.healthSummary}]`);
  }
  if (userId) {
     // We explicitly tell the agent the User ID so it can call tools with it
     contextParts.push(`[Context: Current User ID: ${userId}]`);
  }
  
  if (contextParts.length > 0) {
    enrichedQuery = `${contextParts.join("\n")}\n\n${query}`;
  }

  const requestBody = {
    endpointId: config.orchestratorId,
    query: enrichedQuery,
    pluginIds: ["plugin-1712327325", "plugin-1713962163"], // Medical knowledge plugins
    responseMode: "sync",
    // We can also pass variables if the API supports it, but enriching query is safer for now
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

  return {
    answer: data.data?.answer || data.answer || data.response || "I couldn't generate a response.",
    citations: data.data?.citations || data.citations || [],
    sessionId: sessionId,
  };
}

/**
 * Main chat interface
 */
export async function chat(
  sessionId: string | null,
  message: string,
  userId?: string,
  context?: { healthSummary?: string; recentSymptoms?: string[] }
): Promise<{ response: OnDemandResponse; sessionId: string }> {
  // Create session if not provided
  const activeSessionId = sessionId || (await createSession(userId));

  // Send query
  const response = await sendQuery(activeSessionId, message, userId, context);

  return {
    response,
    sessionId: activeSessionId,
  };
}

/**
 * Format AI response with citations
 */
export function formatResponseWithCitations(response: OnDemandResponse): string {
  let formatted = response.answer;

  if (response.citations && response.citations.length > 0) {
    formatted += "\n\n---\n**Sources:**\n";
    response.citations.forEach((citation, index) => {
      // Clean up title if it's a URL or generic
      const title = citation.title || citation.source;
      formatted += `${index + 1}. ${title}\n`;
    });
  }

  return formatted;
}