import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
    const range = searchParams.get("range") || "7d";

    // Calculate date range
    const days = range === "30d" ? 30 : range === "14d" ? 14 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch health logs for the period
    const healthLogs = await prisma.healthLog.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
      include: {
        riskAlert: true,
      },
    });

    if (healthLogs.length === 0) {
      return NextResponse.json({
        summary: {
          totalLogs: 0,
          dateRange: { start: startDate, end: new Date() },
          symptoms: { mostCommon: [], totalReported: 0 },
          vitals: { averages: {} },
          lifestyle: { averages: {} },
          latestRiskLevel: null,
        },
      });
    }

    // Aggregate symptoms
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

    // Aggregate vitals
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
      bpSystolic: calculateAverage(vitalsAggregates.bpSystolic),
      bpDiastolic: calculateAverage(vitalsAggregates.bpDiastolic),
      spO2: calculateAverage(vitalsAggregates.spO2),
    };

    // Aggregate lifestyle
    const sleepHours: number[] = [];
    const stressLevels: Record<string, number> = { low: 0, moderate: 0, high: 0 };
    const hydrationLevels: Record<string, number> = { poor: 0, adequate: 0, good: 0 };

    healthLogs.forEach((log) => {
      const lifestyle = log.lifestyle as LifestyleData;
      if (lifestyle) {
        if (lifestyle.sleepHours) sleepHours.push(lifestyle.sleepHours);
        if (lifestyle.stressLevel && lifestyle.stressLevel in stressLevels) {
          stressLevels[lifestyle.stressLevel]++;
        }
        if (lifestyle.hydration && lifestyle.hydration in hydrationLevels) {
          hydrationLevels[lifestyle.hydration]++;
        }
      }
    });

    const lifestyleAverages = {
      avgSleepHours: calculateAverage(sleepHours),
      stressDistribution: stressLevels,
      hydrationDistribution: hydrationLevels,
    };

    // Get latest risk level
    const latestWithRisk = healthLogs.find((log) => log.riskAlert);
    const latestRiskLevel = latestWithRisk?.riskAlert?.riskLevel || null;

    // Daily trends for charts
    const dailyTrends = healthLogs.reduce((acc, log) => {
      const date = log.createdAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { date, logs: 0, symptoms: 0 };
      }
      acc[date].logs++;
      const symptoms = log.symptoms as SymptomsData;
      acc[date].symptoms += symptoms?.items?.length || 0;
      return acc;
    }, {} as Record<string, { date: string; logs: number; symptoms: number }>);

    return NextResponse.json({
      summary: {
        totalLogs: healthLogs.length,
        dateRange: { start: startDate, end: new Date() },
        symptoms: {
          mostCommon: mostCommonSymptoms,
          totalReported: totalSymptoms,
        },
        vitals: { averages: vitalsAverages },
        lifestyle: { averages: lifestyleAverages },
        latestRiskLevel,
        dailyTrends: Object.values(dailyTrends).sort((a, b) => a.date.localeCompare(b.date)),
      },
      latestLog: healthLogs[0],
    });
  } catch (error) {
    console.error("Health summary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch health summary" },
      { status: 500 }
    );
  }
}
