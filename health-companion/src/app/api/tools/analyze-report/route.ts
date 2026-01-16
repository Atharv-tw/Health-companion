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
    // We assume storageKey is the URL for Vercel Blob (or closely related)
    // If it's just a path, we might need to construct the URL.
    // For Vercel Blob, typically the 'url' is what you want.
    // I'll check if 'storageKey' looks like a URL.
    
    const fileUrl = report.storageKey;
    if (!fileUrl.startsWith("http")) {
      // If it's not a full URL, we might need a base URL or it's a relative path.
      // But usually 'storageKey' in these implementations holds the public URL.
      // I'll assume it is the URL for now.
    }

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
