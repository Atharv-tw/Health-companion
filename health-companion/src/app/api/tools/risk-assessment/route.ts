import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const querySchema = z.object({
  userId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    // 1. Authorization
    const authHeader = request.headers.get("x-app-secret");
    if (process.env.APP_SECRET && authHeader !== process.env.APP_SECRET) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validation
    const { searchParams } = new URL(request.url);
    const result = querySchema.safeParse({
      userId: searchParams.get("userId"),
    });

    if (!result.success) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }

    const { userId } = result.data;

    // 3. Fetch latest Risk Alert
    // We join with HealthLog to ensure we get the latest one created
    const latestRisk = await prisma.riskAlert.findFirst({
      where: {
        healthLog: {
          userId: userId
        }
      },
      orderBy: { createdAt: "desc" },
      include: {
        healthLog: {
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
      });
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
        symptoms: latestRisk.healthLog.symptoms
      }
    });

  } catch (error) {
    console.error("Tool Error [risk-assessment]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
