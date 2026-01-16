/**
 * OnDemand Media API Client
 * 
 * Handles interaction with OnDemand's Media processing capabilities.
 * Note: Storage is handled by Vercel Blob for this implementation.
 */

const ONDEMAND_API_BASE = "https://api.on-demand.io/chat/v1";

/**
 * Process a file from a URL (e.g., Vercel Blob)
 * Returns the extracted text content.
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
      body: JSON.stringify({
        url: fileUrl
      })
    });

    if (!response.ok) {
       console.warn("Media API call failed");
       return {
         text: "Unable to extract text from document (Media API error).",
         raw: null
       };
    }

    const data = await response.json();
    return {
      text: data.data?.content || data.text || "",
      raw: data
    };

  } catch (error) {
    console.error("Media API Error:", error);
    return {
      text: "Error processing document.",
      raw: null
    };
  }
}