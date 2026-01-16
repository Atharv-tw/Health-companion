import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// In-memory store for webhook results (for demo purposes)
// In production, use Redis or database
const pendingResults = new Map<string, { result: string; timestamp: number }>();

// Store a result
export function storeResult(executionId: string, result: string) {
  pendingResults.set(executionId, { result, timestamp: Date.now() });
  // Clean up old entries after 5 minutes
  setTimeout(() => pendingResults.delete(executionId), 5 * 60 * 1000);
}

// Get a result
export function getResult(executionId: string): string | null {
  const entry = pendingResults.get(executionId);
  if (entry) {
    pendingResults.delete(executionId);
    return entry.result;
  }
  return null;
}

// Webhook endpoint to receive OnDemand results
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("OnDemand Webhook received:", JSON.stringify(body, null, 2));

    // Extract execution ID and result from webhook payload
    const executionId = body.executionId || body.executionID || body.id;
    const result = body.output || body.result || body.data?.output || body.data?.result || body.message;

    if (executionId && result) {
      storeResult(executionId, typeof result === 'string' ? result : JSON.stringify(result));
      console.log(`Stored result for execution ${executionId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

// GET endpoint to check for results (for polling)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const executionId = searchParams.get("executionId");

  if (!executionId) {
    return NextResponse.json({ error: "executionId required" }, { status: 400 });
  }

  const result = getResult(executionId);

  if (result) {
    return NextResponse.json({ result });
  }

  return NextResponse.json({ pending: true });
}
