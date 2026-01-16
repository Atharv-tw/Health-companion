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

    // 3. Fetch User Profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        profile: true,
        name: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404, headers: corsHeaders });
    }

    const profile = user.profile as Record<string, unknown> || {};

    // 4. Format
    return NextResponse.json({
      name: user.name || "User",
      age: profile.age || "Not specified",
      gender: profile.gender || "Not specified",
      conditions: profile.conditions || [],
      allergies: profile.allergies || [],
      medications: profile.medications || []
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("Tool Error [user-profile]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}
