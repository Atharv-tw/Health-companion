import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkSafety, getFallbackResponse, validateAIResponse } from "@/lib/safety-gate";
import { getEmergencyResponse } from "@/lib/emergency-templates";
import { chat, formatResponseWithCitations } from "@/lib/ondemand";
import { z } from "zod";

const chatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  sessionId: z.string().optional(),
});

// Interfaces for health data
interface SymptomsData {
  items?: Array<{ name: string; severity: string; duration?: string }>;
  freeText?: string;
}

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

interface UserProfile {
  age?: number;
  conditions?: string[];
  allergies?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, sessionId } = chatRequestSchema.parse(body);

    // Step 1: Run safety check on user input
    const safetyCheck = checkSafety(message);

    // Handle emergency escalation
    if (safetyCheck.result === "EMERGENCY_ESCALATE") {
      // Get appropriate emergency response
      const emergencyResponse = getEmergencyResponse(message);

      // Save to database
      let chatSession = sessionId
        ? await prisma.chatSession.findFirst({
            where: { id: sessionId, userId: session.user.id },
          })
        : null;

      if (!chatSession) {
        chatSession = await prisma.chatSession.create({
          data: { userId: session.user.id },
        });
      }

      // Save messages
      await prisma.chatMessage.createMany({
        data: [
          { sessionId: chatSession.id, role: "user", content: message },
          { sessionId: chatSession.id, role: "assistant", content: emergencyResponse },
        ],
      });

      return NextResponse.json({
        response: emergencyResponse,
        sessionId: chatSession.id,
        safetyResult: "EMERGENCY_ESCALATE",
        shouldTriggerSOS: safetyCheck.shouldTriggerSOS,
      });
    }

    // Handle blocked unsafe content
    if (safetyCheck.result === "BLOCK_UNSAFE") {
      const blockedResponse = safetyCheck.suggestedResponse || getFallbackResponse(message);

      // Save to database
      let chatSession = sessionId
        ? await prisma.chatSession.findFirst({
            where: { id: sessionId, userId: session.user.id },
          })
        : null;

      if (!chatSession) {
        chatSession = await prisma.chatSession.create({
          data: { userId: session.user.id },
        });
      }

      await prisma.chatMessage.createMany({
        data: [
          { sessionId: chatSession.id, role: "user", content: message },
          { sessionId: chatSession.id, role: "assistant", content: blockedResponse },
        ],
      });

      return NextResponse.json({
        response: blockedResponse,
        sessionId: chatSession.id,
        safetyResult: "BLOCK_UNSAFE",
        reason: safetyCheck.reason,
      });
    }

    // Step 2: Get user profile and health context for AI
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, profile: true },
    });

    const recentLogs = await prisma.healthLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { riskAlert: true },
    });

    // Get recent conversation history for continuity
    const recentMessages = await prisma.chatMessage.findMany({
      where: {
        session: { userId: session.user.id },
      },
      orderBy: { createdAt: "desc" },
      take: 6, // Last 3 exchanges (user + assistant)
    });

    // Build comprehensive health context
    const userProfile = user?.profile as UserProfile | null;
    const healthParts: string[] = [];

    // Add user profile info
    if (userProfile) {
      if (userProfile.age) healthParts.push(`Age: ${userProfile.age}`);
      if (userProfile.conditions?.length) {
        healthParts.push(`Known conditions: ${userProfile.conditions.join(", ")}`);
      }
      if (userProfile.allergies?.length) {
        healthParts.push(`Allergies: ${userProfile.allergies.join(", ")}`);
      }
    }

    // Add recent health logs with details
    if (recentLogs.length > 0) {
      const logSummaries = recentLogs.map((log) => {
        const parts: string[] = [];
        const symptoms = log.symptoms as SymptomsData;
        const vitals = log.vitals as VitalsData | null;
        const lifestyle = log.lifestyle as LifestyleData | null;

        // Symptoms
        if (symptoms?.items?.length) {
          parts.push(`Symptoms: ${symptoms.items.map((s) => `${s.name} (${s.severity})`).join(", ")}`);
        }
        if (symptoms?.freeText) {
          parts.push(`Notes: ${symptoms.freeText}`);
        }

        // Vitals
        if (vitals) {
          const vitalParts: string[] = [];
          if (vitals.heartRate) vitalParts.push(`HR: ${vitals.heartRate}`);
          if (vitals.temperature) vitalParts.push(`Temp: ${vitals.temperature}°F`);
          if (vitals.bpSystolic && vitals.bpDiastolic) {
            vitalParts.push(`BP: ${vitals.bpSystolic}/${vitals.bpDiastolic}`);
          }
          if (vitals.spO2) vitalParts.push(`SpO2: ${vitals.spO2}%`);
          if (vitalParts.length) parts.push(`Vitals: ${vitalParts.join(", ")}`);
        }

        // Lifestyle
        if (lifestyle) {
          const lifeParts: string[] = [];
          if (lifestyle.sleepHours) lifeParts.push(`Sleep: ${lifestyle.sleepHours}hrs`);
          if (lifestyle.stressLevel) lifeParts.push(`Stress: ${lifestyle.stressLevel}`);
          if (lifestyle.hydration) lifeParts.push(`Hydration: ${lifestyle.hydration}`);
          if (lifeParts.length) parts.push(lifeParts.join(", "));
        }

        // Risk alert
        if (log.riskAlert) {
          parts.push(`Risk: ${log.riskAlert.riskLevel}`);
        }

        return parts.join(" | ");
      });

      healthParts.push(`Recent health logs:\n${logSummaries.join("\n")}`);
    }

    // Add conversation history summary
    if (recentMessages.length > 0) {
      const historyText = recentMessages
        .reverse()
        .map((m) => `${m.role}: ${m.content.substring(0, 100)}${m.content.length > 100 ? "..." : ""}`)
        .join("\n");
      healthParts.push(`Recent conversation:\n${historyText}`);
    }

    const healthContext = healthParts.length > 0
      ? {
          healthSummary: healthParts.join("\n\n"),
          recentSymptoms: recentLogs.flatMap((log) => {
            const symptoms = log.symptoms as SymptomsData;
            return symptoms?.items?.map((s) => s.name) || [];
          }),
          userName: user?.name || undefined,
        }
      : undefined;

    // Step 3: Get or create chat session in database
    let chatSession = sessionId
      ? await prisma.chatSession.findFirst({
          where: { id: sessionId, userId: session.user.id },
        })
      : null;

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: { userId: session.user.id },
      });
    }

    // Step 4: Try to get response from OnDemand
    let aiResponse: string;
    let citations: Array<{ source: string; title?: string }> = [];

    try {
      // Check if OnDemand API key is configured
      if (!process.env.ONDEMAND_API_KEY) {
        throw new Error("OnDemand API not configured");
      }

      const { response, sessionId: activeSessionId } = await chat(
        chatSession.ondemandSessionId,
        message,
        session.user.id,
        healthContext
      );

      // Update OnDemand session ID if new
      if (activeSessionId && activeSessionId !== chatSession.ondemandSessionId) {
        await prisma.chatSession.update({
          where: { id: chatSession.id },
          data: { ondemandSessionId: activeSessionId },
        });
      }

      // Validate AI response for safety
      const responseValidation = validateAIResponse(response.answer);
      if (!responseValidation.safe) {
        // AI response failed safety check, use fallback
        aiResponse = getFallbackResponse(message);
      } else {
        aiResponse = formatResponseWithCitations(response);
        citations = response.citations || [];
      }
    } catch (error) {
      // OnDemand unavailable, use fallback
      console.error("OnDemand error:", error);
      aiResponse = getFallbackResponse(message);
    }

    // Step 5: Save messages to database
    await prisma.chatMessage.createMany({
      data: [
        { sessionId: chatSession.id, role: "user", content: message },
        {
          sessionId: chatSession.id,
          role: "assistant",
          content: aiResponse,
          citations: citations.length > 0 ? citations : undefined,
        },
      ],
    });

    return NextResponse.json({
      response: aiResponse,
      sessionId: chatSession.id,
      safetyResult: "ALLOW",
      citations,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

// GET - Retrieve chat history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      // Get specific session with messages
      const chatSession = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId: session.user.id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!chatSession) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      return NextResponse.json({ session: chatSession });
    }

    // Get all sessions for user
    const sessions = await prisma.chatSession.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Get chat error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}
