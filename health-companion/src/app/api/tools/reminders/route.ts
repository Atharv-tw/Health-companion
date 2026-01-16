import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const querySchema = z.object({
  userId: z.string().min(1),
  type: z.enum(["MEDICINE", "WATER", "SLEEP", "CUSTOM", "all"]).optional().default("all"),
  enabledOnly: z.enum(["true", "false"]).optional().default("true"),
});

interface ScheduleData {
  times?: string[];
  frequency?: string;
  days?: number[];
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
      type: searchParams.get("type") || "all",
      enabledOnly: searchParams.get("enabledOnly") || "true",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "UserId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const { userId, type, enabledOnly } = result.data;

    // 3. Build query filters
    const whereClause: Record<string, unknown> = {
      userId: userId,
    };

    if (type !== "all") {
      whereClause.type = type;
    }

    if (enabledOnly === "true") {
      whereClause.enabled = true;
    }

    // 4. Fetch reminders
    const reminders = await prisma.reminder.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    if (reminders.length === 0) {
      return NextResponse.json(
        {
          hasData: false,
          message: "No reminders found for this user.",
          reminders: [],
        },
        { headers: corsHeaders }
      );
    }

    // 5. Format reminders for OnDemand agent consumption
    const formattedReminders = reminders.map((reminder) => {
      const schedule = reminder.schedule as ScheduleData;
      const times = schedule?.times?.join(", ") || "Not set";
      const frequency = schedule?.frequency || "daily";

      return {
        id: reminder.id,
        type: reminder.type,
        title: reminder.title,
        enabled: reminder.enabled,
        schedule: {
          times: times,
          frequency: frequency,
          description: `${frequency === "daily" ? "Daily" : "Custom"} at ${times}`,
        },
        lastTriggered: reminder.lastTriggeredAt,
      };
    });

    // 6. Group by type for summary
    const byType = {
      MEDICINE: formattedReminders.filter((r) => r.type === "MEDICINE"),
      WATER: formattedReminders.filter((r) => r.type === "WATER"),
      SLEEP: formattedReminders.filter((r) => r.type === "SLEEP"),
      CUSTOM: formattedReminders.filter((r) => r.type === "CUSTOM"),
    };

    // 7. Create a text summary for the AI
    const summaryParts: string[] = [];
    if (byType.MEDICINE.length > 0) {
      summaryParts.push(`Medicine reminders: ${byType.MEDICINE.map((r) => r.title).join(", ")}`);
    }
    if (byType.WATER.length > 0) {
      summaryParts.push(`Water reminders: ${byType.WATER.length} active`);
    }
    if (byType.SLEEP.length > 0) {
      summaryParts.push(`Sleep reminders: ${byType.SLEEP.map((r) => r.title).join(", ")}`);
    }
    if (byType.CUSTOM.length > 0) {
      summaryParts.push(`Custom reminders: ${byType.CUSTOM.map((r) => r.title).join(", ")}`);
    }

    return NextResponse.json(
      {
        hasData: true,
        totalReminders: reminders.length,
        enabledCount: reminders.filter((r) => r.enabled).length,
        summary: summaryParts.length > 0 ? summaryParts.join(". ") : "No active reminders",
        byType: {
          medicine: byType.MEDICINE.length,
          water: byType.WATER.length,
          sleep: byType.SLEEP.length,
          custom: byType.CUSTOM.length,
        },
        reminders: formattedReminders,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Tool Error [reminders]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
