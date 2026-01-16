import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Schema for query parameters
const querySchema = z.object({
  userId: z.string().min(1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 5),
});

export async function GET(request: NextRequest) {
  try {
    // 1. Authorization Check (API Key Protection)
    // The OnDemand Agent must send this secret in the headers
    const authHeader = request.headers.get("x-app-secret");
    if (authHeader !== process.env.APP_SECRET && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Allow bypassing auth in dev if needed, or better, require it always but set a default in .env
    // For now, I'll assume if APP_SECRET is set, we check it.
    if (process.env.APP_SECRET && authHeader !== process.env.APP_SECRET) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Query Parameters
    const { searchParams } = new URL(request.url);
    const result = querySchema.safeParse({
      userId: searchParams.get("userId"),
      limit: searchParams.get("limit"),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
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
    });

  } catch (error) {
    console.error("Tool Error [health-logs]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
