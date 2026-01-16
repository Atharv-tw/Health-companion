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

    // 3. Fetch User Profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true, // Only if needed, maybe mask it
        profile: true, // This contains age, conditions, etc.
        name: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = user.profile as any || {};

    // 4. Format
    return NextResponse.json({
      name: user.name || "User",
      age: profile.age || "Not specified",
      gender: profile.gender || "Not specified",
      conditions: profile.conditions || [],
      allergies: profile.allergies || [],
      medications: profile.medications || []
    });

  } catch (error) {
    console.error("Tool Error [user-profile]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
