import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { chat } from "@/lib/ondemand";

// Health Knowledge Agent for report analysis
const REPORT_ANALYSIS_AGENT = "agent-1713962163";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the report with extracted text
    const report = await prisma.report.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Build the analysis query with actual content
    let analysisQuery: string;

    if (report.extractedText) {
      // We have extracted text - send it for analysis
      const textPreview = report.extractedText.length > 4000
        ? report.extractedText.substring(0, 4000) + "...[truncated]"
        : report.extractedText;

      analysisQuery = `Please analyze this medical report "${report.fileName}" and provide:
1. **Summary**: A brief overview of what this report contains
2. **Key Findings**: Important values, measurements, or observations
3. **Explanation**: What these findings mean in simple terms
4. **Areas of Attention**: Any values that appear outside normal ranges (if applicable)
5. **Next Steps**: General recommendations (always include "consult your healthcare provider")

REPORT CONTENT:
${textPreview}

Remember: Do NOT diagnose conditions. Only explain what the values mean and highlight anything that may need professional review.`;
    } else {
      // No extracted text - provide general guidance
      analysisQuery = `A medical report named "${report.fileName}" (${report.reportType || "document"}) was uploaded but I couldn't extract the text content.

Please provide:
1. General guidance on what this type of report typically contains
2. What key values or sections to look for
3. Questions to ask a healthcare provider about this report
4. Reminder to consult a healthcare professional for interpretation`;
    }

    // Get AI analysis using the Health Knowledge agent
    const { response } = await chat(
      null, // New session for analysis
      analysisQuery,
      session.user.id,
      undefined, // No additional health context needed for report analysis
      [REPORT_ANALYSIS_AGENT] // Use specific agent for report analysis
    );

    return NextResponse.json({
      success: true,
      analysis: response.answer,
      reportName: report.fileName,
      hasExtractedText: !!report.extractedText,
      citations: response.citations || [],
    });
  } catch (error) {
    console.error("Report analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze report" },
      { status: 500 }
    );
  }
}
