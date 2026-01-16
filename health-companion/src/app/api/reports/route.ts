import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { uploadToKnowledgeBase } from '@/lib/ondemand-media';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // 1. Upload directly to OnDemand Knowledge Base
    // This stores the document in the Vector DB for AI querying
    const { documentId } = await uploadToKnowledgeBase(file, session.user.id);

    // 2. Save metadata to our local DB
    const report = await prisma.report.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        storageKey: documentId, // The OnDemand Document ID is our storage key
        reportType: 'clinical_vector_doc',
      },
    });

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('REPORT_ONDEMAND_INGESTION_ERROR:', error.message || error);
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to ingest document into Vector DB', 
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const reports = await prisma.report.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('REPORT_GET_ERROR', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}