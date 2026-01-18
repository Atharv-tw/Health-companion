import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const querySchema = z.object({
  userId: z.string().min(1),
  range: z.enum(["7d", "14d", "30d"]).optional().default("7d"),
});

interface VitalsData {
  heartRate?: number;
  temperature?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  spO2?: number;
}

interface LifestyleData {
  sleepHours?: number;
  stressLevel?: string;
  hydration?: string;
}

interface SymptomsData {
  items?: Array<{ name: string; severity: string }>;
}

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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Validation
    const { searchParams } = new URL(request.url);
    const result = querySchema.safeParse({
      userId: searchParams.get("userId"),
      range: searchParams.get("range") || "7d",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "UserId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const { userId, range } = result.data;

    // 3. Calculate date range
    const days = range === "30d" ? 30 : range === "14d" ? 14 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 4. Fetch health logs for the period
    const healthLogs = await prisma.healthLog.findMany({
      where: {
        userId: userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
      include: {
        RiskAlert: true,
      },
    });

    if (healthLogs.length === 0) {
      return NextResponse.json(
        {
          hasData: false,
          message: `No health logs found for the past ${days} days.`,
          summary: null,
        },
        { headers: corsHeaders }
      );
    }

    // 5. Aggregate symptoms
    const symptomCounts: Record<string, number> = {};
    let totalSymptoms = 0;

    healthLogs.forEach((log) => {
      const symptoms = log.symptoms as SymptomsData;
      if (symptoms?.items) {
        symptoms.items.forEach((item) => {
          symptomCounts[item.name] = (symptomCounts[item.name] || 0) + 1;
          totalSymptoms++;
        });
      }
    });

    const mostCommonSymptoms = Object.entries(symptomCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // 6. Aggregate vitals
    const vitalsAggregates = {
      heartRate: [] as number[],
      temperature: [] as number[],
      bpSystolic: [] as number[],
      bpDiastolic: [] as number[],
      spO2: [] as number[],
    };

    healthLogs.forEach((log) => {
      const vitals = log.vitals as VitalsData;
      if (vitals) {
        if (vitals.heartRate) vitalsAggregates.heartRate.push(vitals.heartRate);
        if (vitals.temperature) vitalsAggregates.temperature.push(vitals.temperature);
        if (vitals.bpSystolic) vitalsAggregates.bpSystolic.push(vitals.bpSystolic);
        if (vitals.bpDiastolic) vitalsAggregates.bpDiastolic.push(vitals.bpDiastolic);
        if (vitals.spO2) vitalsAggregates.spO2.push(vitals.spO2);
      }
    });

    const calculateAverage = (arr: number[]) =>
      arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

    const vitalsAverages = {
      heartRate: calculateAverage(vitalsAggregates.heartRate),
      temperature: calculateAverage(vitalsAggregates.temperature),
      bloodPressure: vitalsAggregates.bpSystolic.length > 0
        ? `${calculateAverage(vitalsAggregates.bpSystolic)}/${calculateAverage(vitalsAggregates.bpDiastolic)}`
        : null,
      spO2: calculateAverage(vitalsAggregates.spO2),
    };

    // 7. Aggregate lifestyle
    const sleepHours: number[] = [];
    const stressLevels: Record<string, number> = { low: 0, moderate: 0, high: 0 };

    healthLogs.forEach((log) => {
      const lifestyle = log.lifestyle as LifestyleData;
      if (lifestyle) {
        if (lifestyle.sleepHours) sleepHours.push(lifestyle.sleepHours);
        if (lifestyle.stressLevel && lifestyle.stressLevel in stressLevels) {
          stressLevels[lifestyle.stressLevel]++;
        }
      }
    });

    // Determine dominant stress level
    const dominantStress = Object.entries(stressLevels)
      .sort(([, a], [, b]) => b - a)[0];

    // 8. Get risk levels distribution
    const riskLevels = healthLogs
      .filter((log) => log.RiskAlert)
      .map((log) => log.RiskAlert!.riskLevel);

    const latestRiskLevel = riskLevels[0] || "NONE";

    // 9. Format response for OnDemand agent consumption
    return NextResponse.json(
      {
        hasData: true,
        period: `Last ${days} days`,
        totalLogs: healthLogs.length,
        summary: {
          symptoms: {
            total: totalSymptoms,
            mostCommon: mostCommonSymptoms.map((s) => `${s.name} (${s.count}x)`).join(", ") || "None reported",
          },
          vitals: {
            avgHeartRate: vitalsAverages.heartRate ? `${vitalsAverages.heartRate} bpm` : "Not recorded",
            avgTemperature: vitalsAverages.temperature ? `${vitalsAverages.temperature}°C` : "Not recorded",
            avgBloodPressure: vitalsAverages.bloodPressure || "Not recorded",
            avgSpO2: vitalsAverages.spO2 ? `${vitalsAverages.spO2}%` : "Not recorded",
          },
          lifestyle: {
            avgSleepHours: calculateAverage(sleepHours) ? `${calculateAverage(sleepHours)} hours` : "Not recorded",
            dominantStressLevel: dominantStress ? dominantStress[0] : "Not recorded",
          },
          riskAssessment: {
            latestLevel: latestRiskLevel,
            assessmentsCount: riskLevels.length,
          },
        },
        latestLogDate: healthLogs[0]?.createdAt || null,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Tool Error [health-summary]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
