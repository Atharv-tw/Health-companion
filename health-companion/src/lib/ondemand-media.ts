/**
 * OnDemand Media & Knowledge API Client
 * 
 * Handles uploading user documents directly to the OnDemand Vector DB.
 */

const ONDEMAND_API_BASE = "https://api.on-demand.io/chat/v1";

export async function uploadToKnowledgeBase(file: File, userId: string): Promise<{ documentId: string; status: string }> {
  const apiKey = process.env.ONDEMAND_API_KEY;
  if (!apiKey) throw new Error("ONDEMAND_API_KEY is not configured");

  try {
    // 1. Prepare Multipart Form Data
    const formData = new FormData();
    // In On-Demand API, the field name is often 'file' or 'document'
    formData.append("file", file);
    
    // Some endpoints require these parameters to be in the body or headers
    // We add them to the form data as standard for multipart uploads
    formData.append("externalUserId", `user-${userId}`);
    
    // If the account has a specific knowledge base, it might need a 'pluginId'
    // For now we assume the default personal knowledge base
    
    console.log(`Attempting to ingest file: ${file.name} for user: ${userId}`);

    // 2. Submit to OnDemand Ingestion
    const response = await fetch(`${ONDEMAND_API_BASE}/knowledge/ingest/file`, {
      method: "POST",
      headers: {
        "apikey": apiKey,
        // Content-Type is handled automatically by fetch for FormData
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      console.error("OnDemand Ingestion Error Data:", errorData);
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("OnDemand Ingestion Success:", data);
    
    return {
      documentId: data.data?.id || data.id || data.documentId || "unknown_id",
      status: "indexed"
    };

  } catch (error: any) {
    console.error("OnDemand Storage Error:", error.message || error);
    throw error;
  }
}

/**
 * Process a file from a URL
 */
export async function processMedicalDocument(fileUrl: string): Promise<{ text: string; raw: unknown }> {
  const apiKey = process.env.ONDEMAND_API_KEY;
  if (!apiKey) throw new Error("ONDEMAND_API_KEY is not configured");

  try {
    const response = await fetch("https://api.on-demand.io/media/v1/public/file/extract", {
      method: "POST",
      headers: {
        "apikey": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: fileUrl })
    });

    const data = await response.json();
    return {
      text: data.data?.content || data.text || "",
      raw: data
    };
  } catch (error) {
    console.error("Media API Error:", error);
    return { text: "Error processing document.", raw: null };
  }
}
