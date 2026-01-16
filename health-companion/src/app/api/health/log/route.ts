import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { healthLogSchema, HealthLogInput } from "@/lib/validators";
import { assessRisk } from "@/lib/risk-engine";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = healthLogSchema.parse(body);

    // Get user profile for risk assessment (age, conditions, allergies)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { profile: true },
    });

    const userProfile = user?.profile as { age?: number; conditions?: string[]; allergies?: string[] } | null;

    // Create health log
    const healthLog = await prisma.healthLog.create({
      data: {
        userId: session.user.id,
        symptoms: validatedData.symptoms,
        vitals: validatedData.vitals || {},
        lifestyle: validatedData.lifestyle || {},
      },
    });

    // Run risk assessment
    const riskAssessment = assessRisk(validatedData as HealthLogInput, userProfile || undefined);

    // Create risk alert record
    const riskAlert = await prisma.riskAlert.create({
      data: {
        healthLogId: healthLog.id,
        riskLevel: riskAssessment.riskLevel,
        reasons: riskAssessment.reasons,
        nextSteps: riskAssessment.nextSteps,
        redFlags: riskAssessment.redFlags,
        consultAdvice: riskAssessment.consultAdvice,
        ruleVersion: riskAssessment.ruleVersion,
      },
    });

    return NextResponse.json(
      {
        message: "Health log created successfully",
        healthLog: {
          id: healthLog.id,
          createdAt: healthLog.createdAt,
        },
        riskAssessment: {
          id: riskAlert.id,
          riskLevel: riskAlert.riskLevel,
          reasons: riskAlert.reasons,
          nextSteps: riskAlert.nextSteps,
          redFlags: riskAlert.redFlags,
          consultAdvice: riskAlert.consultAdvice,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Health log error:", error);
    return NextResponse.json(
      { error: "Failed to create health log" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const healthLogs = await prisma.healthLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        riskAlert: true,
      },
    });

    const total = await prisma.healthLog.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      healthLogs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Get health logs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch health logs" },
      { status: 500 }
    );
  }
}
