/**
 * OnDemand API Client
 *
 * Uses Chat API with GPT-4o model + REST API agents for data retrieval.
 * Our backend provides tool endpoints that OnDemand agents call.
 * Integrates local RAG for grounded responses with citations.
 */

import { searchKnowledge, Citation } from "./knowledge-rag";

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
  citations?: Citation[];
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
  // Custom chat agent
  CHAT_AGENT: "agent-1747493398",
};

/**
 * Get relevant plugin IDs based on user query
 * Uses 3 OnDemand agents
 */
function getRelevantPlugins(_query: string): string[] {
  return [
    BUILTIN_AGENTS.MEDICAL_KNOWLEDGE,
    BUILTIN_AGENTS.HEALTH_KNOWLEDGE,
    BUILTIN_AGENTS.CHAT_AGENT,
  ];
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
    throw new Error(`Failed to create chat session: ${error}`);
  }

  const data = await response.json();
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
  responseMode: "sync" | "stream" = "sync",
  context?: { healthSummary?: string; recentSymptoms?: string[]; userName?: string; ragContext?: string }
): Promise<OnDemandResponse> {
  const config = getConfig();

  // Filter out empty agent IDs
  const activeAgents = agentIds.filter(Boolean);

  // Build personalized fulfillment prompt with user context
  const userName = context?.userName ? context.userName : "there";
  const userContextBlock = context?.healthSummary
    ? `\n\nUSER HEALTH CONTEXT:\n${context.healthSummary}`
    : "";
  const ragContextBlock = context?.ragContext
    ? `\n\n${context.ragContext}\n\nUse this medical knowledge to inform your response, but present it naturally without citing source names or chunk references.`
    : "";

  const fulfillmentPrompt = `You are HealthBuddy, a compassionate Health Companion AI.

=== CRITICAL: OUTPUT FORMAT ===
You MUST format your response using proper Markdown. This is NON-NEGOTIABLE.

REQUIRED FORMAT:
1. Start with 1 empathetic sentence acknowledging the user's concern
2. Use **bold text** for section headers
3. Use "- " (dash space) at the START of lines for bullet points
4. Add blank lines between sections

EXAMPLE OUTPUT (copy this structure exactly):
"""
I understand you're concerned about [symptom]. Let me help explain what this might mean.

**Possible Causes**

- First possible cause or explanation here
- Second possible cause or explanation here
- Third possible cause or explanation here

**What You Can Try**

- First helpful suggestion or remedy
- Second helpful suggestion or remedy
- Third helpful suggestion or remedy

**When to See a Doctor**

- Warning sign that needs attention
- Another warning sign to watch for

Please consult a healthcare professional for a proper evaluation.
"""

=== MARKDOWN RULES (MUST FOLLOW) ===
- Every bullet MUST start with "- " (dash then space)
- Every section header MUST use **double asterisks**
- NEVER write plain text lists without dashes
- NEVER use bullet characters like • or ●
- Add a blank line BEFORE and AFTER each **header**

=== YOUR ROLE ===
You help users understand health topics with warmth and clarity. You explain symptoms, wellness tips, and when to seek care.

=== SAFETY RULES ===
- NEVER diagnose conditions - only explain possibilities
- NEVER prescribe medications or dosages
- NEVER delay emergency care advice
- For emergencies: direct to call 911 immediately
- ALWAYS end with "consult a healthcare professional"

=== WHEN TO RECOMMEND A DOCTOR ===
- Symptoms lasting over 7 days
- Fever above 103°F or lasting 3+ days
- Severe/worsening pain
- Blood in stool, urine, or cough
- Symptoms affecting daily life

The user's name is ${userName}.${userContextBlock}${ragContextBlock}`;

  const requestBody: Record<string, unknown> = {
    query: query,
    endpointId: FULFILLMENT_MODEL,
    responseMode: responseMode,
    modelConfigs: {
      fulfillmentPrompt: fulfillmentPrompt,
      temperature: 0.5,  // Slightly higher for more natural responses
      topP: 0.9,
      maxTokens: 1500,   // Increased for more detailed responses
      presencePenalty: 0.1,  // Slight penalty to reduce repetition
      frequencyPenalty: 0.1, // Slight penalty to encourage diverse language
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
    throw new Error(`Failed to get response: ${error}`);
  }

  const data = await response.json();

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
 * Now integrates RAG for grounded responses with citations
 */
export async function chat(
  existingSessionId: string | null,
  message: string,
  userId?: string,
  context?: { healthSummary?: string; recentSymptoms?: string[]; userName?: string },
  customAgentIds?: string[] // Optional: override default agents with specific ones
): Promise<{ response: OnDemandResponse; sessionId: string }> {
  // Use custom agents if provided, otherwise get relevant agents based on message
  const agentIds = customAgentIds && customAgentIds.length > 0
    ? customAgentIds
    : getRelevantPlugins(message);

  // Search knowledge base for relevant context (RAG)
  let ragContext = "";
  let ragCitations: Citation[] = [];
  try {
    const ragResult = await searchKnowledge(message, 3);
    if (ragResult.context) {
      ragContext = ragResult.context;
      ragCitations = ragResult.citations;
    }
  } catch {
    // Continue without RAG context
  }

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

  // Merge RAG context with user context
  const enrichedContext = {
    ...context,
    ragContext,
  };

  // Submit query with selected agents and context
  const response = await submitQuery(sessionId, message, agentIds, "sync", enrichedContext);

  // Merge RAG citations with any API citations
  const allCitations = [...ragCitations, ...(response.citations || [])];

  return {
    response: {
      ...response,
      citations: allCitations.length > 0 ? allCitations : undefined,
    },
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
    throw new Error(`Failed to upload media: ${error}`);
  }

  const data = await response.json();

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
  // Use built-in Health Knowledge agent for report analysis
  const agentIds = [BUILTIN_AGENTS.HEALTH_KNOWLEDGE];
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
 * Normalize markdown in AI response to ensure proper formatting
 * Converts common patterns to proper markdown syntax
 */
function normalizeMarkdown(text: string): string {
  let result = text;

  // Convert Unicode bullet characters to markdown bullets
  result = result.replace(/^[•●○◦▪▸►]\s*/gm, '- ');

  // Convert numbered lists without proper formatting (e.g., "1. " or "1) ")
  // Keep these as they are valid markdown

  // Convert lines starting with asterisk to dash (for consistency)
  result = result.replace(/^\*\s+/gm, '- ');

  // Fix lines that look like bullet points but don't have proper syntax
  // e.g., "   First item" after a header could be a bullet
  // This is tricky, so we focus on common patterns

  // Ensure there's a blank line before headers for proper parsing
  result = result.replace(/([^\n])\n(\*\*[^*]+\*\*)/g, '$1\n\n$2');

  // Ensure bullet lists have proper spacing
  result = result.replace(/(\*\*[^*]+\*\*)\n([^-\n])/g, '$1\n\n$2');

  // Convert "- " at start of line after any whitespace to proper bullet
  result = result.replace(/^(\s*)-\s+/gm, '- ');

  // Handle the case where model outputs text like:
  // "**Header**\nItem 1\nItem 2" - convert to bullet list
  // This is detected by lines following **bold** that are short and don't start with -
  const lines = result.split('\n');
  const processedLines: string[] = [];
  let afterHeader = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if this is a header (bold text on its own line)
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      afterHeader = true;
      processedLines.push(line);
      continue;
    }

    // Check if this looks like a list item (short, follows header, not already a bullet)
    if (afterHeader && trimmed.length > 0 && trimmed.length < 200 && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
      // Check if it's a continuation of content or a potential list item
      // List items typically start with capital letter and are concise
      if (/^[A-Z]/.test(trimmed) && !trimmed.endsWith('.') && trimmed.split(' ').length < 15) {
        processedLines.push('- ' + trimmed);
        continue;
      }
    }

    // Reset afterHeader if we hit an empty line
    if (trimmed.length === 0) {
      afterHeader = false;
    }

    processedLines.push(line);
  }

  return processedLines.join('\n');
}

/**
 * Format AI response with citations
 * Note: Citations are now handled by the UI component, not appended to text
 */
export function formatResponseWithCitations(response: OnDemandResponse): string {
  // Normalize markdown to ensure proper formatting
  const normalizedAnswer = normalizeMarkdown(response.answer);
  return normalizedAnswer;
}

// Export for reference
export { AGENTS, AGENT_PLUGINS, MEDIA_PLUGINS, FULFILLMENT_MODEL, HEALTH_CHAT_AGENT_ID };
