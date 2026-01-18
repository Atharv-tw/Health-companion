import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";

const ONDEMAND_MEDIA_API = "https://api.on-demand.io/media/v1";

// Media Processing Plugin IDs (built-in OnDemand plugins for text extraction)
const MEDIA_PLUGINS = {
  DOCUMENT: "plugin-1713954536", // PDF, DOC processing
  IMAGE: "plugin-1713958591",    // Image OCR processing
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const apiKey = process.env.ONDEMAND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Determine file type
    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";
    const processingPlugin = isImage ? MEDIA_PLUGINS.IMAGE : MEDIA_PLUGINS.DOCUMENT;

    // Step 1: Upload to Vercel Blob first to get a public URL
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Step 2: Send the public URL to OnDemand Media API for text extraction
    const mediaResponse = await fetch(`${ONDEMAND_MEDIA_API}/public/file`, {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: blob.url, // OnDemand expects a URL, not base64
        name: file.name,
        agents: [processingPlugin],
        responseMode: "sync",
        createdBy: "health-companion",
      }),
    });

    let extractedText: string | null = null;
    const fileUrl = blob.url;

    if (mediaResponse.ok) {
      const mediaData = await mediaResponse.json();
      // Get extracted content from OnDemand response
      extractedText = mediaData.data?.context || mediaData.context || null;
    }
    // If not ok, continue without text extraction - file is still stored in Vercel Blob

    // Save to database with extracted text for AI analysis
    const report = await prisma.report.create({
      data: {
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        storageKey: fileUrl,
        reportType: isPDF ? "PDF" : isImage ? "IMAGE" : "DOCUMENT",
        extractedText: extractedText, // Store extracted text for analysis
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        fileName: report.fileName,
        storageKey: report.storageKey,
        hasExtractedText: !!extractedText,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Upload failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
