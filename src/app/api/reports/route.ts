import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createReportSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string(),
  size: z.number().int().positive(),
  storageKey: z.string().url(), // Using storageKey to store the full URL for Blob
  reportType: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
    console.error('Failed to fetch reports:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await req.json();
    const body = createReportSchema.parse(json);

    const report = await prisma.report.create({
      data: {
        ...body,
        userId: session.user.id,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Failed to create report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
