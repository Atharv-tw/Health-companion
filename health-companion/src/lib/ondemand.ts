/**
 * OnDemand API Client
 *
 * Uses Chat API with GPT-4o model + REST API agents (plugins) for data retrieval.
 * Our backend provides tool endpoints that OnDemand agents call.
 */

const ONDEMAND_CHAT_API = "https://api.on-demand.io/chat/v1";
const ONDEMAND_MEDIA_API = "https://api.on-demand.io/media/v1/public/file";

// Fulfillment Model - the LLM that processes queries
const FULFILLMENT_MODEL = "predefined-openai-gpt4o";

// REST API Agent Plugin IDs - Replace with real IDs after creating on OnDemand
// These agents call back to your deployed backend endpoints
const AGENT_PLUGINS = {
  // Health data agents (create these on OnDemand as REST API agents)
  HEALTH_SUMMARY: process.env.ONDEMAND_PLUGIN_HEALTH_SUMMARY || "",
  RISK_ASSESSMENT: process.env.ONDEMAND_PLUGIN_RISK_ASSESSMENT || "",
  USER_PROFILE: process.env.ONDEMAND_PLUGIN_USER_PROFILE || "",
  HEALTH_LOGS: process.env.ONDEMAND_PLUGIN_HEALTH_LOGS || "",
  REPORT_ANALYZER: process.env.ONDEMAND_PLUGIN_REPORT_ANALYZER || "",
  REMINDER_MANAGER: process.env.ONDEMAND_PLUGIN_REMINDER_MANAGER || "",
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

/**
 * Get relevant plugin IDs based on user query
 * Returns array of plugin IDs that should be used for this query
 */
function getRelevantPlugins(query: string): string[] {
  const plugins: string[] = [];
  const lowerQuery = query.toLowerCase();

  // Always include health context if available
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

  // Reminder queries
  if (
    lowerQuery.includes("reminder") ||
    lowerQuery.includes("medicine") ||
    lowerQuery.includes("schedule") ||
    lowerQuery.includes("take my")
  ) {
    if (AGENT_PLUGINS.REMINDER_MANAGER) plugins.push(AGENT_PLUGINS.REMINDER_MANAGER);
  }

  // Remove duplicates and empty strings
  return Array.from(new Set(plugins)).filter(Boolean);
}

// Legacy function for backward compatibility
function routeToAgent(query: string): string {
  const plugins = getRelevantPlugins(query);
  return plugins[0] || "";
}

/**
 * Create a new chat session
 */
async function createSession(externalUserId: string): Promise<string> {
  const config = getConfig();

  const response = await fetch(`${ONDEMAND_CHAT_API}/sessions`, {
    method: "POST",
    headers: {
      apikey: config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      externalUserId: externalUserId,
      // Don't pass agentIds - our agents are endpoints, not knowledge agents
    }),
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
 * Uses GPT-4o as fulfillment model + optional plugin agents for data retrieval
 */
async function submitQuery(
  sessionId: string,
  query: string,
  pluginIds: string[] = []
): Promise<OnDemandResponse> {
  const config = getConfig();

  // Filter out empty plugin IDs
  const activePlugins = pluginIds.filter(Boolean);

  console.log(`Submitting query to session ${sessionId}`);
  console.log(`Using model: ${FULFILLMENT_MODEL}`);
  console.log(`Active plugins: ${activePlugins.length > 0 ? activePlugins.join(", ") : "none"}`);
  console.log(`Query: ${query.substring(0, 100)}...`);

  const requestBody: Record<string, unknown> = {
    query: query,
    endpointId: FULFILLMENT_MODEL,
    responseMode: "sync",
  };

  // Only include pluginIds if we have active plugins
  if (activePlugins.length > 0) {
    requestBody.pluginIds = activePlugins;
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
 * Main chat function - uses GPT-4o with relevant plugins based on query
 */
export async function chat(
  existingSessionId: string | null,
  message: string,
  userId?: string,
  context?: { healthSummary?: string; recentSymptoms?: string[] }
): Promise<{ response: OnDemandResponse; sessionId: string }> {
  // Get relevant plugins based on message content
  const pluginIds = getRelevantPlugins(message);
  console.log(`Selected plugins: ${pluginIds.length > 0 ? pluginIds.join(", ") : "none (using model only)"}`);

  // Create session if needed
  const externalUserId = userId || `user-${Date.now()}`;
  const sessionId = existingSessionId || (await createSession(externalUserId));

  // Build enriched query with context
  let enrichedQuery = message;
  const contextParts = [];

  if (context?.healthSummary) {
    contextParts.push(`User Health Context: ${context.healthSummary}`);
  }
  if (context?.recentSymptoms && context.recentSymptoms.length > 0) {
    contextParts.push(`Recent Symptoms: ${context.recentSymptoms.join(", ")}`);
  }
  if (userId) {
    contextParts.push(`User ID: ${userId}`);
  }

  if (contextParts.length > 0) {
    enrichedQuery = `[Context: ${contextParts.join(" | ")}]\n\n${message}`;
  }

  // Submit query with selected plugins
  const response = await submitQuery(sessionId, enrichedQuery, pluginIds);

  return {
    response,
    sessionId,
  };
}

/**
 * Upload media file for analysis via Media API
 * Supports documents (PDF, DOC) and images (PNG, JPG)
 */
export async function uploadMedia(
  fileUrl: string,
  fileName: string,
  fileType: "document" | "image",
  sessionId?: string
): Promise<{ mediaId: string; extractedTextUrl?: string; mimeType?: string }> {
  const config = getConfig();

  const pluginId =
    fileType === "document" ? MEDIA_PLUGINS.DOCUMENT : MEDIA_PLUGINS.IMAGE;

  console.log(`Uploading media: ${fileName} (${fileType})`);
  console.log(`Using plugin: ${pluginId}`);

  const requestBody: Record<string, unknown> = {
    url: fileUrl,
    name: fileName,
    plugins: [pluginId],
    responseMode: "sync",
  };

  // Include sessionId if provided (links media to chat session)
  if (sessionId) {
    requestBody.sessionId = sessionId;
  }

  const response = await fetch(ONDEMAND_MEDIA_API, {
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
    extractedTextUrl: data.data?.extractedTextUrl || data.extractedTextUrl,
    mimeType: data.data?.mimeType || data.mimeType,
  };
}

/**
 * Analyze a report using Media API + GPT-4o model
 */
export async function analyzeReport(
  fileUrl: string,
  fileName: string,
  sessionId?: string
): Promise<OnDemandResponse> {
  // Step 1: Upload and process media
  const media = await uploadMedia(fileUrl, fileName, "document");

  // Step 2: Fetch extracted text if available
  let extractedText = "";
  if (media.extractedTextUrl) {
    try {
      const textResponse = await fetch(media.extractedTextUrl);
      if (textResponse.ok) {
        extractedText = await textResponse.text();
        // Limit text length
        if (extractedText.length > 3000) {
          extractedText = extractedText.substring(0, 3000) + "...";
        }
      }
    } catch (e) {
      console.error("Failed to fetch extracted text:", e);
    }
  }

  // Step 3: Create session and analyze with GPT-4o
  const chatSessionId = sessionId || (await createSession(`report-analyzer-${Date.now()}`));

  const query = extractedText
    ? `Please analyze this medical report and explain the key findings. Remember: Do not diagnose, only explain what the values mean and suggest consulting a healthcare provider for interpretation.\n\n${extractedText}`
    : `A medical document "${fileName}" has been uploaded (ID: ${media.mediaId}). Please provide general guidance on how to interpret medical reports and remind the user to consult a healthcare provider.`;

  // Use report analyzer plugin if available
  const plugins = AGENT_PLUGINS.REPORT_ANALYZER ? [AGENT_PLUGINS.REPORT_ANALYZER] : [];

  const response = await submitQuery(chatSessionId, query, plugins);

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
export { AGENTS, AGENT_PLUGINS, MEDIA_PLUGINS, FULFILLMENT_MODEL };
