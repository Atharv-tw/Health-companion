import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Determine which plugin to use based on file type
    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";
    const processingPlugin = isImage ? MEDIA_PLUGINS.IMAGE : MEDIA_PLUGINS.DOCUMENT;

    console.log(`Processing ${file.name} with plugin: ${processingPlugin} (${isImage ? "image" : "document"})`);

    // Upload to OnDemand Media API with processing plugin for text extraction
    const mediaResponse = await fetch(`${ONDEMAND_MEDIA_API}/public/file`, {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: dataUrl,
        name: file.name,
        agents: [processingPlugin], // Use plugin to extract text from document/image
        responseMode: "sync",
        createdBy: "health-companion",
      }),
    });

    if (!mediaResponse.ok) {
      const errorText = await mediaResponse.text();
      console.error("OnDemand Media API error:", errorText);
      return NextResponse.json(
        { error: "Failed to upload to OnDemand", details: errorText },
        { status: 500 }
      );
    }

    const mediaData = await mediaResponse.json();
    console.log("OnDemand upload response:", JSON.stringify(mediaData, null, 2));

    // Get the file URL/ID and extracted content from OnDemand response
    const fileId = mediaData.data?.id || mediaData.id;
    const fileUrl = mediaData.data?.url || mediaData.url || `ondemand://${fileId}`;
    const extractedText = mediaData.data?.context || mediaData.context || null;

    console.log(`Extracted text length: ${extractedText?.length || 0} characters`);

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
      ondemand: mediaData,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: String(error) },
      { status: 500 }
    );
  }
}
