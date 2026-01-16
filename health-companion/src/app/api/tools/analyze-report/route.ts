import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { processMedicalDocument } from "@/lib/ondemand-media";

const bodySchema = z.object({
  reportId: z.string().min(1),
  userId: z.string().min(1),
});

// CORS headers for OnDemand to call this endpoint
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-app-secret, apikey",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authorization - check for app secret or OnDemand API key
    const authHeader = request.headers.get("x-app-secret");
    const apiKey = request.headers.get("apikey");
    if (process.env.APP_SECRET && authHeader !== process.env.APP_SECRET && !apiKey) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    // 2. Parse Body
    const body = await request.json();
    const result = bodySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400, headers: corsHeaders });
    }

    const { reportId, userId } = result.data;

    // 3. Fetch Report Metadata
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404, headers: corsHeaders });
    }

    if (report.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized access to report" }, { status: 403, headers: corsHeaders });
    }

    // 4. Process with Media API
    const fileUrl = report.storageKey;

    const analysis = await processMedicalDocument(fileUrl);

    return NextResponse.json({
      reportId: report.id,
      fileName: report.fileName,
      type: report.reportType,
      extractedText: analysis.text,
      metadata: analysis.raw
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("Tool Error [analyze-report]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}
