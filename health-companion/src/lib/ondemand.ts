/**
 * OnDemand API Client
 *
 * Handles communication with OnDemand.io Workflow API.
 *
 * ARCHITECTURE:
 * Uses Workflow Automation API. All user queries are sent to a workflow
 * that contains the Orchestrator + 6 Specialist agents.
 */

const ONDEMAND_WORKFLOW_API = "https://api.on-demand.io/automation/api/workflow";

interface OnDemandConfig {
  apiKey: string;
  workflowId: string;
}

interface OnDemandResponse {
  answer: string;
  citations?: Array<{
    source: string;
    title?: string;
    snippet?: string;
  }>;
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
  const workflowId = process.env.ONDEMAND_WORKFLOW_ID || process.env.ONDEMAND_ORCHESTRATOR_ID;

  if (!apiKey) {
    throw new Error("ONDEMAND_API_KEY is not configured");
  }

  if (!workflowId) {
    throw new Error("ONDEMAND_WORKFLOW_ID is not configured");
  }

  return {
    apiKey,
    workflowId,
  };
}

/**
 * Execute the workflow with a user query
 */
export async function executeWorkflow(
  query: string,
  userId?: string,
  context?: { healthSummary?: string; recentSymptoms?: string[] }
): Promise<OnDemandResponse> {
  const config = getConfig();

  // Construct the enriched query with context
  let enrichedQuery = query;

  const contextParts = [];
  if (context?.healthSummary) {
    contextParts.push(`[Context: User Health Summary: ${context.healthSummary}]`);
  }
  if (userId) {
    contextParts.push(`[Context: Current User ID: ${userId}]`);
  }

  if (contextParts.length > 0) {
    enrichedQuery = `${contextParts.join("\n")}\n\n${query}`;
  }

  const response = await fetch(
    `${ONDEMAND_WORKFLOW_API}/${config.workflowId}/execute`,
    {
      method: "POST",
      headers: {
        apikey: config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: enrichedQuery,
        userId: userId,
      }),
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
    throw new Error(errorData.error || "Failed to get response from OnDemand workflow");
  }

  const data = await response.json();

  // Extract response from workflow result
  // Workflow API may return different structure - adjust as needed
  const answer = data.data?.output ||
                 data.data?.answer ||
                 data.output ||
                 data.answer ||
                 data.response ||
                 data.result ||
                 "I couldn't generate a response.";

  return {
    answer: typeof answer === 'string' ? answer : JSON.stringify(answer),
    citations: data.data?.citations || data.citations || [],
  };
}

/**
 * Main chat interface (simplified - no sessions needed for workflow)
 */
export async function chat(
  sessionId: string | null, // Kept for backwards compatibility, not used
  message: string,
  userId?: string,
  context?: { healthSummary?: string; recentSymptoms?: string[] }
): Promise<{ response: OnDemandResponse; sessionId: string }> {
  const response = await executeWorkflow(message, userId, context);

  return {
    response,
    sessionId: `workflow-${Date.now()}`, // Generate a pseudo session ID for compatibility
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
      const title = citation.title || citation.source;
      formatted += `${index + 1}. ${title}\n`;
    });
  }

  return formatted;
}
