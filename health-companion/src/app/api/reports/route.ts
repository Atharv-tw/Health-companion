import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createReportSchema = z.object({
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  storageKey: z.string(), // This will be the Vercel Blob URL
  reportType: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { fileName, mimeType, size, storageKey, reportType } = createReportSchema.parse(body);

    const report = await prisma.report.create({
      data: {
        userId: session.user.id,
        fileName,
        mimeType,
        size,
        storageKey,
        reportType: reportType || 'vercel_blob_doc',
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    console.error('REPORT_POST_ERROR', error);
    return new NextResponse('Internal Error', { status: 500 });
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
