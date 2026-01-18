import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ONDEMAND_API_KEY = process.env.ONDEMAND_API_KEY!;
const MEDICATION_AGENT_ID = "agent-1736960379";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, sessionId } = await req.json();

    // Fetch user's health context
    const [recentLogs, reports, userProfile] = await Promise.all([
      prisma.healthLog.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { RiskAlert: true },
      }),
      prisma.report.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { fileName: true, mimeType: true, createdAt: true, extractedText: true },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { profile: true },
      }),
    ]);

    // Build context for the agent
    const healthContext = {
      recentSymptoms: recentLogs.flatMap((log) => {
        const symptoms = log.symptoms as { items?: Array<{ name: string; severity: string }> };
        return symptoms?.items || [];
      }),
      recentVitals: recentLogs[0]?.vitals || {},
      conditions: (userProfile?.profile as { conditions?: string[] })?.conditions || [],
      allergies: (userProfile?.profile as { allergies?: string[] })?.allergies || [],
      recentReports: reports.map((r) => ({
        name: r.fileName,
        type: r.mimeType,
        date: r.createdAt,
        extractedText: r.extractedText,
      })),
    };

    let currentSessionId = sessionId;

    // Create new session if needed
    if (!currentSessionId) {
      const sessionRes = await fetch(
        "https://api.on-demand.io/chat/v1/sessions",
        {
          method: "POST",
          headers: {
            apikey: ONDEMAND_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pluginIds: [],
            externalUserId: session.user.id,
          }),
        }
      );

      if (!sessionRes.ok) {
        throw new Error("Failed to create session");
      }

      const sessionData = await sessionRes.json();
      currentSessionId = sessionData.data.id;
    }

    // Query the medication agent
    const queryRes = await fetch(
      `https://api.on-demand.io/chat/v1/sessions/${currentSessionId}/query`,
      {
        method: "POST",
        headers: {
          apikey: ONDEMAND_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpointId: MEDICATION_AGENT_ID,
          query: message,
          pluginIds: ["plugin-1712327325", "plugin-1713962163"],
          responseMode: "sync",
          fulfillmentPrompt: `You are a Medication Information Assistant. You help users understand their medications, potential interactions, side effects, and general medication safety.

IMPORTANT SAFETY RULES:
- NEVER recommend specific dosages - always refer to doctor/pharmacist
- NEVER suggest starting, stopping, or changing medications
- NEVER provide diagnosis or treatment recommendations
- Always recommend consulting a healthcare provider or pharmacist for personalized advice
- Flag potential drug interactions as requiring professional verification

WHEN TO SEE A DOCTOR IMMEDIATELY:
- Severe allergic reactions (difficulty breathing, swelling, hives)
- Serious side effects (chest pain, severe dizziness, fainting)
- Signs of overdose or toxicity
- Medication not working or symptoms worsening
- New symptoms after starting a medication
- Suspected drug interactions
- Pregnancy or planning pregnancy while on medications
- Before stopping any prescribed medication
- If unsure about any medication instructions
- Any concerning symptoms while taking medications

EMERGENCY - CALL 911 OR POISON CONTROL:
- Suspected overdose
- Severe allergic reaction (anaphylaxis)
- Loss of consciousness
- Severe difficulty breathing
- Seizures related to medication

User Health Context:
- Known Conditions: ${healthContext.conditions.join(", ") || "None specified"}
- Known Allergies: ${healthContext.allergies.join(", ") || "None specified"}
- Recent Symptoms: ${healthContext.recentSymptoms.map((s) => s.name).join(", ") || "None"}

User Question: ${message}

MANDATORY: End EVERY response with a clear reminder to consult a doctor or pharmacist. For any concerning symptoms or side effects, strongly recommend seeing a doctor immediately. This is non-negotiable.

Provide helpful, general medication information while maintaining safety boundaries.`,
        }),
      }
    );

    if (!queryRes.ok) {
      throw new Error("Failed to query agent");
    }

    const queryData = await queryRes.json();

    return NextResponse.json({
      response: queryData.data.answer,
      sessionId: currentSessionId,
    });
  } catch (error) {
    console.error("Medication API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
