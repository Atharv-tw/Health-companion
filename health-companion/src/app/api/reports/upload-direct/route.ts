import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ONDEMAND_MEDIA_API = "https://api.on-demand.io/media/v1";

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

    // Upload to OnDemand Media API
    const mediaResponse = await fetch(`${ONDEMAND_MEDIA_API}/public/file`, {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: dataUrl,
        name: file.name,
        responseMode: "sync",
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
    console.log("OnDemand upload response:", mediaData);

    // Get the file URL/ID from OnDemand response
    const fileId = mediaData.data?.id || mediaData.id;
    const fileUrl = mediaData.data?.url || mediaData.url || `ondemand://${fileId}`;

    // Save to database
    const report = await prisma.report.create({
      data: {
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        storageKey: fileUrl,
        reportType: file.type.includes("pdf") ? "PDF" : "IMAGE",
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        fileName: report.fileName,
        storageKey: report.storageKey,
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
