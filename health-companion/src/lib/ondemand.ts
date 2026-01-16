/**
 * OnDemand API Client
 *
 * Uses Chat API with GPT-4o model + REST API agents for data retrieval.
 * Our backend provides tool endpoints that OnDemand agents call.
 */

const ONDEMAND_CHAT_API = "https://api.on-demand.io/chat/v1";
const ONDEMAND_MEDIA_API = "https://api.on-demand.io/media/v1";

// Fulfillment Model - the LLM that processes queries
const FULFILLMENT_MODEL = "predefined-openai-gpt4.1";

// Health Chat Agent ID - the main agent created on OnDemand
const HEALTH_CHAT_AGENT_ID = process.env.ONDEMAND_HEALTH_AGENT_ID || "696a1151c7d6dfdf7e337c7e";

// REST API Agent Tool IDs - Created on OnDemand Agent Builder
const AGENT_PLUGINS = {
  HEALTH_CHAT: HEALTH_CHAT_AGENT_ID,
  HEALTH_SUMMARY: process.env.ONDEMAND_PLUGIN_HEALTH_SUMMARY || "tool-1768594008",
  RISK_ASSESSMENT: process.env.ONDEMAND_PLUGIN_RISK_ASSESSMENT || "tool-1768594163",
  HEALTH_LOGS: process.env.ONDEMAND_PLUGIN_HEALTH_LOGS || "tool-1768594275",
  USER_PROFILE: process.env.ONDEMAND_PLUGIN_USER_PROFILE || "tool-1768594351",
  REPORT_ANALYZER: process.env.ONDEMAND_PLUGIN_REPORT_ANALYZER || "tool-1768594455",
};

// Media Processing Plugin IDs (built-in OnDemand plugins)
const MEDIA_PLUGINS = {
  DOCUMENT: "plugin-1713954536",
  IMAGE: "plugin-1713958591",
};

// Legacy AGENTS export for backward compatibility
const AGENTS = AGENT_PLUGINS;

interface OnDemandConfig {
  apiKey: string;
}

interface OnDemandResponse {
  answer: string;
  sessionId?: string;
  citations?: Array<{
    source: string;
    title?: string;
    snippet?: string;
  }>;
}

function getConfig(): OnDemandConfig {
  const apiKey = process.env.ONDEMAND_API_KEY;
  if (!apiKey) {
    throw new Error("ONDEMAND_API_KEY is not configured");
  }
  return { apiKey };
}

// Built-in OnDemand agents (from Agent Builder export)
const BUILTIN_AGENTS = {
  // Knowledge agents - these 2 are confirmed working
  MEDICAL_KNOWLEDGE: "agent-1712327325",
  HEALTH_KNOWLEDGE: "agent-1713962163",
};

/**
 * Get relevant plugin IDs based on user query
 * Uses OnDemand's built-in agents for knowledge retrieval
 */
function getRelevantPlugins(_query: string): string[] {
  // Use confirmed working OnDemand agents
  return [
    BUILTIN_AGENTS.MEDICAL_KNOWLEDGE,
    BUILTIN_AGENTS.HEALTH_KNOWLEDGE,
  ];

  /*
  const plugins: string[] = [];
  const lowerQuery = _query.toLowerCase();

  // Always include the main health chat agent
  if (HEALTH_CHAT_AGENT_ID) {
    plugins.push(HEALTH_CHAT_AGENT_ID);
  }

  // Include health summary agent if available
  if (AGENT_PLUGINS.HEALTH_SUMMARY) {
    plugins.push(AGENT_PLUGINS.HEALTH_SUMMARY);
  }

  // Symptom-related queries - include health logs
  if (
    lowerQuery.includes("symptom") ||
    lowerQuery.includes("feeling") ||
    lowerQuery.includes("pain") ||
    lowerQuery.includes("ache") ||
    lowerQuery.includes("fever") ||
    lowerQuery.includes("headache") ||
    lowerQuery.includes("nausea") ||
    lowerQuery.includes("dizzy") ||
    lowerQuery.includes("tired") ||
    lowerQuery.includes("fatigue")
  ) {
    if (AGENT_PLUGINS.HEALTH_LOGS) plugins.push(AGENT_PLUGINS.HEALTH_LOGS);
  }

  // Risk-related queries
  if (
    lowerQuery.includes("risk") ||
    lowerQuery.includes("score") ||
    lowerQuery.includes("level") ||
    lowerQuery.includes("assessment") ||
    lowerQuery.includes("danger")
  ) {
    if (AGENT_PLUGINS.RISK_ASSESSMENT) plugins.push(AGENT_PLUGINS.RISK_ASSESSMENT);
  }

  // Profile/personal queries
  if (
    lowerQuery.includes("profile") ||
    lowerQuery.includes("condition") ||
    lowerQuery.includes("allergy") ||
    lowerQuery.includes("medication") ||
    lowerQuery.includes("my health")
  ) {
    if (AGENT_PLUGINS.USER_PROFILE) plugins.push(AGENT_PLUGINS.USER_PROFILE);
  }

  // Report/lab related queries
  if (
    lowerQuery.includes("report") ||
    lowerQuery.includes("lab") ||
    lowerQuery.includes("test result") ||
    lowerQuery.includes("blood") ||
    lowerQuery.includes("scan")
  ) {
    if (AGENT_PLUGINS.REPORT_ANALYZER) plugins.push(AGENT_PLUGINS.REPORT_ANALYZER);
  }

  // Remove duplicates and empty strings
  return Array.from(new Set(plugins)).filter(Boolean);
  */
}

// Legacy function for backward compatibility
function _routeToAgent(query: string): string {
  const plugins = getRelevantPlugins(query);
  return plugins[0] || "";
}

interface ContextMetadata {
  key: string;
  value: string;
}

/**
 * Create a new chat session with built-in OnDemand agents
 */
async function createSession(
  externalUserId: string,
  contextMetadata: ContextMetadata[] = []
): Promise<string> {
  const config = getConfig();

  const body: Record<string, unknown> = {
    externalUserId: externalUserId,
    agentIds: [
      BUILTIN_AGENTS.MEDICAL_KNOWLEDGE,
      BUILTIN_AGENTS.HEALTH_KNOWLEDGE,
    ],
  };

  // Include contextMetadata if provided
  if (contextMetadata.length > 0) {
    body.contextMetadata = contextMetadata;
  }

  console.log("Creating session with body:", JSON.stringify(body));

  const response = await fetch(`${ONDEMAND_CHAT_API}/sessions`, {
    method: "POST",
    headers: {
      apikey: config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Session creation error:", error);
    throw new Error("Failed to create chat session");
  }

  const data = await response.json();
  console.log("Session created:", data);
  return data.data?.id || data.id;
}

/**
 * Submit a query via Chat API
 * Uses GPT-4.1 as fulfillment model + optional agents for data retrieval
 */
async function submitQuery(
  sessionId: string,
  query: string,
  agentIds: string[] = [],
  responseMode: "sync" | "stream" = "sync"
): Promise<OnDemandResponse> {
  const config = getConfig();

  // Filter out empty agent IDs
  const activeAgents = agentIds.filter(Boolean);

  console.log(`Submitting query to session ${sessionId}`);
  console.log(`Using model: ${FULFILLMENT_MODEL}`);
  console.log(`Active agents: ${activeAgents.length > 0 ? activeAgents.join(", ") : "none"}`);
  console.log(`Query: ${query.substring(0, 100)}...`);

  const fulfillmentPrompt = `You are a Health Companion AI assistant. You provide health guidance and wellness support.

RULES:
- Give general health advice and wellness tips
- Explain symptoms, conditions, and their common causes
- Provide preventive health guidance
- Use the user's health context when available
- NEVER diagnose diseases or medical conditions
- NEVER prescribe medications or dosages
- NEVER recommend stopping prescribed medications
- For emergencies, direct users to call emergency services (911)

Always recommend consulting a healthcare professional for medical concerns.`;

  const requestBody: Record<string, unknown> = {
    query: query,
    endpointId: FULFILLMENT_MODEL,
    responseMode: responseMode,
    modelConfigs: {
      fulfillmentPrompt: fulfillmentPrompt,
      temperature: 0.3,
      topP: 0.9,
      maxTokens: 1024,
      presencePenalty: 0,
      frequencyPenalty: 0,
    },
  };

  // Only include agentIds if we have active agents
  if (activeAgents.length > 0) {
    requestBody.agentIds = activeAgents;
  }

  const response = await fetch(
    `${ONDEMAND_CHAT_API}/sessions/${sessionId}/query`,
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
    const error = await response.text();
    console.error("Query error:", error);
    throw new Error(`Failed to get response: ${error}`);
  }

  const data = await response.json();
  console.log("Chat API response:", JSON.stringify(data, null, 2));

  // Extract the answer from response
  const answer =
    data.data?.answer ||
    data.answer ||
    data.data?.response ||
    data.response ||
    "I couldn't generate a response.";

  return {
    answer: typeof answer === "string" ? answer : JSON.stringify(answer),
    sessionId,
    citations: data.data?.citations || data.citations || [],
  };
}

/**
 * Main chat function - uses GPT-4.1 with relevant agents based on query
 */
export async function chat(
  existingSessionId: string | null,
  message: string,
  userId?: string,
  context?: { healthSummary?: string; recentSymptoms?: string[] }
): Promise<{ response: OnDemandResponse; sessionId: string }> {
  // Get relevant agents based on message content
  const agentIds = getRelevantPlugins(message);
  console.log(`Selected agents: ${agentIds.length > 0 ? agentIds.join(", ") : "none (using model only)"}`);

  // Build context metadata for session
  const contextMetadata: ContextMetadata[] = [];
  if (userId) {
    contextMetadata.push({ key: "userId", value: userId });
  }
  if (context?.healthSummary) {
    contextMetadata.push({ key: "healthSummary", value: context.healthSummary });
  }
  if (context?.recentSymptoms && context.recentSymptoms.length > 0) {
    contextMetadata.push({ key: "recentSymptoms", value: context.recentSymptoms.join(", ") });
  }

  // Create session if needed (agents are passed in query, not session)
  const externalUserId = userId || `user-${Date.now()}`;
  const sessionId = existingSessionId || (await createSession(externalUserId, contextMetadata));

  // Submit query with selected agents
  const response = await submitQuery(sessionId, message, agentIds);

  return {
    response,
    sessionId,
  };
}

/**
 * Upload media file for analysis via Media API (URL-based)
 * Supports documents (PDF, DOC) and images (PNG, JPG)
 */
export async function uploadMedia(
  fileUrl: string,
  fileName: string,
  fileType: "document" | "image",
  sessionId?: string
): Promise<{ mediaId: string; extractedTextUrl?: string; context?: string }> {
  const config = getConfig();

  const agentId =
    fileType === "document" ? MEDIA_PLUGINS.DOCUMENT : MEDIA_PLUGINS.IMAGE;

  console.log(`Uploading media: ${fileName} (${fileType})`);
  console.log(`Using agent: ${agentId}`);

  const requestBody: Record<string, unknown> = {
    url: fileUrl,
    name: fileName,
    agents: [agentId],
    responseMode: "sync",
    createdBy: "health-companion",
    updatedBy: "health-companion",
  };

  // Include sessionId if provided (links media to chat session)
  if (sessionId) {
    requestBody.sessionId = sessionId;
  }

  const response = await fetch(`${ONDEMAND_MEDIA_API}/public/file`, {
    method: "POST",
    headers: {
      apikey: config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Media upload error:", error);
    throw new Error(`Failed to upload media: ${error}`);
  }

  const data = await response.json();
  console.log("Media upload response:", JSON.stringify(data, null, 2));

  return {
    mediaId: data.data?.id || data.id,
    extractedTextUrl: data.data?.url || data.url,
    context: data.data?.context || data.context,
  };
}

/**
 * Analyze a report using Media API + GPT-4.1 model
 */
export async function analyzeReport(
  fileUrl: string,
  fileName: string,
  sessionId?: string
): Promise<OnDemandResponse> {
  // Step 1: Upload and process media (this extracts text via Media API)
  const media = await uploadMedia(fileUrl, fileName, "document", sessionId);

  // Step 2: Use extracted context from media response
  let extractedText = media.context || "";

  // Limit text length if too long
  if (extractedText.length > 3000) {
    extractedText = extractedText.substring(0, 3000) + "...";
  }

  // Step 3: Create session and analyze with GPT-4.1
  const agentIds = AGENT_PLUGINS.REPORT_ANALYZER ? [AGENT_PLUGINS.REPORT_ANALYZER] : [];
  const chatSessionId = sessionId || (await createSession(`report-analyzer-${Date.now()}`));

  const query = extractedText
    ? `Please analyze this medical report and explain the key findings. Remember: Do not diagnose, only explain what the values mean and suggest consulting a healthcare provider for interpretation.\n\n${extractedText}`
    : `A medical document "${fileName}" has been uploaded (ID: ${media.mediaId}). Please provide general guidance on how to interpret medical reports and remind the user to consult a healthcare provider.`;

  const response = await submitQuery(chatSessionId, query, agentIds);

  return response;
}

/**
 * Execute workflow (kept for compatibility, now uses chat)
 */
export async function executeWorkflow(
  query: string,
  userId?: string,
  context?: { healthSummary?: string; recentSymptoms?: string[] }
): Promise<OnDemandResponse> {
  const { response } = await chat(null, query, userId, context);
  return response;
}

/**
 * Format AI response with citations
 */
export function formatResponseWithCitations(response: OnDemandResponse): string {
  let formatted = response.answer;

  if (response.citations && response.citations.length > 0) {
    formatted += "\n\n---\n**Sources:**\n";
    response.citations.forEach((citation, index) => {
      const title = citation.title || citation.source;
      formatted += `${index + 1}. ${title}\n`;
    });
  }

  return formatted;
}

// Export for reference
export { AGENTS, AGENT_PLUGINS, MEDIA_PLUGINS, FULFILLMENT_MODEL, HEALTH_CHAT_AGENT_ID };
