import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const querySchema = z.object({
  userId: z.string().min(1),
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
    // 1. Authorization - check for app secret or OnDemand API key
    const authHeader = request.headers.get("x-app-secret");
    const apiKey = request.headers.get("apikey");
    if (process.env.APP_SECRET && authHeader !== process.env.APP_SECRET && !apiKey) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    // 2. Validation
    const { searchParams } = new URL(request.url);
    const result = querySchema.safeParse({
      userId: searchParams.get("userId"),
    });

    if (!result.success) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400, headers: corsHeaders });
    }

    const { userId } = result.data;

    // 3. Fetch latest Risk Alert
    // We join with HealthLog to ensure we get the latest one created
    const latestRisk = await prisma.riskAlert.findFirst({
      where: {
        HealthLog: {
          userId: userId
        }
      },
      orderBy: { createdAt: "desc" },
      include: {
        HealthLog: {
          select: {
            createdAt: true,
            symptoms: true
          }
        }
      }
    });

    if (!latestRisk) {
      return NextResponse.json({
        message: "No risk assessments found for this user.",
        hasData: false
      }, { headers: corsHeaders });
    }

    // 4. Format
    return NextResponse.json({
      hasData: true,
      riskLevel: latestRisk.riskLevel,
      assessedAt: latestRisk.createdAt,
      reasons: latestRisk.reasons,
      redFlags: latestRisk.redFlags,
      nextSteps: latestRisk.nextSteps,
      basedOn: {
        symptoms: latestRisk.HealthLog.symptoms
      }
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("Tool Error [risk-assessment]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}
