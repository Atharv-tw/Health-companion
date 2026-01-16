import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Schema for query parameters
const querySchema = z.object({
  userId: z.string().min(1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 5),
});

// CORS headers for OnDemand to call this endpoint
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-app-secret, apikey",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    // 1. Authorization Check - check for app secret or OnDemand API key
    const authHeader = request.headers.get("x-app-secret");
    const apiKey = request.headers.get("apikey");

    if (process.env.APP_SECRET && authHeader !== process.env.APP_SECRET && !apiKey) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    // 2. Parse Query Parameters
    const { searchParams } = new URL(request.url);
    const result = querySchema.safeParse({
      userId: searchParams.get("userId"),
      limit: searchParams.get("limit"),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400, headers: corsHeaders });
    }

    const { userId, limit } = result.data;

    // 3. Fetch Data
    const logs = await prisma.healthLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        riskAlert: {
          select: {
            riskLevel: true,
            reasons: true,
            nextSteps: true,
          }
        }
      }
    });

    // 4. Format Data for AI Consumption
    // We return a summarized text format alongside the raw data to help the AI
    const formattedLogs = logs.map(log => {
      const symptoms = log.symptoms as any; // Cast JSON
      const symptomList = symptoms?.items?.map((s: any) => `${s.name} (${s.severity})`).join(", ") || "No symptoms";
      
      const vitals = log.vitals as any;
      const vitalsList = Object.entries(vitals || {})
        .filter(([_, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ") || "No vitals";

      return {
        date: log.createdAt.toISOString().split('T')[0],
        symptoms: symptomList,
        vitals: vitalsList,
        riskLevel: log.riskAlert?.riskLevel || "UNKNOWN",
        raw: log
      };
    });

    return NextResponse.json({
      summary: `Found ${logs.length} recent health logs for user.`,
      logs: formattedLogs
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("Tool Error [health-logs]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}
