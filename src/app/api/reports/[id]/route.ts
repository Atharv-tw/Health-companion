import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { del } from '@vercel/blob';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const report = await prisma.report.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (report.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete from Vercel Blob
    // storageKey holds the full URL in our implementation
    if (report.storageKey) {
        await del(report.storageKey);
    }

    // Delete from Database
    await prisma.report.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    const session = await getServerSession(authOptions);
  
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      const report = await prisma.report.findUnique({
        where: {
          id: params.id,
        },
      });
  
      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }
  
      if (report.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
  
      // Since we are using public access for MVP, we just return the URL (storageKey)
      // If private, we would generate a signed URL here.
      return NextResponse.json({ 
          ...report,
          url: report.storageKey 
      });

    } catch (error) {
      console.error('Failed to fetch report:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
